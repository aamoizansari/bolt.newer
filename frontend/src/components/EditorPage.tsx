import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code, ArrowLeft, Play, FileText, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import Monaco from '@monaco-editor/react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Step,File } from '../types';
import { parseXml } from '../steps';



const EditorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1]));

  const prompt = location.state?.prompt || '';

  // Mock data for demonstration
  const [steps, setSteps] = useState<Step[]>([]);

  const [files] = useState<File[]>([
    { 
      id: 1, 
      name: 'src', 
      type: 'folder',
      children: [
        { id: 2, name: 'App.tsx', type: 'file', parentId: 1, content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">\n      <header className="container mx-auto px-6 py-8">\n        <h1 className="text-4xl font-bold text-center">Welcome to Your Website</h1>\n      </header>\n      <main className="container mx-auto px-6 py-16">\n        <div className="text-center">\n          <p className="text-xl mb-8">This is your AI-generated website!</p>\n          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">\n            Get Started\n          </button>\n        </div>\n      </main>\n    </div>\n  );\n}\n\nexport default App;` },
        { 
          id: 5, 
          name: 'components', 
          type: 'folder', 
          parentId: 1,
          children: [
            { id: 6, name: 'Header.tsx', type: 'file', parentId: 5, content: `import React from 'react';\n\nconst Header: React.FC = () => {\n  return (\n    <header className="bg-gray-800 text-white p-4">\n      <h1 className="text-2xl font-bold">My Website</h1>\n    </header>\n  );\n};\n\nexport default Header;` },
            { id: 7, name: 'Footer.tsx', type: 'file', parentId: 5, content: `import React from 'react';\n\nconst Footer: React.FC = () => {\n  return (\n    <footer className="bg-gray-800 text-white p-4 text-center">\n      <p>&copy; 2025 My Website. All rights reserved.</p>\n    </footer>\n  );\n};\n\nexport default Footer;` }
          ]
        },
        { id: 8, name: 'styles.css', type: 'file', parentId: 1, content: `/* Global Styles */\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  line-height: 1.6;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}` }
      ]
    },
    { id: 3, name: 'index.html', type: 'file', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>AI Generated Website</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>` },
    { id: 4, name: 'package.json', type: 'file', content: `{\n  "name": "ai-generated-website",\n  "version": "1.0.0",\n  "description": "An AI-generated website",\n  "main": "index.js",\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}` }
  ]);

  async function init() {
    const response  = await axios.post(`${BACKEND_URL}/template`, { prompt });

    const {prompts, uiPrompt, template} = response.data;

    // Parse the XML response to extract steps
    const parsedSteps = parseXml(uiPrompt);
    setSteps(parsedSteps.map((step, index) => ({
      ...step,
      status: "completed",      
    })));



    //Make a call to chats endpoint to send prompt to the llm
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content, index) => ({
        role: 'user',
        content,
      })),      
    });



  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // Find the first file in the structure
    const findFirstFile = (fileList: File[]): File | null => {
      for (const file of fileList) {
        if (file.type === 'file') {
          return file;
        }
        if (file.children) {
          const childFile = findFirstFile(file.children);
          if (childFile) return childFile;
        }
      }
      return null;
    };

    const firstFile = findFirstFile(files);
    if (firstFile) {
      setSelectedFile(firstFile);
    }
  }, [files]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFileTree = (fileList: File[], depth = 0) => {
    return fileList.map((file) => (
      <div key={file.id}>
        <button
          onClick={() => {
            if (file.type === 'folder') {
              toggleFolder(file.id);
            } else {
              setSelectedFile(file);
            }
          }}
          className={`w-full text-left p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
            selectedFile?.id === file.id ? 'bg-blue-900/30 border border-blue-700' : ''
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {file.type === 'folder' ? (
            <>
              {expandedFolders.has(file.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {expandedFolders.has(file.id) ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )}
            </>
          ) : (
            <>
              <div className="w-4 h-4" />
              <FileText className="w-4 h-4 text-gray-400" />
            </>
          )}
          <span className="text-sm">{file.name}</span>
        </button>
        {file.type === 'folder' && file.children && expandedFolders.has(file.id) && (
          <div>
            {renderFileTree(file.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderPreview = () => {
    if (!selectedFile?.content) return <div className="text-gray-400">Select a file to preview</div>;
    
    // Simple preview for HTML/React content
    if (selectedFile.name.endsWith('.tsx') || selectedFile.name.endsWith('.html')) {
      return (
        <div className="w-full h-full bg-white">
          <iframe
            srcDoc={`
              <html>
                <head>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
                  </style>
                </head>
                <body>
                  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                    <header class="container mx-auto px-6 py-8">
                      <h1 class="text-4xl font-bold text-center">Welcome to Your Website</h1>
                    </header>
                    <main class="container mx-auto px-6 py-16">
                      <div class="text-center">
                        <p class="text-xl mb-8">This is your AI-generated website!</p>
                        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                          Get Started
                        </button>
                      </div>
                    </main>
                  </div>
                </body>
              </html>
            `}
            className="w-full h-full border-0"
            title="Preview"
          />
        </div>
      );
    }
    
    return (
      <div className="p-4 text-gray-400">
        Preview not available for this file type
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">WebBuilder</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Play className="w-4 h-4" />
              <span>Deploy</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Steps Section - 25% */}
        <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ChevronRight className="w-5 h-5 mr-2" />
            Generation Steps
          </h2>
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  step.status === 'completed'
                    ? 'bg-green-900/30 border border-green-700'
                    : step.status === 'current'
                    ? 'bg-blue-900/30 border border-blue-700'
                    : 'bg-gray-700/30 border border-gray-600'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : step.status === 'current'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-500'
                  }`}
                />
                <span className="text-sm">{step.title}</span>
              </div>
            ))}
          </div>
          
          {/* Prompt Display */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Original Prompt:</h3>
            <div className="bg-gray-700/50 rounded-lg p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
              {prompt}
            </div>
          </div>
        </div>

        {/* Files Section - 25% */}
        <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Folder className="w-5 h-5 mr-2" />
            Files
          </h2>
          <div className="space-y-1">
            {renderFileTree(files)}
          </div>
        </div>

        {/* Code/Preview Section - 50% */}
        <div className="w-1/2 flex flex-col">
          {/* Tab Bar */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-gray-900">
            {activeTab === 'code' ? (
              selectedFile ? (
                <Monaco
                  height="100%"
                  language={
                    selectedFile.name.endsWith('.tsx') || selectedFile.name.endsWith('.ts')
                      ? 'typescript'
                      : selectedFile.name.endsWith('.html')
                      ? 'html'
                      : selectedFile.name.endsWith('.css')
                      ? 'css'
                      : 'plaintext'
                  }
                  value={selectedFile.content || ''}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Select a file to view its code
                </div>
              )
            ) : (
              renderPreview()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;