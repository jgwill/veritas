# SOUTH — MCP Server & CLI Tool Patterns Research

> PDE Facet 01 Deep Search | 2026-03-21
> Direction: SOUTH (🔥 Analysis — what needs to be learned)

---

## Existing MCP Patterns Found

### coaia-narrative: Direct MCP Server (the reference implementation)

coaia-narrative is a **direct MCP server** — the process itself *is* the server. It uses `@modelcontextprotocol/sdk@^0.6.0` with the low-level `Server` class (not McpServer which requires Zod schemas).

**Transport**: JSON-RPC 2.0 over `StdioServerTransport` (stdin/stdout).

**Architecture** (clean 4-file separation):
```
index.ts              — Entry point: wires Server + Transport + handlers
src/tool-definitions.ts — Pure data: MCPTool[] array with inputSchema objects
src/tool-handlers.ts    — Pure function: handleToolCall(name, args, manager) → result
src/tool-groups.ts      — Filtering: COAIA_TOOLS env var enables/disables tool groups
```

**Tool naming convention**: `snake_case` verbs — `create_structural_tension_chart`, `list_active_charts`, `mark_action_complete`, `perform_mmot_evaluation`. No namespace prefix (the server name itself provides namespace).

**Tool groups** (env-configurable):
- `STC_TOOLS` — 14 structural tension tools
- `NARRATIVE_TOOLS` — 3 narrative beat tools
- `KG_TOOLS` — 9 knowledge graph tools
- `CORE_TOOLS` — 4 minimal tools

Filtering via `COAIA_TOOLS="STC_TOOLS,NARRATIVE_TOOLS"` and `COAIA_DISABLED_TOOLS="delete_entities"`.

**Error pattern**: Returns `{ content: [{ type: "text", text: "Error: ..." }], isError: true }`.

**Validation**: Custom `validate()` function with `ValidationSchemas` — not Zod. Validates before executing.

**Result pattern**: Always returns `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`. Some tools return formatted markdown (e.g., `list_active_charts` returns a hierarchy string).

### mia-code: CLI-Wrapper MCP Servers (the delegation pattern)

mia-code wraps sub-CLIs (miaco, miatel, miawa) as MCP servers using `@modelcontextprotocol/sdk@^1.27.1`. Each server is a **standalone Node.js process** that delegates tool calls to CLI commands via `child_process.spawn`.

**Architecture** (shared utils + per-server modules):
```
src/mcp/utils.ts          — bootstrapMCPServer(), runCLI(), buildArgs(), createToolResult()
src/mcp/miaco-server.ts   — Tool defs + handler + config export + isMain guard
src/mcp/miatel-server.ts  — Same pattern
src/mcp/miawa-server.ts   — Same pattern
src/mcp/config-generator.ts — Generates MCP config JSON for host setup
src/mcp/index.ts          — Registry: re-exports all
```

**Tool naming convention**: `{server}_{domain}_{action}` — `miaco_chart_create`, `miaco_decompose`, `miatel_beat_create`, `miawa_ceremony_init`. Prefixed because multiple servers may be loaded simultaneously.

**CLI delegation flow**:
```
MCP Host → tools/call → handleMiacoTool(name, args)
  → buildArgs(["chart", "create"], args, { outcome: "--outcome", ... })
  → runCLI(CLI_PATH, [...cliArgs, "--json"])
  → spawn("node", [path, ...args, "--json"])
  → parseJSONOutput(stdout)
  → createToolResult(parsed)
```

**Key detail**: All CLI commands support `--json` flag for machine-readable output. CLI adds `FORCE_COLOR=0` env to suppress chalk colors.

**isMain guard** for dual-use files (library + executable):
```typescript
const isMain = process.argv[1]?.endsWith("miaco-server.js") || process.argv[1]?.endsWith("miaco-server.ts");
if (isMain) bootstrapMCPServer(config, handler);
```

### Local LLM Engine Pattern (from decompose.ts)

miaco's decompose module spawns LLM binaries as child processes. **This is the pattern veritas local mode should follow**.

**Engine configuration**:
```typescript
const ENGINE_DEFAULTS: Record<PdeEngine, { binary: string; defaultModel: string }> = {
  gemini:  { binary: process.env.MIA_CODE_GEMINI_BIN || "gemini",   defaultModel: "gemini-2.5-pro" },
  claude:  { binary: process.env.MIA_CODE_CLAUDE_BIN || "claude",   defaultModel: "sonnet" },
  copilot: { binary: process.env.MIA_CODE_COPILOT_BIN || "copilot", defaultModel: "gpt-4.1" },
};
```

**Per-engine argument construction**:
- `gemini`: `gemini -m <model> -p "<prompt>"`
- `claude`: `claude <prompt> --print --output-format json --model <model>`
- `copilot`: `copilot -p "<prompt>" --allow-all-tools --model <model>`

**Spawn pattern** (no shell, stdio piped):
```typescript
const child = spawn(binary, args, {
  env: process.env,
  shell: false,
  stdio: ["ignore", "pipe", "pipe"],
});
```

**Claude output unwrapping**: Claude's `--output-format json` wraps result in `{ type: "result", result: "..." }`, which decompose.ts unwraps.

**JSON extraction**: Robust parsing handles raw JSON, ```json fences, and brace-hunting fallbacks.

---

## Network Client Design

### API Surface (from actual route handlers)

Base URL: `https://veritas.sanctuaireagentique.com` (production) or configurable via `VERITAS_API_URL`.

**Authentication**: Two paths in `lib/auth.ts`:
1. **Session token**: `Bearer <session_token>` — resolves via DB sessions table
2. **API key**: `Bearer <VERITAS_API_KEY>` — static env var comparison, maps to dedicated `api@veritas.local` user

For CLI/MCP, use path 2: set `VERITAS_API_KEY` in .env, pass as `Authorization: Bearer <key>`.

### Complete Endpoint Map

| Method | Path | Purpose | Auth | Request Body | Response |
|--------|------|---------|------|-------------|----------|
| GET | `/api/models` | List user's models | ✅ | — | `{ models: [{id, name, description, model_type, ...}] }` |
| POST | `/api/models` | Create model (raw) | ✅ | `{name, description, modelType, modelData}` | `{ model: {...} }` |
| GET | `/api/models/:id` | Get model with data | ✅ | — | `{ model: {id, name, model_type, model_data, ...} }` |
| PUT | `/api/models/:id` | Update model | ✅ | `{name?, description?, modelData?, isArchived?}` | `{ model: {...} }` |
| DELETE | `/api/models/:id` | Delete model | ✅ | — | `{ success: true }` |
| POST | `/api/llm/generate-model` | Create with elements | ✅ | `{topic, model_type?, description?, elements[]}` | `{ model, message }` |
| GET | `/api/llm/schema` | OpenAPI schema | ❌ | — | OpenAPI 3.1.0 JSON |
| GET | `/api/models/:id/snapshots` | Model snapshots | ✅ | — | snapshots array |
| GET | `/api/models/:id/notes` | Model notes | ✅ | — | notes array |
| GET | `/api/templates` | Template library | ✅ | — | templates |

### Key: `/api/llm/generate-model` Contract

This is the primary endpoint for `veritas_generate_model` MCP tool. The **LLM caller does NOT construct DigitalModel JSON** — it sends simple elements and the server builds full DigitalElement objects with UUIDs, comparison tables, etc.

```typescript
// Request
{
  topic: string,           // Required. Model name.
  model_type: 1 | 2,      // 1=Decision, 2=Performance Review (default 2)
  description?: string,
  elements: [{             // 2–20 elements
    name: string,          // Required
    description?: string,
    state?: -1|0|1,        // type 2 only: declining/stable/improving
    trend?: -1|0|1         // type 2 only: concern/neutral/strength
  }]
}

// Response (201)
{
  model: { id, name, model_type, description, created_at, updated_at },
  message: "Performance Review model \"...\" created with N elements."
}
```

### HTTP Client Architecture

```typescript
// Pattern from modelService.ts
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
});

// Network calls use fetch() with these headers
// Error handling: check response.ok, throw on failure
```

For the CLI, the HTTP client should:
1. Read `VERITAS_API_KEY` from env or `--api-key` flag
2. Read `VERITAS_API_URL` from env or `--api-url` flag (default: `https://veritas.sanctuaireagentique.com`)
3. Wrap fetch with auth headers
4. Return parsed JSON on success, structured error on failure

---

## Local Mode Design

### What Local Mode Does

Local MMOT evaluation on DigitalModel type 2 elements stored in local JSONL files. Reads from `.mw/` or specified paths, evaluates using local LLM, writes results to `.mw/north/`.

### Pattern to Follow (from miaco decompose.ts)

**Engine selection**: Same multi-engine pattern — gemini, claude, copilot binaries.

**Prompt construction for MMOT evaluation**:
```
Given this DigitalModel (Performance Review type 2):
- Elements with TwoFlag (strength/concern) and ThreeFlag (state: -1/0/1)
- Generate MMOT evaluation: Acknowledge, Analyze, Plan, Feedback

Output JSON with updated element assessments.
```

**Storage pattern**: `.mw/north/` for output (following miaco's `.pde/` convention of directory-based storage).

**JSONL format**: One JSON object per line (from coaia-narrative's Entity/Relation pattern).

### Deterministic Fallback

miaco's `stc.ts` includes a `deterministicConvert()` function that works without any LLM — pure structural transformation. Veritas local mode should similarly have a non-LLM path for basic MMOT eval (just reading TwoFlag/ThreeFlag state from JSONL and computing summaries).

---

## Tool Registry Design

### VERITAS MCP Tool Catalog

Following coaia-narrative's naming (no prefix, server name is namespace) for a single `veritas` server:

#### Network Tools (call veritas API)

**1. `veritas_list_models`**
```json
{
  "name": "veritas_list_models",
  "description": "List all available TandT models for the authenticated user",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```
Response: Array of `{ id, name, type, description }`.

**2. `veritas_get_model`**
```json
{
  "name": "veritas_get_model",
  "description": "Get a specific TandT model with full element data",
  "inputSchema": {
    "type": "object",
    "properties": {
      "modelId": { "type": "string", "description": "UUID of the model to retrieve" }
    },
    "required": ["modelId"]
  }
}
```
Response: Full DigitalModel with all elements.

**3. `veritas_generate_model`**
```json
{
  "name": "veritas_generate_model",
  "description": "Create a new TandT model. For Performance Review (type 2): each element has state (-1 declining, 0 stable, 1 improving) and trend (-1 concern, 0 neutral, 1 strength). For Decision Making (type 1): elements are compared pairwise. The server builds the full model — caller provides only element names and optional assessments.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "topic": { "type": "string", "description": "Model title (e.g. 'Q2 Engineering Team Performance')" },
      "model_type": { "type": "number", "description": "1 = Decision Making, 2 = Performance Review (default: 2)", "enum": [1, 2] },
      "description": { "type": "string", "description": "Optional notes about the model" },
      "elements": {
        "type": "array",
        "description": "2-20 elements to include",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string", "description": "Element name (e.g. 'Code Quality')" },
            "description": { "type": "string", "description": "What this element measures" },
            "state": { "type": "number", "description": "Type 2 only: -1 declining, 0 stable, 1 improving", "enum": [-1, 0, 1] },
            "trend": { "type": "number", "description": "Type 2 only: -1 concern, 0 neutral, 1 strength", "enum": [-1, 0, 1] }
          },
          "required": ["name"]
        }
      }
    },
    "required": ["topic", "elements"]
  }
}
```
Response: `{ model: { id, name, model_type }, message }`.

**4. `veritas_update_model`**
```json
{
  "name": "veritas_update_model",
  "description": "Update a TandT model's name, description, or element data",
  "inputSchema": {
    "type": "object",
    "properties": {
      "modelId": { "type": "string", "description": "UUID of the model to update" },
      "name": { "type": "string", "description": "New model name" },
      "description": { "type": "string", "description": "New description" },
      "modelData": { "type": "object", "description": "Updated model data (Model array + history)" }
    },
    "required": ["modelId"]
  }
}
```

**5. `veritas_delete_model`**
```json
{
  "name": "veritas_delete_model",
  "description": "Delete a TandT model permanently",
  "inputSchema": {
    "type": "object",
    "properties": {
      "modelId": { "type": "string", "description": "UUID of the model to delete" }
    },
    "required": ["modelId"]
  }
}
```

**6. `veritas_export_model`**
```json
{
  "name": "veritas_export_model",
  "description": "Export a model as a complete JSON file for backup or sharing",
  "inputSchema": {
    "type": "object",
    "properties": {
      "modelId": { "type": "string", "description": "UUID of the model to export" },
      "outputPath": { "type": "string", "description": "File path to write JSON (default: ./<model_name>.json)" }
    },
    "required": ["modelId"]
  }
}
```

**7. `veritas_import_model`**
```json
{
  "name": "veritas_import_model",
  "description": "Import a TandT model from a JSON file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filePath": { "type": "string", "description": "Path to the JSON model file" }
    },
    "required": ["filePath"]
  }
}
```

#### Local MMOT Evaluation Tools

**8. `veritas_mmot_evaluate`**
```json
{
  "name": "veritas_mmot_evaluate",
  "description": "Perform Managerial Moment of Truth evaluation on a Performance Review model (type 2). Evaluates each element's TwoFlag (strength/concern) and ThreeFlag (state: declining/stable/improving) and generates an MMOT assessment with Acknowledge, Analyze, Plan, and Feedback phases.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "modelId": { "type": "string", "description": "UUID of model (fetches from API) OR path to local JSONL file" },
      "source": { "type": "string", "description": "Where to read model from: 'api' or 'local'", "enum": ["api", "local"] },
      "engine": { "type": "string", "description": "LLM engine for evaluation: gemini | claude | copilot", "enum": ["gemini", "claude", "copilot"] },
      "model": { "type": "string", "description": "LLM model override" },
      "outputDir": { "type": "string", "description": "Output directory (default: .mw/north/)" },
      "phase": { "type": "string", "description": "Run specific MMOT phase only", "enum": ["acknowledge", "analyze", "plan", "feedback", "full"] }
    },
    "required": ["modelId"]
  }
}
```

**9. `veritas_get_schema`**
```json
{
  "name": "veritas_get_schema",
  "description": "Retrieve the OpenAPI schema for the TandT LLM API. Useful for understanding available endpoints and data structures.",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

### Tool Groups (env-configurable)

Following coaia-narrative's COAIA_TOOLS pattern:

```typescript
const TOOL_GROUPS: Record<string, string[]> = {
  NETWORK_TOOLS: [
    'veritas_list_models', 'veritas_get_model', 'veritas_generate_model',
    'veritas_update_model', 'veritas_delete_model',
    'veritas_export_model', 'veritas_import_model', 'veritas_get_schema'
  ],
  LOCAL_TOOLS: [
    'veritas_mmot_evaluate'
  ],
  CORE_TOOLS: [
    'veritas_list_models', 'veritas_generate_model', 'veritas_mmot_evaluate'
  ]
};
```

Configure via `VERITAS_TOOLS="NETWORK_TOOLS,LOCAL_TOOLS"` (default: all).

---

## CLI Command Design

### Commander.js Structure (following miaco pattern)

```
veritas
├── models                     # Model operations
│   ├── list                   # List models (--json)
│   ├── get <id>               # Get model details (--json)
│   ├── create                 # Create model (--topic, --type, --elements)
│   ├── update <id>            # Update model (--name, --description)
│   ├── delete <id>            # Delete model
│   ├── export <id>            # Export to JSON file (--output)
│   └── import <file>          # Import from JSON file
├── generate                   # AI-assisted model generation
│   └── (default)              # --topic, --type, --description, --elements
├── mmot                       # MMOT evaluation
│   ├── evaluate <id|file>     # Run MMOT eval (--engine, --model, --phase, --output)
│   └── status                 # Show evaluation status
├── mcp-config                 # MCP configuration
│   ├── (default)              # Generate Claude Code MCP config JSON
│   ├── --tools                # List all tool schemas
│   └── --info                 # Server metadata
└── serve                      # Start MCP server on stdio
```

### Flag Patterns (from miaco chart.ts)

```typescript
import { Command } from "commander";

const program = new Command("veritas")
  .description("TandT Digital Thinking CLI — models, MMOT evaluation, MCP server")
  .version("0.1.0");

program
  .command("models")
  .description("Model operations");

program
  .command("models list")
  .option("--json", "Output JSON for programmatic parsing")
  .option("--api-url <url>", "API base URL", process.env.VERITAS_API_URL || "https://veritas.sanctuaireagentique.com")
  .option("--api-key <key>", "API key", process.env.VERITAS_API_KEY);

program
  .command("generate")
  .requiredOption("--topic <text>", "Model topic / title")
  .option("--type <n>", "Model type: 1=Decision, 2=Performance Review", "2")
  .option("--description <text>", "Model description")
  .option("--elements <json>", "Elements as JSON array string")
  .option("--json", "Output JSON")
  .option("--api-url <url>", "API base URL")
  .option("--api-key <key>", "API key");

program
  .command("mmot evaluate <source>")
  .description("Run MMOT evaluation on a model")
  .option("--engine <engine>", "LLM engine: gemini|claude|copilot", "gemini")
  .option("--model <model>", "LLM model override")
  .option("--phase <phase>", "MMOT phase: acknowledge|analyze|plan|feedback|full", "full")
  .option("--output <dir>", "Output directory", ".mw/north/")
  .option("--json", "Output JSON");

program
  .command("serve")
  .description("Start MCP server on stdio (for Claude Code, etc.)")
  .action(() => bootstrapMCPServer(veritasConfig, handleVeritasTool));
```

### `--json` flag convention

Every command supports `--json` for machine-readable output. This is essential for MCP delegation (the MCP server calls `veritas models list --json` and parses the output).

---

## Type Mapping

### DigitalModel → MCP Tool Inputs/Outputs

**Core types** (from `types.ts`):

```typescript
interface DigitalElement {
  Idug: string;              // UUID
  DisplayName: string;       // Human-readable name
  Description: string|null;  // What it measures
  NameElement: string;       // Machine name (no spaces)
  TwoFlag: boolean;          // Strength (true) / Concern (false)
  TwoFlagAnswered: boolean;
  ThreeFlag: number;         // -1 declining, 0 stable, 1 improving
  ThreeFlagAnswered: boolean;
  DominanceFactor: number;   // For type 1 (pairwise comparison)
  ComparationTableData: { [key: string]: number }; // Pairwise comparisons
  SortNo: number;
  Status: number;            // 1=active, 3=evaluated
  // ... more fields
}

interface DigitalModel {
  Idug: string;                      // UUID
  DigitalTopic: string;              // Model title
  ModelName: string;                 // Machine name
  DigitalThinkingModelType: number;  // 1=Decision, 2=Performance Review
  Model: DigitalElement[];           // Array of elements
  history?: HistoryEntry[];
  Note: string|null;
  // ... more fields
}
```

**Mapping for MCP generate_model input** → API `/api/llm/generate-model` body:

| MCP Tool Input | API Field | Notes |
|----------------|-----------|-------|
| `topic` | `topic` | Direct pass-through |
| `model_type` | `model_type` | Direct (default 2) |
| `description` | `description` | Direct |
| `elements[].name` | `elements[].name` | Direct |
| `elements[].description` | `elements[].description` | Direct |
| `elements[].state` | `elements[].state` | -1/0/1 for type 2 only |
| `elements[].trend` | `elements[].trend` | -1/0/1 for type 2 only |

**Mapping for MCP get_model output** ← API `/api/models/:id` response:

The API returns `model_data` which contains `{ Model: DigitalElement[], history: [] }`. The MCP tool should return the full DigitalModel structure (matching `types.ts`), translating from DB format as `modelService.ts` does.

**MMOT evaluation input/output**:
- Input: DigitalModel with type 2 elements (TwoFlag + ThreeFlag populated)
- Output: MMOT assessment JSON with per-element evaluations and overall summary

### Simplified Element View (for MCP output)

When listing models, return simplified summaries (not full DigitalElement):
```typescript
interface ElementSummary {
  name: string;
  description: string;
  state: 'declining' | 'stable' | 'improving';  // ThreeFlag mapped
  trend: 'concern' | 'neutral' | 'strength';     // TwoFlag mapped
}
```

---

## Package.json Dependencies

### Required Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.27.1",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0",
    "tsx": "^4.7.0"
  }
}
```

**Rationale**:
- `@modelcontextprotocol/sdk@^1.27.1` — MCP protocol implementation. Use the same version as mia-code (latest). Provides `Server`, `StdioServerTransport`, `ListToolsRequestSchema`, `CallToolRequestSchema`.
- `commander@^12.0.0` — CLI framework. Both miaco and mia-code use this exact version. Provides subcommands, options, required options, help generation.
- `chalk@^5.3.0` — Terminal colors for human-readable output. ESM-only (requires `"type": "module"` in package.json).
- `tsx@^4.7.0` — TypeScript execution for development (`npx tsx src/index.ts`).

**NOT needed**:
- `zod` — coaia-narrative uses it but the low-level `Server` class accepts raw JSON schemas. Custom validation is simpler for veritas.
- `enquirer` / `ora` — Interactive prompts and spinners. Optional future enhancement.
- `@google/generative-ai` — Gemini SDK is NOT needed in the CLI. For `veritas_generate_model`, the server does the Gemini call. For local MMOT eval, we spawn the `gemini` CLI binary.
- `dotenv` — Can use but Node 20+ supports `--env-file`. Optional.

### Package.json Shape

```json
{
  "name": "veritas-cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "veritas": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "npx tsx src/index.ts",
    "start": "node dist/index.js"
  }
}
```

### File Structure

```
cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # CLI entry (Commander program)
│   ├── commands/
│   │   ├── models.ts         # models list|get|create|update|delete|export|import
│   │   ├── generate.ts       # generate (calls /api/llm/generate-model)
│   │   ├── mmot.ts           # mmot evaluate|status
│   │   └── serve.ts          # serve (starts MCP server)
│   ├── mcp/
│   │   ├── server.ts         # MCP server: tool defs + handler + bootstrap
│   │   ├── tools.ts          # Tool definitions array (pure data)
│   │   ├── handlers.ts       # Tool handlers (pure functions)
│   │   └── tool-groups.ts    # VERITAS_TOOLS env filtering
│   ├── client/
│   │   └── api.ts            # HTTP client wrapping veritas API
│   ├── local/
│   │   ├── mmot.ts           # Local MMOT evaluation engine
│   │   └── engine.ts         # LLM binary spawning (from decompose.ts pattern)
│   └── types.ts              # Shared types (re-export from main veritas types)
└── dist/                     # Compiled output
```

---

## Sources

| File | Summary |
|------|---------|
| `/a/src/coaia-narrative/rispecs/mcp_api_specification.spec.md` | Complete MCP tool schemas for STC, narrative beats, knowledge graph — 13+ tool definitions with input/output JSON schemas |
| `/a/src/coaia-narrative/rispecs/mcp_tool_interface.spec.md` | Natural language integration patterns, tool groups (STC_TOOLS, KG_TOOLS, CORE_TOOLS), env-based filtering, error-as-teaching pattern |
| `/a/src/mia-code/rispecs/mcp.rispecs.md` | MCP architecture: JSON-RPC 2.0 over stdio, CLI-wrapper delegation, tool catalog for miaco/miatel/miawa (18 tools) |
| `/a/src/mia-code/miaco/src/decompose.ts` | Multi-engine LLM spawning (gemini/claude/copilot), system prompt construction, JSON extraction, PDE storage in `.pde/` |
| `/a/src/mia-code/miaco/src/commands/stc.ts` | PDE→STC conversion, LLM-assisted JSONL generation, deterministic fallback without LLM, Entity/Relation JSONL format |
| `/a/src/mia-code/miaco/src/commands/chart.ts` | Commander.js chart commands (create/list/add-step/complete/review), `--json` flag pattern, `--session` option, SessionStorage |
| `/a/src/mia-code/src/mcp/utils.ts` | MCP bootstrap utility: `bootstrapMCPServer()`, `runCLI()`, `buildArgs()`, `createToolResult()`, `parseJSONOutput()` |
| `/a/src/mia-code/src/mcp/miaco-server.ts` | Complete MCP server wrapping miaco CLI — 8 tools, handler switch, CLI delegation, isMain guard, config export |
| `/a/src/mia-code/src/mcp/config-generator.ts` | MCP config JSON generation for Claude Code — per-server enable/disable, tool manifest, server info |
| `/a/src/coaia-narrative/index.ts` | Direct MCP server entry point — Server + StdioServerTransport, ListTools/CallTool handlers, modular wiring |
| `/a/src/coaia-narrative/src/tool-definitions.ts` | Pure data tool definitions — ToolDefinition interface, ALL_TOOL_DEFINITIONS array |
| `/a/src/coaia-narrative/src/tool-handlers.ts` | Pure function dispatcher — handleToolCall(name, args, manager), validation before execution |
| `/a/src/coaia-narrative/src/tool-groups.ts` | COAIA_TOOLS/COAIA_DISABLED_TOOLS env parsing, group expansion, tool filtering |
| `/workspace/repos/jgwill/veritas/services/modelService.ts` | HTTP client for veritas API — fetch-based, auth headers, CRUD operations, model processing (resetAnalysisState, comparison tables) |
| `/workspace/repos/jgwill/veritas/services/geminiService.ts` | Gemini AI integration — model generation, element suggestions, analysis summaries, chat sessions, mock fallbacks |
| `/workspace/repos/jgwill/veritas/services/authService.ts` | Client-side auth — localStorage token management, login/register/validate/logout flows |
| `/workspace/repos/jgwill/veritas/lib/auth.ts` | Server-side auth — dual path: session token (DB lookup) OR VERITAS_API_KEY (env var match → api@veritas.local user) |
| `/workspace/repos/jgwill/veritas/types.ts` | Core types: DigitalModel, DigitalElement, HistoryEntry, ChatMessage, ModelSummary, AppMode enum |
| `/workspace/repos/jgwill/veritas/constants.ts` | Example models: performanceReviewModelData (9 elements, type 2), habitatModelData (7 elements, type 1 decision) |
| `/workspace/repos/jgwill/veritas/app/api/llm/generate-model/route.ts` | Server-side model generation — validates elements, builds DigitalElement[] with UUIDs/comparison tables, persists to Neon DB |
| `/workspace/repos/jgwill/veritas/app/api/llm/schema/route.ts` | OpenAPI 3.1.0 schema endpoint — Element, CreateModelRequest, Model schemas, usage examples |
| `/workspace/repos/jgwill/veritas/app/api/models/route.ts` | Models CRUD — GET list, POST create (raw), session-token auth |
| `/workspace/repos/jgwill/veritas/app/api/models/[id]/route.ts` | Single model — GET/PUT/DELETE with ownership verification |
| `/a/src/mia-code/miaco/package.json` | miaco dependencies: commander@^12.0.0, chalk@^5.3.0 (no MCP SDK — it's in parent) |
| `/a/src/mia-code/package.json` | mia-code dependencies: @modelcontextprotocol/sdk@^1.27.1, commander@^12.0.0 |
| `/a/src/coaia-narrative/package.json` | coaia-narrative dependencies: @modelcontextprotocol/sdk@^0.6.0, zod@^3.23.0, minimist |
| `/a/src/mia-code/sessions/566f21f4.../MCP_DESIGN.md` | Three-layer MCP architecture design: LLM Engine → MCP Server → CLI → Shared Persistence |

---

## Creative Orientation

What wants to be created here is a **veritas CLI + MCP server** that enables LLM agents to create and evaluate TandT models through natural conversation. The structural tension:

- **Desired outcome**: An LLM agent using Claude Code says "evaluate my team's performance" and veritas creates a Performance Review model, populates it via the API, then runs MMOT evaluation locally — all through MCP tools.
- **Current reality**: veritas has a web UI and API endpoints but no CLI or MCP interface. The patterns for building both exist fully in sibling repos (coaia-narrative for direct MCP, mia-code for CLI-wrapper MCP, miaco for local LLM spawning).

The resolution path is clear: the architecture is already proven, the API contracts are documented, the types are defined. What remains is composition — assembling these known patterns into veritas's specific domain.
