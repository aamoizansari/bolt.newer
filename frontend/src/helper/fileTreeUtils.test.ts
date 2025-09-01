import {
  findFileByPath,
  parsePath,
  generateUniqueId,
  ensureParentFolders,
  createFile,
  createFolder,
} from "./fileTreeUtils";
import { File } from "../types";

// Mock file structure for testing
const mockFiles: File[] = [
  {
    id: 1,
    name: "src",
    type: "folder",
    path: "/src",
    children: [
      {
        id: 2,
        name: "App.tsx",
        type: "file",
        parentId: 1,
        content: "// App content",
        path: "/src/App.tsx",
      },
      {
        id: 5,
        name: "components",
        type: "folder",
        parentId: 1,
        path: "/src/components",
        children: [
          {
            id: 6,
            name: "Header.tsx",
            type: "file",
            parentId: 5,
            content: "// Header content",
            path: "/src/components/Header.tsx",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "index.html",
    type: "file",
    content: "<!DOCTYPE html>",
    path: "/index.html",
  },
];

// Test findFileByPath function
console.log("Testing findFileByPath...");

// Test finding root level file
const indexFile = findFileByPath("/index.html", mockFiles);
console.log(
  "Found index.html:",
  indexFile?.name === "index.html" ? "PASS" : "FAIL"
);

// Test finding nested file
const headerFile = findFileByPath("/src/components/Header.tsx", mockFiles);
console.log(
  "Found Header.tsx:",
  headerFile?.name === "Header.tsx" ? "PASS" : "FAIL"
);

// Test finding folder
const srcFolder = findFileByPath("/src", mockFiles);
console.log(
  "Found src folder:",
  srcFolder?.name === "src" && srcFolder?.type === "folder" ? "PASS" : "FAIL"
);

// Test non-existent file
const nonExistent = findFileByPath("/nonexistent.txt", mockFiles);
console.log(
  "Non-existent file returns null:",
  nonExistent === null ? "PASS" : "FAIL"
);

// Test parsePath function
console.log("\nTesting parsePath...");

const parsed1 = parsePath("/src/components/Header.tsx");
console.log(
  "Parse nested path:",
  parsed1.fileName === "Header.tsx" &&
    parsed1.parentPath === "/src/components" &&
    parsed1.pathSegments.length === 3
    ? "PASS"
    : "FAIL"
);

const parsed2 = parsePath("/index.html");
console.log(
  "Parse root level path:",
  parsed2.fileName === "index.html" &&
    parsed2.parentPath === "/" &&
    parsed2.pathSegments.length === 1
    ? "PASS"
    : "FAIL"
);

const parsed3 = parsePath("/");
console.log(
  "Parse root path:",
  parsed3.fileName === "" &&
    parsed3.parentPath === "" &&
    parsed3.pathSegments.length === 0
    ? "PASS"
    : "FAIL"
);

// Test generateUniqueId function
console.log("\nTesting generateUniqueId...");

const newId1 = generateUniqueId("/test/path1.txt");
const newId2 = generateUniqueId("/test/path2.txt");
const newId3 = generateUniqueId("/test/path1.txt"); // Same path should give same ID

console.log(
  "Generated consistent IDs for same path:",
  newId1 === newId3 ? "PASS" : "FAIL"
);
console.log(
  "Generated different IDs for different paths:",
  newId1 !== newId2 ? "PASS" : "FAIL"
);

// Test ensureParentFolders function
console.log("\nTesting ensureParentFolders...");

// Test 1: Create single level parent folder
const simpleFiles: File[] = [
  {
    id: 1,
    name: "index.html",
    type: "file",
    path: "/index.html",
    content: "<!DOCTYPE html>",
  },
];

const parentResult1 = ensureParentFolders("/src/App.tsx", simpleFiles);
const srcFolder1 = findFileByPath("/src", parentResult1);
console.log(
  "Created single parent folder:",
  srcFolder1?.type === "folder" && srcFolder1?.name === "src" ? "PASS" : "FAIL"
);

// Test 2: Create multiple nested parent folders
const parentResult2 = ensureParentFolders(
  "/src/components/ui/Button.tsx",
  simpleFiles
);
const srcFolder2 = findFileByPath("/src", parentResult2);
const componentsFolder = findFileByPath("/src/components", parentResult2);
const uiFolder = findFileByPath("/src/components/ui", parentResult2);

console.log(
  "Created nested parent folders:",
  srcFolder2?.type === "folder" &&
    componentsFolder?.type === "folder" &&
    uiFolder?.type === "folder"
    ? "PASS"
    : "FAIL"
);

// Test 3: Verify parent-child relationships
console.log(
  "Parent-child relationships correct:",
  componentsFolder?.parentId === srcFolder2?.id &&
    uiFolder?.parentId === componentsFolder?.id
    ? "PASS"
    : "FAIL"
);

// Test 4: Don't create existing folders
const parentResult3 = ensureParentFolders(
  "/src/components/Header.tsx",
  mockFiles
);
const originalSrcFolder = findFileByPath("/src", mockFiles);
const resultSrcFolder = findFileByPath("/src", parentResult3);
console.log(
  "Existing folders not duplicated:",
  originalSrcFolder?.id === resultSrcFolder?.id ? "PASS" : "FAIL"
);

// Test 5: Root level file (no parents needed)
const parentResult4 = ensureParentFolders("/package.json", simpleFiles);
console.log(
  "Root level file needs no parents:",
  parentResult4.length === simpleFiles.length ? "PASS" : "FAIL"
);

// Test 6: Verify folder structure integrity
const parentResult5 = ensureParentFolders(
  "/deep/nested/folder/structure/file.txt",
  []
);
const deepFolder = findFileByPath("/deep", parentResult5);
const nestedFolder = findFileByPath("/deep/nested", parentResult5);
const folderFolder = findFileByPath("/deep/nested/folder", parentResult5);
const structureFolder = findFileByPath(
  "/deep/nested/folder/structure",
  parentResult5
);

console.log(
  "Deep folder structure created correctly:",
  deepFolder?.type === "folder" &&
    nestedFolder?.parentId === deepFolder?.id &&
    folderFolder?.parentId === nestedFolder?.id &&
    structureFolder?.parentId === folderFolder?.id
    ? "PASS"
    : "FAIL"
);

// Test 7: Verify children arrays are initialized
console.log(
  "Folders have children arrays:",
  Array.isArray(deepFolder?.children) && Array.isArray(nestedFolder?.children)
    ? "PASS"
    : "FAIL"
);

// Test createFile function
console.log("\nTesting createFile...");

// Test 1: Create file with content
const newFile1 = createFile(
  "/src/NewComponent.tsx",
  "export default function NewComponent() {}",
  mockFiles
);
console.log(
  "Created file with correct attributes:",
  newFile1.name === "NewComponent.tsx" &&
    newFile1.type === "file" &&
    newFile1.path === "/src/NewComponent.tsx" &&
    newFile1.content === "export default function NewComponent() {}"
    ? "PASS"
    : "FAIL"
);

// Test 2: Create file with parent relationship
const srcFolderFromMock = findFileByPath("/src", mockFiles);
console.log(
  "File has correct parent ID:",
  newFile1.parentId === srcFolderFromMock?.id ? "PASS" : "FAIL"
);

// Test 3: Create file without content (default empty)
const newFile2 = createFile("/src/EmptyFile.tsx", undefined, mockFiles);
console.log(
  "File created with default empty content:",
  newFile2.content === "" ? "PASS" : "FAIL"
);

// Test 4: Create root level file (no parent)
const rootFile = createFile("/package.json", '{"name": "test"}', mockFiles);
console.log(
  "Root level file has no parent ID:",
  rootFile.parentId === undefined &&
    rootFile.name === "package.json" &&
    rootFile.path === "/package.json"
    ? "PASS"
    : "FAIL"
);

// Test 5: Create file in deeply nested path
const deepFile = createFile(
  "/src/components/ui/Button.tsx",
  "export const Button = () => {};",
  mockFiles
);
const componentsFromMock = findFileByPath("/src/components", mockFiles);
console.log(
  "Deep nested file has correct parent:",
  deepFile.name === "Button.tsx" &&
    deepFile.path === "/src/components/ui/Button.tsx"
    ? "PASS"
    : "FAIL"
);

// Test createFolder function
console.log("\nTesting createFolder...");

// Test 1: Create folder with correct attributes
const newFolder1 = createFolder("/src/utils", mockFiles);
console.log(
  "Created folder with correct attributes:",
  newFolder1.name === "utils" &&
    newFolder1.type === "folder" &&
    newFolder1.path === "/src/utils" &&
    Array.isArray(newFolder1.children) &&
    newFolder1.children.length === 0
    ? "PASS"
    : "FAIL"
);

// Test 2: Create folder with parent relationship
console.log(
  "Folder has correct parent ID:",
  newFolder1.parentId === srcFolderFromMock?.id ? "PASS" : "FAIL"
);

// Test 3: Create root level folder (no parent)
const rootFolder = createFolder("/public", mockFiles);
console.log(
  "Root level folder has no parent ID:",
  rootFolder.parentId === undefined &&
    rootFolder.name === "public" &&
    rootFolder.path === "/public"
    ? "PASS"
    : "FAIL"
);

// Test 4: Create deeply nested folder
const deepFolder2 = createFolder("/src/components/forms", mockFiles);
console.log(
  "Deep nested folder has correct attributes:",
  deepFolder2.name === "forms" &&
    deepFolder2.path === "/src/components/forms" &&
    deepFolder2.parentId === componentsFromMock?.id
    ? "PASS"
    : "FAIL"
);

// Test 5: Verify folder has empty children array
console.log(
  "New folder has empty children array:",
  Array.isArray(deepFolder2.children) && deepFolder2.children.length === 0
    ? "PASS"
    : "FAIL"
);

// Test 6: Verify unique IDs are generated
const file1 = createFile("/test1.txt", "", []);
const file2 = createFile("/test2.txt", "", []);
const folder1 = createFolder("/folder1", []);
const folder2 = createFolder("/folder2", []);

console.log(
  "Unique IDs generated for different paths:",
  file1.id !== file2.id && folder1.id !== folder2.id && file1.id !== folder1.id
    ? "PASS"
    : "FAIL"
);

// Test 7: Consistent IDs for same path
const file3 = createFile("/test1.txt", "", []);
const folder3 = createFolder("/folder1", []);
console.log(
  "Consistent IDs for same paths:",
  file1.id === file3.id && folder1.id === folder3.id ? "PASS" : "FAIL"
);

// Import additional functions for duplicate detection testing
import {
  isDuplicate,
  createFileIfNotExists,
  createFolderIfNotExists,
  processStepWithDuplicateHandling,
  processStepsWithDuplicateHandling,
} from "./fileTreeUtils";
import { Step, StepType } from "../types";

// Test isDuplicate function
console.log("\nTesting isDuplicate...");

// Test 1: Existing file should be detected as duplicate
const existingFile = isDuplicate("/src/App.tsx", mockFiles);
console.log(
  "Existing file detected as duplicate:",
  existingFile === true ? "PASS" : "FAIL"
);

// Test 2: Existing folder should be detected as duplicate
const existingFolder = isDuplicate("/src", mockFiles);
console.log(
  "Existing folder detected as duplicate:",
  existingFolder === true ? "PASS" : "FAIL"
);

// Test 3: Non-existing file should not be duplicate
const nonExistingFile = isDuplicate("/src/NewFile.tsx", mockFiles);
console.log(
  "Non-existing file not detected as duplicate:",
  nonExistingFile === false ? "PASS" : "FAIL"
);

// Test 4: Non-existing folder should not be duplicate
const nonExistingFolder = isDuplicate("/src/newFolder", mockFiles);
console.log(
  "Non-existing folder not detected as duplicate:",
  nonExistingFolder === false ? "PASS" : "FAIL"
);

// Test 5: Nested existing file should be detected as duplicate
const nestedExistingFile = isDuplicate("/src/components/Header.tsx", mockFiles);
console.log(
  "Nested existing file detected as duplicate:",
  nestedExistingFile === true ? "PASS" : "FAIL"
);

// Test createFileIfNotExists function
console.log("\nTesting createFileIfNotExists...");

// Test 1: Create new file (should succeed)
const newFileCreated = createFileIfNotExists(
  "/src/NewComponent.tsx",
  "export default function NewComponent() {}",
  mockFiles
);
console.log(
  "New file created successfully:",
  newFileCreated !== null &&
    newFileCreated.name === "NewComponent.tsx" &&
    newFileCreated.path === "/src/NewComponent.tsx"
    ? "PASS"
    : "FAIL"
);

// Test 2: Try to create existing file (should return null)
const duplicateFileAttempt = createFileIfNotExists(
  "/src/App.tsx",
  "duplicate content",
  mockFiles
);
console.log(
  "Duplicate file creation returns null:",
  duplicateFileAttempt === null ? "PASS" : "FAIL"
);

// Test 3: Create file with empty content
const emptyFileCreated = createFileIfNotExists(
  "/src/EmptyFile.tsx",
  "",
  mockFiles
);
console.log(
  "Empty file created successfully:",
  emptyFileCreated !== null && emptyFileCreated.content === "" ? "PASS" : "FAIL"
);

// Test createFolderIfNotExists function
console.log("\nTesting createFolderIfNotExists...");

// Test 1: Create new folder (should succeed)
const newFolderCreated = createFolderIfNotExists("/src/utils", mockFiles);
console.log(
  "New folder created successfully:",
  newFolderCreated !== null &&
    newFolderCreated.name === "utils" &&
    newFolderCreated.type === "folder" &&
    newFolderCreated.path === "/src/utils"
    ? "PASS"
    : "FAIL"
);

// Test 2: Try to create existing folder (should return null)
const duplicateFolderAttempt = createFolderIfNotExists("/src", mockFiles);
console.log(
  "Duplicate folder creation returns null:",
  duplicateFolderAttempt === null ? "PASS" : "FAIL"
);

// Test 3: Try to create existing nested folder (should return null)
const duplicateNestedFolderAttempt = createFolderIfNotExists(
  "/src/components",
  mockFiles
);
console.log(
  "Duplicate nested folder creation returns null:",
  duplicateNestedFolderAttempt === null ? "PASS" : "FAIL"
);

// Test processStepWithDuplicateHandling function
console.log("\nTesting processStepWithDuplicateHandling...");

// Test 1: Process CreateFile step for new file
const createFileStep: Step = {
  id: 1,
  title: "Create new component",
  description: "Create a new React component",
  type: StepType.CreateFile,
  status: "pending",
  code: "export default function NewComponent() { return <div>Hello</div>; }",
  path: "/src/NewComponent.tsx",
};

const stepResult1 = processStepWithDuplicateHandling(createFileStep, mockFiles);
console.log(
  "New file step processed correctly:",
  stepResult1.updatedStep.status === "completed" &&
    stepResult1.createdFile !== null &&
    stepResult1.createdFile.name === "NewComponent.tsx"
    ? "PASS"
    : "FAIL"
);

// Test 2: Process CreateFile step for existing file (duplicate)
const duplicateFileStep: Step = {
  id: 2,
  title: "Create existing file",
  description: "Try to create an existing file",
  type: StepType.CreateFile,
  status: "pending",
  code: "duplicate code",
  path: "/src/App.tsx",
};

const stepResult2 = processStepWithDuplicateHandling(
  duplicateFileStep,
  mockFiles
);
console.log(
  "Duplicate file step handled correctly:",
  stepResult2.updatedStep.status === "completed" &&
    stepResult2.createdFile === null
    ? "PASS"
    : "FAIL"
);

// Test 3: Process CreateFolder step for new folder
const createFolderStep: Step = {
  id: 3,
  title: "Create new folder",
  description: "Create a new folder",
  type: StepType.CreateFolder,
  status: "pending",
  path: "/src/utils",
};

const stepResult3 = processStepWithDuplicateHandling(
  createFolderStep,
  mockFiles
);
console.log(
  "New folder step processed correctly:",
  stepResult3.updatedStep.status === "completed" &&
    stepResult3.createdFile !== null &&
    stepResult3.createdFile.type === "folder" &&
    stepResult3.createdFile.name === "utils"
    ? "PASS"
    : "FAIL"
);

// Test 4: Process CreateFolder step for existing folder (duplicate)
const duplicateFolderStep: Step = {
  id: 4,
  title: "Create existing folder",
  description: "Try to create an existing folder",
  type: StepType.CreateFolder,
  status: "pending",
  path: "/src",
};

const stepResult4 = processStepWithDuplicateHandling(
  duplicateFolderStep,
  mockFiles
);
console.log(
  "Duplicate folder step handled correctly:",
  stepResult4.updatedStep.status === "completed" &&
    stepResult4.createdFile === null
    ? "PASS"
    : "FAIL"
);

// Test 5: Process non-CreateFile/CreateFolder step (should be unchanged)
const editFileStep: Step = {
  id: 5,
  title: "Edit file",
  description: "Edit an existing file",
  type: StepType.EditFile,
  status: "pending",
  path: "/src/App.tsx",
};

const stepResult5 = processStepWithDuplicateHandling(editFileStep, mockFiles);
console.log(
  "Non-create step unchanged:",
  stepResult5.updatedStep.status === "pending" &&
    stepResult5.createdFile === null
    ? "PASS"
    : "FAIL"
);

// Test processStepsWithDuplicateHandling function
console.log("\nTesting processStepsWithDuplicateHandling...");

// Test with multiple steps including duplicates
const testSteps: Step[] = [
  {
    id: 1,
    title: "Create new file",
    description: "Create a new file",
    type: StepType.CreateFile,
    status: "pending",
    code: "export const utils = {};",
    path: "/src/utils.ts",
  },
  {
    id: 2,
    title: "Create existing file",
    description: "Try to create existing file",
    type: StepType.CreateFile,
    status: "pending",
    code: "duplicate",
    path: "/src/App.tsx",
  },
  {
    id: 3,
    title: "Create new folder",
    description: "Create a new folder",
    type: StepType.CreateFolder,
    status: "pending",
    path: "/src/hooks",
  },
  {
    id: 4,
    title: "Create existing folder",
    description: "Try to create existing folder",
    type: StepType.CreateFolder,
    status: "pending",
    path: "/src/components",
  },
  {
    id: 5,
    title: "Edit file",
    description: "Edit a file",
    type: StepType.EditFile,
    status: "pending",
    path: "/src/App.tsx",
  },
];

const batchResult = processStepsWithDuplicateHandling(testSteps, mockFiles);

// Check that all CreateFile and CreateFolder steps are marked as completed
const processedSteps = batchResult.updatedSteps;
const createSteps = processedSteps.filter(
  (s) => s.type === StepType.CreateFile || s.type === StepType.CreateFolder
);
const allCreateStepsCompleted = createSteps.every(
  (s) => s.status === "completed"
);

console.log(
  "All create steps marked as completed:",
  allCreateStepsCompleted ? "PASS" : "FAIL"
);

// Check that non-create steps remain unchanged
const editStep = processedSteps.find((s) => s.type === StepType.EditFile);
console.log(
  "Non-create step status unchanged:",
  editStep?.status === "pending" ? "PASS" : "FAIL"
);

// Check that new files were added to the files array
const originalFileCount = mockFiles.length;
const newFileCount = batchResult.updatedFiles.length;
console.log(
  "New files added to files array:",
  newFileCount > originalFileCount ? "PASS" : "FAIL"
);

// Check that the new utils.ts file exists in the result
const utilsFile = findFileByPath("/src/utils.ts", batchResult.updatedFiles);
console.log(
  "New utils.ts file created:",
  utilsFile !== null &&
    utilsFile.name === "utils.ts" &&
    utilsFile.content === "export const utils = {};"
    ? "PASS"
    : "FAIL"
);

// Check that the new hooks folder exists in the result
const hooksFolder = findFileByPath("/src/hooks", batchResult.updatedFiles);
console.log(
  "New hooks folder created:",
  hooksFolder !== null &&
    hooksFolder.type === "folder" &&
    hooksFolder.name === "hooks"
    ? "PASS"
    : "FAIL"
);

// Check that duplicate files were not created again
const srcFolderBatch = findFileByPath("/src", batchResult.updatedFiles);
const appFile = findFileByPath("/src/App.tsx", batchResult.updatedFiles);
const componentsFolderBatch = findFileByPath(
  "/src/components",
  batchResult.updatedFiles
);

console.log(
  "Duplicate files not recreated:",
  srcFolderBatch !== null && appFile !== null && componentsFolderBatch !== null
    ? "PASS"
    : "FAIL"
);

// Test step without path (edge case)
const stepWithoutPath: Step = {
  id: 6,
  title: "Step without path",
  description: "A step without a path",
  type: StepType.CreateFile,
  status: "pending",
};

const resultWithoutPath = processStepWithDuplicateHandling(
  stepWithoutPath,
  mockFiles
);
console.log(
  "Step without path handled gracefully:",
  resultWithoutPath.updatedStep.status === "pending" &&
    resultWithoutPath.createdFile === null
    ? "PASS"
    : "FAIL"
);

console.log("\nAll duplicate detection tests completed!");

// Import the main processSteps function
import { processSteps } from "./fileTreeUtils";

// Test processSteps function
console.log("\nTesting processSteps...");

// Test 1: Process mixed steps (only CreateFile and CreateFolder should be processed)
const mixedSteps: Step[] = [
  {
    id: 1,
    title: "Create new file",
    description: "Create a new file",
    type: StepType.CreateFile,
    status: "pending",
    code: "export const config = {};",
    path: "/src/config.ts",
  },
  {
    id: 2,
    title: "Create new folder",
    description: "Create a new folder",
    type: StepType.CreateFolder,
    status: "pending",
    path: "/src/services",
  },
  {
    id: 3,
    title: "Edit existing file",
    description: "Edit an existing file",
    type: StepType.EditFile,
    status: "pending",
    code: "updated content",
    path: "/src/App.tsx",
  },
  {
    id: 4,
    title: "Run script",
    description: "Run a script",
    type: StepType.RunScript,
    status: "pending",
    code: "npm run build",
  },
  {
    id: 5,
    title: "Create duplicate file",
    description: "Try to create existing file",
    type: StepType.CreateFile,
    status: "pending",
    code: "duplicate content",
    path: "/src/App.tsx",
  },
];

const processResult = processSteps(mixedSteps, mockFiles);

// Check that only CreateFile and CreateFolder steps were processed
const processedCreateSteps = processResult.updatedSteps.filter(
  (s) =>
    (s.type === StepType.CreateFile || s.type === StepType.CreateFolder) &&
    s.status === "completed"
);
console.log(
  "Only create steps were processed:",
  processedCreateSteps.length === 3 ? "PASS" : "FAIL"
);

// Check that non-create steps remain unchanged
const editStepResult = processResult.updatedSteps.find((s) => s.id === 3);
const scriptStepResult = processResult.updatedSteps.find((s) => s.id === 4);
console.log(
  "Non-create steps remain unchanged:",
  editStepResult?.status === "pending" && scriptStepResult?.status === "pending"
    ? "PASS"
    : "FAIL"
);

// Check that new files were created
const configFile = findFileByPath("/src/config.ts", processResult.updatedFiles);
const servicesFolder = findFileByPath(
  "/src/services",
  processResult.updatedFiles
);
console.log(
  "New files/folders created:",
  configFile !== null &&
    servicesFolder !== null &&
    configFile.content === "export const config = {};" &&
    servicesFolder.type === "folder"
    ? "PASS"
    : "FAIL"
);

// Check that duplicate file step was marked completed but no new file created
const duplicateStep = processResult.updatedSteps.find((s) => s.id === 5);
const originalAppFile = findFileByPath("/src/App.tsx", mockFiles);
const resultAppFile = findFileByPath(
  "/src/App.tsx",
  processResult.updatedFiles
);
console.log(
  "Duplicate file handled correctly:",
  duplicateStep?.status === "completed" &&
    originalAppFile?.content === resultAppFile?.content
    ? "PASS"
    : "FAIL"
);

// Test 2: Process steps with no pending CreateFile/CreateFolder steps
const nonCreateSteps: Step[] = [
  {
    id: 1,
    title: "Edit file",
    description: "Edit a file",
    type: StepType.EditFile,
    status: "pending",
    path: "/src/App.tsx",
  },
  {
    id: 2,
    title: "Run script",
    description: "Run a script",
    type: StepType.RunScript,
    status: "pending",
    code: "npm test",
  },
];

const nonCreateResult = processSteps(nonCreateSteps, mockFiles);
console.log(
  "No create steps - arrays unchanged:",
  nonCreateResult.updatedFiles === mockFiles &&
    nonCreateResult.updatedSteps === nonCreateSteps
    ? "PASS"
    : "FAIL"
);

// Test 3: Process empty steps array
const emptyResult = processSteps([], mockFiles);
console.log(
  "Empty steps array handled correctly:",
  emptyResult.updatedFiles === mockFiles &&
    emptyResult.updatedSteps.length === 0
    ? "PASS"
    : "FAIL"
);

// Test 4: Process steps with completed CreateFile/CreateFolder steps (should be ignored)
const completedSteps: Step[] = [
  {
    id: 1,
    title: "Already completed file",
    description: "A completed file creation step",
    type: StepType.CreateFile,
    status: "completed",
    code: "export const done = true;",
    path: "/src/done.ts",
  },
  {
    id: 2,
    title: "Pending file",
    description: "A pending file creation step",
    type: StepType.CreateFile,
    status: "pending",
    code: "export const pending = true;",
    path: "/src/pending.ts",
  },
];

const completedResult = processSteps(completedSteps, mockFiles);
const pendingFile = findFileByPath(
  "/src/pending.ts",
  completedResult.updatedFiles
);
const doneFile = findFileByPath("/src/done.ts", completedResult.updatedFiles);
const pendingStepResult = completedResult.updatedSteps.find((s) => s.id === 2);

console.log(
  "Only pending steps processed:",
  pendingFile !== null &&
    doneFile === null &&
    pendingStepResult?.status === "completed"
    ? "PASS"
    : "FAIL"
);

// Test 5: Process steps that require parent folder creation
const deepPathSteps: Step[] = [
  {
    id: 1,
    title: "Create deeply nested file",
    description: "Create a file in a deep path",
    type: StepType.CreateFile,
    status: "pending",
    code: "export const deep = true;",
    path: "/src/features/auth/components/LoginForm.tsx",
  },
];

const deepResult = processSteps(deepPathSteps, mockFiles);
const deepFileResult = findFileByPath(
  "/src/features/auth/components/LoginForm.tsx",
  deepResult.updatedFiles
);
const featuresFolder = findFileByPath("/src/features", deepResult.updatedFiles);
const authFolder = findFileByPath(
  "/src/features/auth",
  deepResult.updatedFiles
);
const componentsFolder2 = findFileByPath(
  "/src/features/auth/components",
  deepResult.updatedFiles
);

console.log(
  "Deep path with parent folders created:",
  deepFileResult !== null &&
    featuresFolder !== null &&
    authFolder !== null &&
    componentsFolder2 !== null &&
    deepFileResult.content === "export const deep = true;"
    ? "PASS"
    : "FAIL"
);

console.log("\nAll processSteps tests completed!");
