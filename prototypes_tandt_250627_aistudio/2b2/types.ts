
export interface HistoryEntry {
  id: string; // Unique ID for the history entry, e.g., a timestamp
  timestamp: string; // ISO string of when the change was made
  description: string; // A human-readable description of the change
  modelState: DigitalElement[]; // A snapshot of the model's elements at this point
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ActionSuggestion {
  area: string;
  suggestion: string;
}

export interface DigitalElement {
  SortNo: number;
  TelescopedModel: null | any; // Define further if needed
  ComparationCompleted: boolean;
  ComparationTableData: { [key: string]: number };
  DominanceFactor: number;
  DominantElementItIS: boolean;
  Meta: any;
  DtModified: string;
  DtCreated: string;
  Tlid: string;
  NameElement: string;
  DisplayName: string;
  Description: string | null;
  TwoOnly: boolean;
  TwoFlag: boolean;
  TwoFlagAnswered: boolean;
  ThreeFlag: number; // -1, 0, 1
  ThreeFlagAnswered: boolean;
  Idug: string; // Unique ID for the element
  Status: number;
  Question: boolean;
  evaluation?: 'accepted' | 'rejected' | 'neutral'; // For analysis mode state
}

export interface DigitalModel {
  AutoSaveModel: boolean;
  HasIssue: boolean;
  Model: DigitalElement[];
  Note: string | null;
  ModelName: string;
  DigitalThinkingModelType: number;
  DigitalTopic: string;
  Decision: boolean;
  Decided: boolean;
  Idug: string; // Unique ID for the model
  FileSuffix: string;
  Valid: boolean;
  FileId: string;
  TwoOnly: boolean;
  history?: HistoryEntry[];
}

export enum AppMode {
  Modeling = 'Modeling',
  Analyzing = 'Analyzing',
  Structuring = 'Structuring'
}

export type ModelId = string;

export interface ModelSummary {
  id: ModelId;
  name: string;
  type: number;
  description: string;
}