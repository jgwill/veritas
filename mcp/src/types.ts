/**
 * Veritas TandT type definitions.
 * Re-typed from the veritas application — not imported to keep the MCP server decoupled.
 */

// ── Core Model Types ─────────────────────────────────────────────────

export interface DigitalElement {
  SortNo: number;
  TelescopedModel: null | unknown;
  ComparationCompleted: boolean;
  ComparationTableData: Record<string, number>;
  DominanceFactor: number;
  DominantElementItIS: boolean;
  Meta: unknown;
  DtModified: string;
  DtCreated: string;
  Tlid: string;
  NameElement: string;
  DisplayName: string;
  Description: string | null;
  TwoOnly: boolean;
  TwoFlag: boolean;
  TwoFlagAnswered: boolean;
  ThreeFlag: number; // -1 = Declining, 0 = Stable, 1 = Improving
  ThreeFlagAnswered: boolean;
  Idug: string;
  Status: number;
  Question: boolean;
  evaluation?: "accepted" | "rejected" | "neutral";
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  description: string;
  modelState: DigitalElement[];
}

export interface DigitalModel {
  AutoSaveModel: boolean;
  HasIssue: boolean;
  Model: DigitalElement[];
  Note: string | null;
  ModelName: string;
  DigitalThinkingModelType: number; // 1 = Decision Making, 2 = Performance Review
  DigitalTopic: string;
  Decision: boolean;
  Decided: boolean;
  Idug: string;
  FileSuffix: string;
  Valid: boolean;
  FileId: string;
  TwoOnly: boolean;
  history?: HistoryEntry[];
}

// ── API Request / Response Types ─────────────────────────────────────

export interface ModelSummary {
  id: string;
  name: string;
  type: number;
  description: string;
}

export interface GenerateModelElement {
  name: string;
  description?: string;
  state?: -1 | 0 | 1;
  trend?: -1 | 0 | 1;
}

export interface GenerateModelParams {
  topic: string;
  model_type?: 1 | 2;
  description?: string;
  elements: GenerateModelElement[];
}

export interface GenerateModelResult {
  model: {
    id: string;
    name: string;
    model_type: number;
    description: string;
    created_at: string;
  };
  message: string;
}

export interface CreateModelParams {
  name: string;
  description?: string;
  modelType: number;
  modelData: {
    Model: DigitalElement[];
    history: HistoryEntry[];
  };
}

export interface UpdateModelParams {
  name?: string;
  description?: string;
  modelData?: {
    Model: DigitalElement[];
    history?: HistoryEntry[];
  };
  isArchived?: boolean;
}

export interface ApiModelRecord {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  model_type: number;
  model_data: {
    Model: DigitalElement[];
    history?: HistoryEntry[];
  };
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// ── MMOT Types ───────────────────────────────────────────────────────

export interface MmotEvaluateParams {
  modelId?: string;
  filePath?: string;
  outputDir?: string;
  llmBinary?: string;
}

export interface MmotEvaluation {
  modelName: string;
  modelTopic: string;
  timestamp: string;
  steps: {
    acknowledge: MmotAcknowledgement[];
    analyze: MmotAnalysis[];
    plan: MmotActionPlan[];
    document: string;
  };
}

export interface MmotAcknowledgement {
  element: string;
  state: string;
  trend: string;
  expectationMet: boolean;
  observation: string;
}

export interface MmotAnalysis {
  element: string;
  rootCause: string;
  contributingFactors: string[];
}

export interface MmotActionPlan {
  element: string;
  action: string;
  orientation: "advancing" | "corrective";
  priority: "high" | "medium" | "low";
}

// ── Tool Configuration ───────────────────────────────────────────────

export type ToolGroup = "NETWORK_TOOLS" | "LOCAL_TOOLS";

export interface ToolDefinition {
  name: string;
  description: string;
  group: ToolGroup;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}
