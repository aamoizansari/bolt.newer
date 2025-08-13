
export enum StepType{
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript,
  
}

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'completed' | 'current' | 'pending';
  code?: string;
  path?: string;    // Optional path for file or folder steps, ideally should be required for CreateFile and CreateFolder, Edit and DeleteFile
}

export interface File {
  id: number;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: File[];
  parentId?: number;
  path:string; // Full path of the file or folder
}