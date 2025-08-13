/**
 * Parse input XML and convert it into steps.
 * Eg: Input XML:
 *  <boltArtifact id=\"course-selling-platform\" title=\"Course Selling Platform Frontend\">\n
 *    <boltAction type=\"file\" filePath=\"src/types/index.ts\">
 *      \nexport interface Course {\n  id: string;\n  title: string;\n  instructor: string;\n  price: number;\n  thumbnail: string;\n  duration: string;\n  level: 'Beginner' | 'Intermediate' | 'Advanced';\n  rating: number;\n  studentsEnrolled: number;\n  description: string;\n}
 *    </boltAction>
 *  <boltAction type=\"shell\">\nnpm run dev\n</boltAction>
 * </boltArtifact>
 *
 * Output:
 * [{
 *  title: "Course Selling Platform Frontend",
 * status: "pending",
 * },
 * {
 * title: "Create src/types/index.ts",
 * type: StepType.CreateFile,
 * code: "*      \nexport interface Course {\n  id: string;\n  title: string;\n  instructor: string;\n  price: number;\n  thumbnail: string;\n  duration: string;\n  level: 'Beginner' | 'Intermediate' | 'Advanced';\n  rating: number;\n  studentsEnrolled: number;\n  description: string;\n}" 
 * },
 * {
 * title: "Run npm run dev",
 * type: StepType.RunScript,
 * code: "npm run dev"
 * }
 * ]
 * 
 * The input can have strings in the middle, they need to be ignored.
 *
 */

import { Step,StepType } from "./types";

// Alternative implementation using regex for environments without DOMParser
export function parseXml(response: string): Step[] {
  const steps: Step[] = [];
  let stepId = 0;

  // Extract boltArtifact title
  const artifactMatch = response.match(/<boltArtifact[^>]*title="([^"]*)"[^>]*>/);
  if (artifactMatch) {
    const title = artifactMatch[1];
    steps.push({
      id: stepId++,
      title: title,
      description: `Create ${title}`,
      type: StepType.CreateFolder,
      status: 'pending'
    });
  }

  // Extract all boltAction elements
  const actionRegex = /<boltAction[^>]*type="([^"]*)"(?:[^>]*filePath="([^"]*)")?[^>]*>([\s\S]*?)<\/boltAction>/g;
  let match;

  while ((match = actionRegex.exec(response)) !== null) {
    const [, type, filePath, content] = match;
    const cleanContent = content.trim();

    let stepType: StepType;
    let stepTitle: string;
    let stepDescription: string;
    let stepPath: string | null;

    switch (type.toLowerCase()) {
      case 'file':
        stepType = StepType.CreateFile;
        stepTitle = filePath ? `Create ${filePath}` : 'Create file';
        stepDescription = filePath ? `Create file: ${filePath}` : 'Create a new file';
        stepPath = filePath;
        break;
      
      case 'folder':
        stepType = StepType.CreateFolder;
        stepTitle = filePath ? `Create folder ${filePath}` : 'Create folder';
        stepDescription = filePath ? `Create folder: ${filePath}` : 'Create a new folder';
        stepPath = filePath;
        break;
      
      case 'edit':
        stepType = StepType.EditFile;
        stepTitle = filePath ? `Edit ${filePath}` : 'Edit file';
        stepDescription = filePath ? `Edit file: ${filePath}` : 'Edit a file';
        stepPath = filePath;         
        break;
      
      case 'delete':
        stepType = StepType.DeleteFile;
        stepTitle = filePath ? `Delete ${filePath}` : 'Delete file';
        stepDescription = filePath ? `Delete file: ${filePath}` : 'Delete a file';
        stepPath = filePath;
        break;
      
      case 'shell':
      case 'script':
        stepType = StepType.RunScript;
        const command = cleanContent.split('\n')[0] || cleanContent;
        stepTitle = `Run ${command}`;
        stepDescription = `Execute shell command: ${command}`;
        stepPath = null;
        break;
      
      default:
        stepType = StepType.CreateFile;
        stepTitle = `Unknown action: ${type}`;
        stepDescription = `Process action of type: ${type}`;
        stepPath = null;
    }

    steps.push({
      id: stepId++,
      title: stepTitle,
      description: stepDescription,
      type: stepType,
      status: 'pending',
      code: cleanContent || undefined,
      path: stepPath || undefined
    });
  }

  return steps;
}

// Example usage:
/*
const xmlInput = `<boltArtifact id="course-selling-platform" title="Course Selling Platform Frontend">
  <boltAction type="file" filePath="src/types/index.ts">
export interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  thumbnail: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  studentsEnrolled: number;
  description: string;
}
  </boltAction>
  <boltAction type="shell">
npm run dev
  </boltAction>
</boltArtifact>`;

const steps = parseXml(xmlInput);
console.log(steps);
*/
