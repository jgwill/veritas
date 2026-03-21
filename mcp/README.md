# Veritas MCP Server

MCP server that enables LLMs to create, evaluate, and manage **TandT (Twos and Threes) Digital Thinking** models for decision-making and performance review via the deployed veritas API.

## What It Does

This server exposes 9 tools that let any MCP-compatible LLM host (Claude Desktop, Cursor, VS Code Copilot, etc.) interact with the veritas platform:

- **List, read, create, update, and delete** TandT models
- **Generate models** using server-side Gemini AI from a topic + element descriptions
- **Export/import** models as local JSON files
- **Run MMOT evaluations** — structured Managerial Moment of Truth 4-step analysis

## Installation

```bash
cd mcp
npm install
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VERITAS_API_KEY` | Yes | — | Bearer token for API authentication |
| `VERITAS_API_URL` | No | `https://veritas.sanctuaireagentique.com` | API base URL |
| `VERITAS_TOOLS` | No | `NETWORK_TOOLS,LOCAL_TOOLS` | Comma-separated tool groups to enable |
| `VERITAS_DISABLED_TOOLS` | No | — | Comma-separated tool names to disable (e.g., `veritas_delete_model`) |

### MCP Host Setup

#### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "veritas": {
      "command": "npx",
      "args": ["tsx", "/path/to/veritas/mcp/src/index.ts"],
      "env": {
        "VERITAS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "veritas": {
      "command": "npx",
      "args": ["tsx", "/path/to/veritas/mcp/src/index.ts"],
      "env": {
        "VERITAS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### VS Code / GitHub Copilot (`.vscode/mcp.json`)

```json
{
  "servers": {
    "veritas": {
      "command": "npx",
      "args": ["tsx", "${workspaceFolder}/mcp/src/index.ts"],
      "env": {
        "VERITAS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tool Catalog

### Network Tools (API)

#### `veritas_list_models`
List all models for the authenticated user.

```
Input: (none)
Output: { count: number, models: [{id, name, type, description}] }
```

#### `veritas_get_model`
Fetch a complete model with all elements, flags, and history.

```
Input: { modelId: "uuid" }
Output: { id, name, topic, type, typeName, elementCount, elements: [...], raw: DigitalModel }
```

#### `veritas_generate_model`
Generate a new model via server-side Gemini AI. The caller provides topic and element names; the server's Gemini fills in the full structure.

```
Input: {
  topic: "Q1 Engineering Performance",
  model_type: 2,
  description: "Quarterly review of engineering team",
  elements: [
    { name: "Code Quality", description: "Review standards adherence", state: 1, trend: 1 },
    { name: "Velocity", description: "Sprint completion rate", state: 0, trend: -1 },
    { name: "Collaboration", state: 1 }
  ]
}
Output: { message: "...", model: { id, name, model_type, description, created_at } }
```

#### `veritas_update_model`
Update an existing model's name, description, or element data.

```
Input: { modelId: "uuid", name: "Updated Name", description: "New description" }
Output: { success: true, modelId, updatedFields: ["name", "description"] }
```

#### `veritas_delete_model`
Permanently delete a model.

```
Input: { modelId: "uuid" }
Output: { success: true, modelId, message: "Model uuid deleted." }
```

#### `veritas_export_model`
Export a model from the API to a local JSON file.

```
Input: { modelId: "uuid", outputPath: "./exports/my-model.json" }
Output: { success: true, exportedTo: "/absolute/path/my-model.json", elementCount: 7 }
```

#### `veritas_import_model`
Import a model from a local JSON file into the API.

```
Input: { filePath: "./my-model.json" }
Output: { success: true, newModelId: "uuid", elementCount: 7 }
```

#### `veritas_get_schema`
Retrieve the OpenAPI schema for the veritas LLM API endpoints.

```
Input: (none)
Output: { openapi: "3.1.0", paths: {...}, components: {...} }
```

### Local Tools

#### `veritas_mmot_evaluate`
Perform a Managerial Moment of Truth (MMOT) 4-step evaluation:

1. **Acknowledge** — Summarize each element's state/trend, identify unmet expectations
2. **Analyze** — Trace root causes for each concern
3. **Plan** — Create advancing (not reactive) action plans
4. **Document** — Structured report with recommendations

```
Input: {
  modelId: "uuid",          // OR filePath: "./model.json"
  outputDir: ".mw/north/",  // default
  llmBinary: "gemini"       // gemini | claude | copilot
}
Output: { success: true, outputFile: ".mw/north/mmot-ModelName-2026-03-21.md", summary: "..." }
```

If no LLM binary is available, the tool saves the MMOT prompt to the output directory for manual evaluation.

## Model Types

| Type | Name | Use Case |
|---|---|---|
| 1 | Decision Making | Binary choice analysis with pairwise element comparison |
| 2 | Performance Review | Multi-factor assessment with state/trend tracking |

## Tool Groups

Control which tools are available:

```bash
# Only network tools (no local MMOT)
VERITAS_TOOLS="NETWORK_TOOLS"

# Disable deletion
VERITAS_DISABLED_TOOLS="veritas_delete_model"

# Only local evaluation
VERITAS_TOOLS="LOCAL_TOOLS"
```

## Development

```bash
# Run with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start server
npm start
```
