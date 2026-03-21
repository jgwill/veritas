/**
 * veritas API client — HTTP transport for the deployed veritas service.
 *
 * Configuration via environment variables:
 *   VERITAS_API_URL  — Base URL (default: https://veritas.sanctuaireagentique.com)
 *   VERITAS_API_KEY  — Static UUID bearer token (required for all requests)
 */

// ---------------------------------------------------------------------------
// Types — self-contained so the CLI has no import dependency on the parent app
// ---------------------------------------------------------------------------

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
  ThreeFlag: number;       // -1 declining, 0 neutral, 1 improving
  ThreeFlagAnswered: boolean;
  Idug: string;
  Status: number;
  Question: boolean;
  evaluation?: 'accepted' | 'rejected' | 'neutral';
}

export interface DigitalModel {
  AutoSaveModel: boolean;
  HasIssue: boolean;
  Model: DigitalElement[];
  Note: string | null;
  ModelName: string;
  DigitalThinkingModelType: number; // 1=Decision, 2=Performance Review
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

export interface HistoryEntry {
  id: string;
  timestamp: string;
  description: string;
  modelState: DigitalElement[];
}

export interface ModelSummary {
  id: string;
  name: string;
  type: number;
  description: string;
  model_type?: number;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GenerateModelParams {
  topic: string;
  model_type?: number;
  description?: string;
  elements: { name: string; description?: string; state?: number; trend?: number }[];
}

export interface ApiModelRecord {
  id: string;
  name: string;
  description: string;
  model_type: number;
  model_data: { Model: DigitalElement[]; history?: HistoryEntry[] };
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: string,
  ) {
    super(`API ${status} ${statusText}${body ? `: ${body}` : ''}`);
    this.name = 'ApiError';
  }
}

function getBaseUrl(): string {
  return (process.env.VERITAS_API_URL || 'https://veritas.sanctuaireagentique.com').replace(/\/+$/, '');
}

function getApiKey(): string {
  const key = process.env.VERITAS_API_KEY;
  if (!key) {
    throw new Error(
      'VERITAS_API_KEY is not set. Export it in your shell:\n  export VERITAS_API_KEY="your-uuid-token"',
    );
  }
  return key;
}

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getApiKey()}`,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, { ...init, headers: { ...headers(), ...(init?.headers as Record<string, string> || {}) } });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, res.statusText, body);
  }

  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

// ---------------------------------------------------------------------------
// Model CRUD
// ---------------------------------------------------------------------------

export async function listModels(): Promise<ModelSummary[]> {
  const data = await request<{ models: ModelSummary[] }>('/api/models');
  return data.models ?? [];
}

export async function getModel(id: string): Promise<ApiModelRecord> {
  return request<ApiModelRecord>(`/api/models/${encodeURIComponent(id)}`);
}

export async function deleteModel(id: string): Promise<void> {
  await request<void>(`/api/models/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createModel(payload: {
  name: string;
  description: string;
  modelType: number;
  modelData: { Model: DigitalElement[]; history?: HistoryEntry[] };
}): Promise<ApiModelRecord> {
  return request<ApiModelRecord>('/api/models', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateModel(
  id: string,
  payload: { name?: string; description?: string; modelData?: unknown; isArchived?: boolean },
): Promise<ApiModelRecord> {
  return request<ApiModelRecord>(`/api/models/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// LLM / Generation
// ---------------------------------------------------------------------------

export async function generateModel(params: GenerateModelParams): Promise<{
  model: { id: string; name: string; model_type: number; description: string; created_at: string };
  message: string;
}> {
  return request('/api/llm/generate-model', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ---------------------------------------------------------------------------
// Schema (lightweight health/shape probe)
// ---------------------------------------------------------------------------

export async function getSchema(): Promise<Record<string, unknown>> {
  // No dedicated schema endpoint — synthesise one from a models list probe
  const models = await listModels();
  return {
    api_url: getBaseUrl(),
    endpoints: {
      'GET  /api/models': 'List models',
      'POST /api/models': 'Create model',
      'GET  /api/models/:id': 'Get model',
      'PATCH /api/models/:id': 'Update model',
      'DELETE /api/models/:id': 'Delete model',
      'POST /api/llm/generate-model': 'AI-generate model',
    },
    model_types: { 1: 'Decision Making', 2: 'Performance Review' },
    current_model_count: models.length,
  };
}
