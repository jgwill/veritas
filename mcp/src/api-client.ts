/**
 * HTTP client for the veritas API.
 * Handles authentication, error mapping, and response parsing.
 */

import type {
  ModelSummary,
  DigitalModel,
  GenerateModelParams,
  GenerateModelResult,
  UpdateModelParams,
  CreateModelParams,
  ApiModelRecord,
} from "./types.js";

export class VeritasApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string
  ) {
    super(`Veritas API ${status} ${statusText}: ${body}`);
    this.name = "VeritasApiError";
  }
}

export class VeritasApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = (
      baseUrl ||
      process.env.VERITAS_API_URL ||
      "https://veritas.sanctuaireagentique.com"
    ).replace(/\/$/, "");

    this.apiKey = apiKey || process.env.VERITAS_API_KEY || "";
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      h["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return h;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const init: RequestInit = {
      method,
      headers: this.headers(),
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new VeritasApiError(res.status, res.statusText, text);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  }

  // ── Model CRUD ───────────────────────────────────────────────────

  async listModels(): Promise<ModelSummary[]> {
    const data = await this.request<{ models: ModelSummary[] }>(
      "GET",
      "/api/models"
    );
    return data.models ?? [];
  }

  async getModel(id: string): Promise<ApiModelRecord> {
    const data = await this.request<{ model: ApiModelRecord }>(
      "GET",
      `/api/models/${encodeURIComponent(id)}`
    );
    return data.model;
  }

  async createModel(params: CreateModelParams): Promise<ApiModelRecord> {
    const data = await this.request<{ model: ApiModelRecord }>(
      "POST",
      "/api/models",
      params
    );
    return data.model;
  }

  async updateModel(id: string, params: UpdateModelParams): Promise<void> {
    await this.request<{ model: ApiModelRecord }>(
      "PUT",
      `/api/models/${encodeURIComponent(id)}`,
      params
    );
  }

  async deleteModel(id: string): Promise<void> {
    await this.request<{ success: boolean }>(
      "DELETE",
      `/api/models/${encodeURIComponent(id)}`
    );
  }

  // ── LLM Endpoints ─────────────────────────────────────────────────

  async generateModel(
    params: GenerateModelParams
  ): Promise<GenerateModelResult> {
    return this.request<GenerateModelResult>(
      "POST",
      "/api/llm/generate-model",
      params
    );
  }

  async getSchema(): Promise<object> {
    return this.request<object>("GET", "/api/llm/schema");
  }

  // ── Convenience ────────────────────────────────────────────────────

  /**
   * Reconstruct a DigitalModel from the API record's model_data.
   * The API stores the model in a `model_data` JSON column;
   * this helper merges top-level record fields back in.
   */
  static toDigitalModel(record: ApiModelRecord): DigitalModel {
    const md = record.model_data;
    return {
      AutoSaveModel: true,
      HasIssue: false,
      Model: md.Model ?? [],
      Note: record.description,
      ModelName: record.name,
      DigitalThinkingModelType: record.model_type,
      DigitalTopic: record.name,
      Decision: record.model_type === 1,
      Decided: false,
      Idug: record.id,
      FileSuffix: ".json",
      Valid: true,
      FileId: record.id,
      TwoOnly: record.model_type === 1,
      history: md.history,
    };
  }
}
