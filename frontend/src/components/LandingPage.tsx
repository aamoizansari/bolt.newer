import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Sparkles, Zap, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/editor', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center space-x-2">
          <Code className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">WebBuilder</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Build Websites with AI
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your ideas into beautiful, functional websites using the power of artificial intelligence. 
            Just describe what you want, and watch it come to life.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <Sparkles className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-400">Advanced AI understands your requirements and generates professional code</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <Zap className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Go from idea to working website in seconds, not hours</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <Globe className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
            <p className="text-gray-400">Clean, optimized code that's ready for deployment</p>
          </div>
        </div>

        {/* Prompt Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8">
              <label htmlFor="prompt" className="block text-lg font-medium mb-4">
                Describe the website you want to build:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create a modern portfolio website with a hero section, about me page, project showcase, and contact form. Use a blue and white color scheme with smooth animations..."
                className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-400">
                  Be as specific as possible for better results
                </p>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Generate Website</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-gray-400 border-t border-gray-800">
        <p>&copy; 2025 WebBuilder. Powered by AI.</p>
      </footer>
    </div>
  );
};

export default LandingPage;