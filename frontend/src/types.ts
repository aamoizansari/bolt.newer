
enum StepType{
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
}

export interface File {
  id: number;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: File[];
  parentId?: number;
}