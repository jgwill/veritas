
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