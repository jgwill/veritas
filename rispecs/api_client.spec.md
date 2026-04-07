# Veritas API Client — RISE Specification

> Enables typed, authenticated HTTP access to the Veritas API for model management and AI generation.

**Version:** 0.1.0
**Document ID:** rispec-api-client-v1
**Last Updated:** 2026-03-21

---

## Desired Outcome

Users create **reliable programmatic access to the Veritas backend** where:

- All HTTP interactions with the Veritas API are handled through a single typed client
- Authentication is configured once and applied consistently to every request
- API responses are parsed into TypeScript types that match the existing `DigitalModel` / `DigitalElement` interfaces
- HTTP errors are translated into typed, actionable error objects
- Both the MCP server and CLI consume the same client — no duplicated HTTP logic

---

## Creative Intent

**What this enables users to create:** A shared foundation layer that both the MCP server and CLI build upon. Instead of each consumer implementing its own HTTP calls, authentication handling, and error parsing, the API client provides a single, well-typed interface to the Veritas backend. Changes to the API surface are absorbed in one place.

**Structural Tension:** Between the multiple consumers that need Veritas API access (MCP server, CLI, future integrations) and the desire for consistent behavior across all of them. The API client resolves this by providing a single module that encapsulates endpoint knowledge, authentication, error handling, and type mapping.

---

## Data Model / Architecture

### Client Configuration

```typescript
interface VeritasClientConfig {
  baseUrl: string;       // Default: "https://api.example.com"
  apiKey: string;        // Bearer token (from VERITAS_API_KEY env var)
  timeout?: number;      // Request timeout in ms (default: 30000)
}
```

### Client Interface

```typescript
class VeritasAPIClient {
  constructor(config: VeritasClientConfig);

  // Model CRUD
  listModels(filter?: { type?: 1 | 2 }): Promise<ModelSummary[]>;
  getModel(id: string): Promise<DigitalModel>;
  createModel(data: CreateModelRequest): Promise<DigitalModel>;
  updateModel(id: string, data: UpdateModelRequest): Promise<DigitalModel>;
  deleteModel(id: string): Promise<void>;

  // Import / Export
  exportModel(id: string, format: "json" | "csv"): Promise<string>;
  importModel(model: DigitalModel): Promise<DigitalModel>;

  // AI Generation
  generateModel(request: GenerateModelRequest): Promise<DigitalModel>;
  getSchema(): Promise<SchemaResponse>;
}
```

### Architecture Position

```
┌──────────────────┐    ┌──────────────────┐
│  Veritas MCP     │    │  Veritas CLI     │
│  Server          │    │  Tool            │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
          ┌──────────▼──────────┐
          │  VeritasAPIClient   │
          │                     │
          │  - Authentication   │
          │  - Type mapping     │
          │  - Error handling   │
          │  - Retry logic      │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  Veritas API        │
          │  (veritas           │
          │  .sanctuaire        │
          │  agentique.com)     │
          └─────────────────────┘
```

---

## API Endpoints

### Model CRUD

#### List Models

```
GET /api/models
Authorization: Bearer <VERITAS_API_KEY>

Response 200:
[
  {
    "id": "abc-1234",
    "name": "Q1 Engineering Review",
    "description": "Quarterly performance review",
    "modelType": 2,
    "createdAt": "2026-03-01T...",
    "updatedAt": "2026-03-20T..."
  }
]
```

#### Get Model

```
GET /api/models/:id
Authorization: Bearer <VERITAS_API_KEY>

Response 200:
{
  "id": "abc-1234",
  "name": "Q1 Engineering Review",
  "modelType": 2,
  "modelData": { <DigitalModel> },
  "createdAt": "...",
  "updatedAt": "..."
}
```

The `modelData` field contains the complete `DigitalModel` object including the `Model` array of `DigitalElement` objects and `history` entries.

#### Create Model

```
POST /api/models
Authorization: Bearer <VERITAS_API_KEY>
Content-Type: application/json

Body:
{
  "name": "Q2 Team Review",
  "description": "Quarterly performance assessment",
  "modelType": 2,
  "modelData": { <DigitalModel> }
}

Response 201: { <created model> }
```

#### Update Model

```
POST /api/models/:id
Authorization: Bearer <VERITAS_API_KEY>
Content-Type: application/json

Body:
{
  "name": "Updated Name",           // optional
  "description": "Updated desc",    // optional
  "modelData": { <DigitalModel> }   // optional
}

Response 200: { <updated model> }
```

#### Delete Model

```
DELETE /api/models/:id
Authorization: Bearer <VERITAS_API_KEY>

Response 200: { "message": "Model deleted" }
```

### AI Generation

#### Generate Model

```
POST /api/llm/generate-model
Authorization: Bearer <VERITAS_API_KEY>
Content-Type: application/json

Body:
{
  "topic": "Q2 Frontend Team Review",
  "model_type": 2,
  "description": "Evaluate React migration and delivery",
  "elements": [
    { "name": "Sprint Delivery", "description": "On-time completion rate" },
    { "name": "Code Quality", "state": true, "trend": 1 }
  ]
}

Response 200:
{
  "model": { <DigitalModel> },
  "message": "Model generated successfully"
}
```

**Validation:**
- `topic`: required, non-empty string
- `model_type`: required, must be 1 or 2
- `elements`: required, array of 2-20 items, each with at least `name`

#### Get Schema

```
GET /api/llm/schema
Authorization: Bearer <VERITAS_API_KEY>

Response 200:
{
  "DigitalModel": { <JSON Schema> },
  "DigitalElement": { <JSON Schema> }
}
```

---

## Type Definitions

### Request Types

```typescript
interface CreateModelRequest {
  name: string;
  description?: string;
  modelType: 1 | 2;
  modelData: DigitalModel;
}

interface UpdateModelRequest {
  name?: string;
  description?: string;
  modelData?: DigitalModel;
}

interface GenerateModelRequest {
  topic: string;
  model_type: 1 | 2;
  description?: string;
  elements: Array<{
    name: string;
    description?: string;
    state?: boolean;     // TwoFlag initial value
    trend?: -1 | 0 | 1; // ThreeFlag initial value
  }>;
}
```

### Response Types

```typescript
interface ModelSummary {
  id: string;
  name: string;
  description: string;
  modelType: 1 | 2;
  createdAt: string;
  updatedAt: string;
}

interface ModelResponse {
  id: string;
  name: string;
  description: string;
  modelType: 1 | 2;
  modelData: DigitalModel;
  createdAt: string;
  updatedAt: string;
}

interface GenerateModelResponse {
  model: DigitalModel;
  message: string;
}

interface SchemaResponse {
  DigitalModel: object;   // JSON Schema
  DigitalElement: object;  // JSON Schema
}
```

---

## Authentication

### Configuration

```typescript
// Factory function reads from environment
function createClient(): VeritasAPIClient {
  const apiKey = process.env.VERITAS_API_KEY;
  const baseUrl = process.env.VERITAS_API_URL
    ?? "https://api.example.com";

  if (!apiKey) {
    throw new VeritasAuthError(
      "VERITAS_API_KEY environment variable is not set"
    );
  }

  return new VeritasAPIClient({ baseUrl, apiKey });
}
```

### Request Authentication

Every request includes the Bearer token:

```typescript
headers: {
  "Authorization": `Bearer ${this.config.apiKey}`,
  "Content-Type": "application/json"
}
```

The API key is a static UUID token. It does not expire or refresh. It is validated server-side against the `sessions` table.

---

## Error Handling

### Error Type Hierarchy

```typescript
// Base error
class VeritasAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

// Specific error types
class VeritasAuthError extends VeritasAPIError {
  constructor(message: string) {
    super(message, 401, "AUTH_ERROR");
  }
}

class VeritasNotFoundError extends VeritasAPIError {
  constructor(id: string) {
    super(`Model not found: ${id}`, 404, "NOT_FOUND");
  }
}

class VeritasValidationError extends VeritasAPIError {
  constructor(message: string, details: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

class VeritasNetworkError extends VeritasAPIError {
  constructor(url: string) {
    super(`Cannot reach Veritas API at ${url}`, 0, "NETWORK_ERROR");
  }
}
```

### HTTP Status Mapping

| HTTP Status | Error Type | When |
|-------------|-----------|------|
| 401 | `VeritasAuthError` | Invalid or missing API key |
| 403 | `VeritasAuthError` | Key valid but insufficient permissions |
| 404 | `VeritasNotFoundError` | Model ID does not exist |
| 422 | `VeritasValidationError` | Request body fails validation |
| 429 | `VeritasAPIError` | Rate limit exceeded |
| 500+ | `VeritasAPIError` | Server-side failure |
| 0 / timeout | `VeritasNetworkError` | Network unreachable or timeout |

### Retry Strategy

The client retries on transient failures:

- **Retryable:** 429, 500, 502, 503, 504, network errors
- **Not retryable:** 401, 403, 404, 422
- **Strategy:** Exponential backoff — 1s, 2s, 4s (3 attempts max)
- **Timeout:** 30 seconds per request (configurable)

---

## Environment Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VERITAS_API_KEY` | Yes | — | Static UUID token for Bearer authentication |
| `VERITAS_API_URL` | No | `https://api.example.com` | Base URL of the Veritas API |

---

## Dependencies

- **Runtime:** Node.js ≥ 18 (uses native `fetch`), `zod` (response validation)
- **Types consumed:** `DigitalModel`, `DigitalElement`, `HistoryEntry` from veritas types
- **Kinship:**
  - → `mcp_server.spec.md` — Primary consumer; all NETWORK_TOOLS delegate to this client
  - → `cli_tool.spec.md` — Secondary consumer; all API commands delegate to this client

---

## Advancing Patterns

- **Response Caching** — Cache `listModels` and `getSchema` responses with configurable TTL, reducing API calls during rapid tool invocations within a single agent session
- **Batch Operations** — Enable `getModels(ids: string[])` that fetches multiple models in parallel, reducing round-trips for multi-model workflows
- **Event Streaming** — Support Server-Sent Events for long-running generation requests, enabling progress feedback during model generation
- **Client Middleware** — Provide a middleware hook for logging, metrics, and custom headers, enabling consumers to observe API interactions without modifying the client
- **Offline Mode** — Cache last-known model state locally, enabling read-only access when the API is unreachable, with sync-on-reconnect
