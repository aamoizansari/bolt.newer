import { File, Step, StepType } from "../types";

/**
 * Recursively searches for a file or folder by its full path
 * @param path - The full path to search for (e.g., "/src/components/Header.tsx")
 * @param files - The array of files to search through
 * @returns The found file/folder or null if not found
 */
export function findFileByPath(path: string, files: File[]): File | null {
  for (const file of files) {
    // Check if current file matches the path
    if (file.path === path) {
      return file;
    }

    // If it's a folder with children, recursively search children
    if (file.type === "folder" && file.children) {
      const found = findFileByPath(path, file.children);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Parses a file path to extract components and parent information
 * @param path - The full path to parse (e.g., "/src/components/Header.tsx")
 * @returns Object containing path components and parent information
 */
export function parsePath(path: string): {
  fullPath: string;
  fileName: string;
  parentPath: string;
  pathSegments: string[];
} {
  // Normalize path by removing leading/trailing slashes and splitting
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  const pathSegments = normalizedPath ? normalizedPath.split("/") : [];

  // Extract filename (last segment)
  const fileName =
    pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "";

  // Calculate parent path
  let parentPath = "";
  if (pathSegments.length > 1) {
    parentPath = "/" + pathSegments.slice(0, -1).join("/");
  } else if (pathSegments.length === 1) {
    parentPath = "/";
  }

  return {
    fullPath: path,
    fileName,
    parentPath,
    pathSegments,
  };
}

/**
 * Generates a unique ID for files and folders
 * Uses a simple hash of the path for consistent IDs
 * @param path - The file path to generate ID from
 * @returns A unique numeric ID based on path
 */
export function generateUniqueId(path: string): number {
  // Simple hash function to convert path to numeric ID
  let hash = 0;
  for (let i = 0; i < path.length; i++) {
    const char = path.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Ensures all parent folders exist for a given path, creating them if necessary
 * @param path - The full path that needs parent folders (e.g., "/src/components/Header.tsx")
 * @param files - The current array of files
 * @returns Updated files array with all necessary parent folders created
 */
export function ensureParentFolders(path: string, files: File[]): File[] {
  const { parentPath, pathSegments } = parsePath(path);

  // If no parent path needed (root level file), return files unchanged
  if (!parentPath || parentPath === "/") {
    return files;
  }

  // Create a copy of files array to avoid mutation
  let updatedFiles = [...files];

  // Build all required parent folder paths
  const requiredFolderPaths: string[] = [];
  for (let i = 1; i < pathSegments.length; i++) {
    const folderPath = "/" + pathSegments.slice(0, i).join("/");
    requiredFolderPaths.push(folderPath);
  }

  // Create missing parent folders in order (from root to deepest)
  for (const folderPath of requiredFolderPaths) {
    // Check if folder already exists
    if (!findFileByPath(folderPath, updatedFiles)) {
      const { fileName: folderName, parentPath: folderParentPath } =
        parsePath(folderPath);

      // Find parent folder to determine parentId
      let parentId: number | undefined;
      if (folderParentPath && folderParentPath !== "/") {
        const parentFolder = findFileByPath(folderParentPath, updatedFiles);
        if (parentFolder) {
          parentId = parentFolder.id;
        }
      }

      // Create the new folder
      const newFolder: File = {
        id: generateUniqueId(folderPath),
        name: folderName,
        type: "folder",
        path: folderPath,
        children: [],
        parentId,
      };

      // Add folder to the appropriate location in the tree
      if (parentId) {
        // Find parent and add to its children
        const addToParent = (fileList: File[]): File[] => {
          return fileList.map((file) => {
            if (file.id === parentId) {
              return {
                ...file,
                children: [...(file.children || []), newFolder],
              };
            } else if (file.children) {
              return {
                ...file,
                children: addToParent(file.children),
              };
            }
            return file;
          });
        };
        updatedFiles = addToParent(updatedFiles);
      } else {
        // Add to root level
        updatedFiles.push(newFolder);
      }
    }
  }

  return updatedFiles;
}

/**
 * Creates a file object with proper attributes and relationships
 * @param path - The full path for the file (e.g., "/src/components/Header.tsx")
 * @param content - Optional content for the file
 * @param files - Current files array to determine parent relationships
 * @returns A new File object with proper attributes
 */
export function createFile(path: string, content: string = "", files: File[]): File {
  const { fileName } = parsePath(path);
  
  // Find parent folder to determine parentId
  let parentId: number | undefined;
  const { parentPath } = parsePath(path);
  
  if (parentPath && parentPath !== "/") {
    const parentFolder = findFileByPath(parentPath, files);
    if (parentFolder) {
      parentId = parentFolder.id;
    }
  }

  return {
    id: generateUniqueId(path),
    name: fileName,
    type: "file",
    content,
    path,
    parentId,
  };
}

/**
 * Creates a folder object with proper attributes and empty children array
 * @param path - The full path for the folder (e.g., "/src/components")
 * @param files - Current files array to determine parent relationships
 * @returns A new File object representing a folder with empty children array
 */
export function createFolder(path: string, files: File[]): File {
  const { fileName } = parsePath(path);
  
  // Find parent folder to determine parentId
  let parentId: number | undefined;
  const { parentPath } = parsePath(path);
  
  if (parentPath && parentPath !== "/") {
    const parentFolder = findFileByPath(parentPath, files);
    if (parentFolder) {
      parentId = parentFolder.id;
    }
  }

  return {
    id: generateUniqueId(path),
    name: fileName,
    type: "folder",
    path,
    children: [],
    parentId,
  };
}

/**
 * Checks if a file or folder already exists at the given path
 * @param path - The full path to check for duplicates
 * @param files - The current array of files to search through
 * @returns true if a file/folder already exists at the path, false otherwise
 */
export function isDuplicate(path: string, files: File[]): boolean {
  return findFileByPath(path, files) !== null;
}

/**
 * Creates a file if it doesn't already exist, otherwise returns null
 * @param path - The full path for the file
 * @param content - Optional content for the file
 * @param files - Current files array to check for duplicates and determine parent relationships
 * @returns A new File object if created, or null if duplicate exists
 */
export function createFileIfNotExists(path: string, content: string = "", files: File[]): File | null {
  // Check for duplicate first
  if (isDuplicate(path, files)) {
    return null; // File already exists, skip creation
  }
  
  return createFile(path, content, files);
}

/**
 * Creates a folder if it doesn't already exist, otherwise returns null
 * @param path - The full path for the folder
 * @param files - Current files array to check for duplicates and determine parent relationships
 * @returns A new File object representing a folder if created, or null if duplicate exists
 */
export function createFolderIfNotExists(path: string, files: File[]): File | null {
  // Check for duplicate first
  if (isDuplicate(path, files)) {
    return null; // Folder already exists, skip creation
  }
  
  return createFolder(path, files);
}

/**
 * Processes a single step with duplicate detection and handling
 * @param step - The step to process (CreateFile or CreateFolder)
 * @param files - Current files array
 * @returns Object containing the updated step (marked as completed if duplicate) and created file/folder (if any)
 */
export function processStepWithDuplicateHandling(
  step: Step, 
  files: File[]
): { updatedStep: Step; createdFile: File | null } {
  // Only process CreateFile and CreateFolder steps
  if (step.type !== StepType.CreateFile && step.type !== StepType.CreateFolder) {
    return { updatedStep: step, createdFile: null };
  }

  // Step must have a path
  if (!step.path) {
    return { updatedStep: step, createdFile: null };
  }

  let createdFile: File | null = null;
  let updatedStep: Step = { ...step };

  // Check if file/folder already exists (duplicate detection)
  if (isDuplicate(step.path, files)) {
    // Mark step as completed since the file/folder already exists
    updatedStep = {
      ...step,
      status: 'completed'
    };
  } else {
    // Create the file or folder
    if (step.type === StepType.CreateFile) {
      createdFile = createFile(step.path, step.code || "", files);
    } else if (step.type === StepType.CreateFolder) {
      createdFile = createFolder(step.path, files);
    }

    // Mark step as completed after successful creation
    if (createdFile) {
      updatedStep = {
        ...step,
        status: 'completed'
      };
    }
  }

  return { updatedStep, createdFile };
}

/**
 * Processes multiple steps with duplicate detection, returning updated files and steps
 * @param steps - Array of steps to process
 * @param files - Current files array
 * @returns Object containing updated files array and updated steps array
 */
export function processStepsWithDuplicateHandling(
  steps: Step[], 
  files: File[]
): { updatedFiles: File[]; updatedSteps: Step[] } {
  let updatedFiles = [...files];
  const updatedSteps: Step[] = [];

  for (const step of steps) {
    // Only process pending CreateFile and CreateFolder steps
    if (
      step.status === 'pending' && 
      (step.type === StepType.CreateFile || step.type === StepType.CreateFolder)
    ) {
      // Ensure parent folders exist before creating file/folder
      if (step.path) {
        updatedFiles = ensureParentFolders(step.path, updatedFiles);
      }

      // Process the step with duplicate detection
      const { updatedStep, createdFile } = processStepWithDuplicateHandling(step, updatedFiles);
      
      // Add created file to the files array if it was created
      if (createdFile) {
        // Add file to the appropriate location in the tree
        if (createdFile.parentId) {
          // Find parent and add to its children
          const addToParent = (fileList: File[]): File[] => {
            return fileList.map((file) => {
              if (file.id === createdFile.parentId) {
                return {
                  ...file,
                  children: [...(file.children || []), createdFile],
                };
              } else if (file.children) {
                return {
                  ...file,
                  children: addToParent(file.children),
                };
              }
              return file;
            });
          };
          updatedFiles = addToParent(updatedFiles);
        } else {
          // Add to root level
          updatedFiles.push(createdFile);
        }
      }

      updatedSteps.push(updatedStep);
    } else {
      // Keep non-target steps unchanged
      updatedSteps.push(step);
    }
  }

  return { updatedFiles, updatedSteps };
}

/**
 * Synchronizes file content with step code properties
 * Updates existing files when their corresponding step code changes
 * @param steps - Array of steps that may contain code to sync
 * @param files - Current files array to update
 * @returns Updated files array with synchronized content
 */
export function syncFileContent(steps: Step[], files: File[]): File[] {
  // Helper function to recursively update file content in the tree
  const updateFileContent = (fileList: File[]): File[] => {
    return fileList.map((file) => {
      // Only process files (not folders)
      if (file.type === 'file') {
        // Find corresponding step by matching path
        const matchingStep = steps.find(step => 
          step.path === file.path && 
          (step.type === StepType.CreateFile || step.type === StepType.EditFile)
        );

        if (matchingStep) {
          // Update file content with step code, or empty string if no code
          const newContent = matchingStep.code || '';
          
          // Only update if content has actually changed to avoid unnecessary re-renders
          if (file.content !== newContent) {
            return {
              ...file,
              content: newContent
            };
          }
        }
      }

      // If it's a folder with children, recursively update children
      if (file.type === 'folder' && file.children) {
        const updatedChildren = updateFileContent(file.children);
        
        // Only create new object if children actually changed
        if (updatedChildren !== file.children) {
          return {
            ...file,
            children: updatedChildren
          };
        }
      }

      // Return unchanged file if no updates needed
      return file;
    });
  };

  return updateFileContent(files);
}

/**
 * Main step processing function that orchestrates file/folder creation
 * Filters pending CreateFile and CreateFolder steps and processes them with duplicate handling
 * @param steps - Array of all steps to process
 * @param files - Current files array
 * @returns Object containing updated files array and steps with completed status
 */
export function processSteps(steps: Step[], files: File[]): { updatedFiles: File[]; updatedSteps: Step[] } {
  // Filter steps to only process pending CreateFile and CreateFolder steps
  const pendingFileSteps = steps.filter(step => 
    step.status === 'pending' && 
    (step.type === StepType.CreateFile || step.type === StepType.CreateFolder)
  );

  // If no pending file/folder steps, return original arrays
  if (pendingFileSteps.length === 0) {
    return { updatedFiles: files, updatedSteps: steps };
  }

  // Process the filtered steps using the existing utility function
  const { updatedFiles, updatedSteps: processedSteps } = processStepsWithDuplicateHandling(
    pendingFileSteps, 
    files
  );

  // Merge processed steps back with the original steps array
  const finalSteps = steps.map(originalStep => {
    // Find if this step was processed
    const processedStep = processedSteps.find(processed => processed.id === originalStep.id);
    return processedStep || originalStep;
  });

  return { 
    updatedFiles, 
    updatedSteps: finalSteps 
  };
}
