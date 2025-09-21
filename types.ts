


export enum ResearchMode {
    Explore = 'Explore Ideas',
    Analyze = 'Analyze Niche',
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface Stat {
    label: string;
    value: string;
}

export interface ComparisonTable {
    headers: string[];
    rows: string[][];
}

export interface ChartData {
    type: 'bar' | 'pie' | 'line';
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
    }[];
}

export interface MarketAnalysisResult {
    id: string; // Unique ID for history key
    topic: string;
    mode: ResearchMode;
    generatedTitle: string;
    executiveSummary: string;
    marketOverview: string;
    marketStats: Stat[];
    chartData: ChartData | null;
    keyTrends: string;
    targetAudience: string;
    competitorAnalysis: string;
    competitorTable: ComparisonTable | null;
    swotAnalysis: string;
    businessIdeas: string; // Numbered list of ideas
    sources: GroundingSource[];
}

export interface BusinessPlan {
    missionStatement: string;
    valueProposition: string;
    marketingStrategy: string;
    kpis: string; // Key Performance Indicators
    actionPlan: string; // 90-day action plan
}

export interface SolutionCard {
    title: string;
    description: string;
    link?: string;
}

export interface ChatMessageAttachment {
    id: string;
    name: string;
    mimeType: string;
}

// AI File Operation System
export interface CreateFileOperation {
    operation: 'CREATE_FILE';
    path: string; // e.g., "marketing/ideas.txt" or "new_file.html"
    content: string;
}

export interface CreateFolderOperation {
    operation: 'CREATE_FOLDER';
    path: string; // e.g., "reports/quarterly"
}

export interface EditFileOperation {
    operation: 'EDIT_FILE';
    path: string;
    content: string; // The entire new content of the file
}

export interface MoveAssetOperation {
    operation: 'MOVE_ASSET';
    sourcePath: string;
    destinationPath: string;
}

export interface RenameAssetOperation {
    operation: 'RENAME_ASSET';
    path: string;
    newName: string;
}

export interface CreateGoalOperation {
    operation: 'CREATE_GOAL';
    title: string;
    description: string;
}

export interface CreateTaskOperation {
    operation: 'CREATE_TASK';
    goalTitle: string; 
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate?: string; // "YYYY-MM-DD"
    assigneeName?: string;
}

export interface EditTaskOperation {
    operation: 'EDIT_TASK';
    goalTitle: string;
    taskTitle: string; 
    newTitle?: string;
    newDescription?: string;
    newPriority?: TaskPriority;
    newDueDate?: string; // "YYYY-MM-DD"
    newAssigneeName?: string;
}

export interface AddSubtaskOperation {
    operation: 'ADD_SUBTASK';
    goalTitle: string;
    taskTitle: string;
    subtaskText: string;
}

export interface SetTaskStatusOperation {
    operation: 'SET_TASK_STATUS';
    goalTitle: string;
    taskTitle: string;
    newStatus: TaskStatus;
}

export type PatchAction = 
    | { type: 'INSERT'; afterLineNumber: number; content: string[]; } 
    | { type: 'REPLACE'; lineNumber: number; content: string[]; } 
    | { type: 'DELETE'; lineNumber: number; count?: number; };

export interface PatchFileOperation {
    operation: 'PATCH_FILE';
    path: string;
    patches: PatchAction[];
}

export type FileOperation = CreateFileOperation | CreateFolderOperation | EditFileOperation | MoveAssetOperation | RenameAssetOperation | CreateGoalOperation | CreateTaskOperation | EditTaskOperation | AddSubtaskOperation | SetTaskStatusOperation | PatchFileOperation;

export interface TeamMemberSuggestion {
    role: string;
    responsibilities: string[];
}

export interface TeamMember {
  id: string;
  role: string;
  responsibilities: string[];
  assignedProjectIds: string[];
  status: 'OPEN' | 'FILLED';
  person?: User; // Details of the person filling the role
}

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: {
        text: string;
        cards?: SolutionCard[];
        attachments?: ChatMessageAttachment[];
        executedOperations?: FileOperation[];
        projectClarification?: { id: string; title: string; }[];
        teamMemberSuggestions?: TeamMemberSuggestion[];
    };
}


// FIX: Added missing type definitions to resolve import errors.
export interface ImageSuggestion {
    query: string;
    caption: string;
}

export interface KeyPoint {
    point: string;
    detail: string;
}

export interface MindMapNode {
    id: string;
    label: string;
    children?: MindMapNode[];
}

export interface MindMap {
    root: MindMapNode;
}

export interface Flashcard {
    question: string;
    answer: string;
}

export type CompanyCategory = 'Startup' | 'Idea' | 'Hypothesis';

export interface AttachedFile {
  id: string;
  type: 'file';
  name: string;
  mimeType: string;
  size: number;
  // content is a base64 encoded string, now optional to avoid localStorage quota issues
  content?: string;
  // optional source metadata to allow lazy re-download (e.g., from Google Drive)
  source?: { provider: 'gdrive' | 'local'; fileId?: string };
}

export interface Folder {
    id: string;
    type: 'folder';
    name: string;
    children: Asset[];
}

export type Asset = AttachedFile | Folder;

// Collaboration Types
export interface User {
    id:string;
    name: string;
    avatarUrl: string;
}

// Task Management System Types
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface TaskAttachment {
    id: string; // Asset ID
    name: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string; // ISO string
    subtasks: Subtask[];
    attachments: TaskAttachment[];
    assigneeId?: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    tasks: Task[];
}

export interface CompanyCardData {
  id: string;
  title: string;
  description: string;
  category: CompanyCategory;
  assets: Asset[];
  goals?: Goal[];
  members?: User[];
  lastSummarized?: string;
}

export interface GoogleUserProfile {
    name: string;
    email: string;
    imageUrl: string;
}