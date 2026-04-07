# Veritas MCP Server — RISE Specification

> Enables any MCP-compatible LLM to create, evaluate, and advance digital thinking models through structured tool invocation.

**Version:** 0.1.0
**Document ID:** rispec-mcp-server-v1
**Last Updated:** 2026-03-21

---

## Desired Outcome

Users create **programmatic access to the full Veritas model lifecycle** where:

- An LLM agent creates, retrieves, and iterates on DigitalModels without a browser
- Performance Review models (type 2) receive MMOT evaluation through local or network inference
- Decision Making models (type 1) are managed alongside performance models through identical tool patterns
- Tool invocation follows the Model Context Protocol standard, enabling any compliant client to participate
- Network and local operation modes coexist — network for CRUD, local for MMOT evaluation

---

## Creative Intent

**What this enables users to create:** A thinking infrastructure where LLM agents become first-class participants in structured decision-making and performance review. Instead of copying data between chat interfaces and the Veritas web app, agents interact directly with models — generating them from natural language, evaluating them through MMOT methodology, and advancing them through iterative refinement cycles.

**Structural Tension:** Between the rich model lifecycle available in the Veritas web application and the absence of programmatic access for LLM agents. The MCP server resolves this by exposing the complete Veritas capability surface as typed, discoverable tools that any MCP client can invoke.

---

## Data Model / Architecture

### Transport & Runtime

```typescript
// Server configuration
interface VeritasMCPServer {
  name: "veritas-mcp";
  version: "0.1.0";
  transport: "stdio";                    // Standard MCP stdio transport
  sdk: "@modelcontextprotocol/sdk";      // MCP TypeScript SDK
  runtime: "node";                       // Node.js runtime
}
```

### Tool Groups

The server organizes tools into three groups based on their execution context:

```typescript
// Tools that require network access to the Veritas API
const NETWORK_TOOLS = [
  "veritas_list_models",
  "veritas_get_model",
  "veritas_generate_model",
  "veritas_update_model",
  "veritas_delete_model",
  "veritas_export_model",
  "veritas_import_model",
  "veritas_get_schema",
] as const;

// Tools that run locally with an LLM (no API required)
const LOCAL_TOOLS = [
  "veritas_mmot_evaluate",
] as const;

// Union of all tools
const CORE_TOOLS = [...NETWORK_TOOLS, ...LOCAL_TOOLS] as const;
```

### Dual-Mode Architecture

```
┌─────────────────────────────────────────────────┐
│              Veritas MCP Server                  │
│                                                  │
│  ┌──────────────┐      ┌──────────────────────┐ │
│  │ NETWORK MODE │      │     LOCAL MODE        │ │
│  │              │      │                       │ │
│  │ API Client   │      │ Local LLM             │ │
│  │   ↓          │      │ (Gemini / Ollama)     │ │
│  │ Veritas API  │      │   ↓                   │ │
│  │ (CRUD, Gen)  │      │ MMOT Evaluation       │ │
│  └──────────────┘      └──────────────────────┘ │
│                                                  │
│  ← stdio transport →                            │
└─────────────────────────────────────────────────┘
         ↕
┌─────────────────┐
│   MCP Client    │
│ (Claude, etc.)  │
└─────────────────┘
```

---

## Tool Definitions

### veritas_list_models

Lists all models accessible to the authenticated user.

```typescript
{
  name: "veritas_list_models",
  description: "List all digital thinking models for the authenticated user",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "number",
        enum: [1, 2],
        description: "Filter by model type: 1 = Decision Making, 2 = Performance Review"
      }
    }
  }
}
```

**Returns:** Array of `ModelSummary` objects with `id`, `name`, `type`, `updatedAt`.

### veritas_get_model

Retrieves a complete model with all elements and history.

```typescript
{
  name: "veritas_get_model",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Model Idug" }
    },
    required: ["id"]
  }
}
```

**Returns:** Complete `DigitalModel` including `Model[]` elements array and `history[]`.

### veritas_generate_model

Creates a new model from a natural language description using AI generation.

```typescript
{
  name: "veritas_generate_model",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Subject of the model (e.g., 'Q1 Engineering Team Review')" },
      model_type: { type: "number", enum: [1, 2], description: "1 = Decision Making, 2 = Performance Review" },
      description: { type: "string", description: "Optional context for generation" },
      elements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            state: { type: "boolean", description: "Initial TwoFlag (type 2 only)" },
            trend: { type: "number", enum: [-1, 0, 1], description: "Initial ThreeFlag (type 2 only)" }
          },
          required: ["name"]
        },
        minItems: 2,
        maxItems: 20,
        description: "Elements (dimensions/factors) to include"
      }
    },
    required: ["topic", "model_type", "elements"]
  }
}
```

**Returns:** Newly created `DigitalModel` with generated elements, persisted to the API.

### veritas_update_model

Updates an existing model's metadata or elements.

```typescript
{
  name: "veritas_update_model",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Model Idug" },
      name: { type: "string", description: "Updated model name" },
      note: { type: "string", description: "Model note/description" },
      elements: {
        type: "array",
        description: "Updated element array (replaces existing)",
        items: { "$ref": "#/definitions/DigitalElement" }
      }
    },
    required: ["id"]
  }
}
```

### veritas_delete_model

Permanently removes a model.

```typescript
{
  name: "veritas_delete_model",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" }
    },
    required: ["id"]
  }
}
```

### veritas_export_model

Exports a model as a self-contained JSON document.

```typescript
{
  name: "veritas_export_model",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      format: { type: "string", enum: ["json", "csv"], default: "json" }
    },
    required: ["id"]
  }
}
```

**Returns:** Complete model JSON or CSV text content.

### veritas_import_model

Imports a model from a JSON document, creating a new model.

```typescript
{
  name: "veritas_import_model",
  inputSchema: {
    type: "object",
    properties: {
      model_data: {
        type: "object",
        description: "Complete DigitalModel JSON (as exported by veritas_export_model)"
      }
    },
    required: ["model_data"]
  }
}
```

### veritas_get_schema

Returns the DigitalModel and DigitalElement TypeScript schemas for agent understanding.

```typescript
{
  name: "veritas_get_schema",
  inputSchema: {
    type: "object",
    properties: {}
  }
}
```

**Returns:** JSON Schema definitions for `DigitalModel` and `DigitalElement` types. Enables an LLM agent to understand the full type surface before constructing requests.

### veritas_mmot_evaluate

Performs a Managerial Moment of Truth evaluation on a Performance Review model (type 2). This is the only LOCAL_TOOL — it runs inference against a local or configured LLM without requiring the Veritas API.

```typescript
{
  name: "veritas_mmot_evaluate",
  inputSchema: {
    type: "object",
    properties: {
      model: {
        type: "object",
        description: "Complete DigitalModel (type 2) to evaluate"
      },
      focus_elements: {
        type: "array",
        items: { type: "string" },
        description: "Optional: Idug values of elements to focus evaluation on"
      }
    },
    required: ["model"]
  }
}
```

**Returns:** MMOT evaluation result structured as:

```typescript
interface MMOTEvaluation {
  model_id: string;
  evaluated_at: string;           // ISO timestamp
  overall_assessment: string;     // Narrative summary
  steps: {
    acknowledge: string;          // What is the current reality?
    analyze: string;              // What patterns emerge from state × trend?
    plan: string;                 // What actions advance the desired outcome?
    document: string;             // What should be recorded for future review?
  };
  element_assessments: Array<{
    element_id: string;
    element_name: string;
    state: boolean;               // TwoFlag
    trend: -1 | 0 | 1;           // ThreeFlag
    assessment: string;           // Element-specific narrative
    priority: "critical" | "warning" | "monitor" | "success";
  }>;
  structural_tensions: string[];  // Identified tensions in the model
  advancing_patterns: string[];   // Opportunities for advancement
}
```

**MMOT Domain Boundary:** Veritas evaluates `DigitalModel` elements — their state, trend, and structural relationships. It does NOT evaluate STC (Structural Tension Charts) — that domain belongs to `coaia-narrative`. The MMOT four-step cycle (Acknowledge → Analyze → Plan → Document) applies to model dimensions, not chart narratives.

---

## Authentication

All NETWORK_TOOLS require authentication via the `VERITAS_API_KEY` environment variable:

```
VERITAS_API_KEY=<static-uuid-token>
```

The server reads this at startup and includes it as a Bearer token in all API requests:

```
Authorization: Bearer <VERITAS_API_KEY>
```

LOCAL_TOOLS (`veritas_mmot_evaluate`) do not require API authentication — they run inference locally.

---

## Error Handling

### Error Response Shape

All tools return errors in MCP's standard `isError: true` format:

```typescript
interface ToolError {
  isError: true;
  content: [{
    type: "text";
    text: string;  // Human-readable error message
  }];
}
```

### Error Categories

| Category | Example | Behavior |
|----------|---------|----------|
| **Authentication** | Missing/invalid API key | Return clear message: "VERITAS_API_KEY not configured" |
| **Not Found** | Model ID doesn't exist | Return "Model not found: {id}" |
| **Validation** | Invalid model_type value | Return schema validation details |
| **Network** | API unreachable | Return "Veritas API unreachable at {url}" |
| **Type Mismatch** | MMOT eval on type 1 model | Return "MMOT evaluation requires type 2 (Performance Review) model" |

### Graceful Degradation

- If `VERITAS_API_KEY` is not set, NETWORK_TOOLS return authentication errors but LOCAL_TOOLS remain functional
- If `VERITAS_API_URL` is not set, defaults to `https://api.example.com`
- Network timeouts produce clear messages with the URL that was attempted

---

## Dependencies

- **Runtime:** Node.js ≥ 18, `@modelcontextprotocol/sdk`, `zod` (schema validation)
- **Types consumed:** `DigitalModel`, `DigitalElement`, `HistoryEntry` from veritas types
- **Kinship:**
  - → `api_client.spec.md` — HTTP client used by all NETWORK_TOOLS
  - → `coaia-narrative` MCP — sibling MCP server handling STC chart evaluation (different domain)
  - → `mia-code` MCP — sibling pattern reference for CLI-delegation style MCP architecture
  - → `mmot_generation.spec.md` — describes the autonomous LLM workflow that invokes these tools

---

## Advancing Patterns

- **Resource Exposure** — Expose models as MCP Resources (read-only browsable context) alongside tool invocation, enabling agents to reference model state without explicit tool calls
- **Prompt Templates** — Provide MCP Prompt templates for common workflows (e.g., "Create quarterly performance review", "Evaluate team health") that agents can discover and invoke
- **Streaming Evaluation** — Stream MMOT evaluation results as they generate, enabling real-time agent reasoning during long evaluations
- **Multi-Model Comparison** — Enable cross-model analysis where an agent evaluates relationships between multiple models (e.g., "How does team performance relate to project decision outcomes?")
- **Webhook Subscriptions** — Allow agents to subscribe to model change events, enabling reactive workflows when models are updated through the web interface
