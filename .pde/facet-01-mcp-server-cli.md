# PDE Facet 01: MCP Server & CLI Tool

**UUID**: facet-01-mcp-server-cli
**Direction**: NORTH (Action — what executes the cycle)
**Priority**: PRIMARY INTENT

## What Wants to Be Created

A new `./mcp/` directory containing a Model Context Protocol server and a companion CLI tool that together enable LLMs to programmatically create, evaluate, and manage Veritas Performance Review Models (MMOT type 2) and Decision Making Models (type 1) through the deployed API at `https://veritas.sanctuaireagentique.com`.

## Desired Outcome

- `./mcp/` directory with a fully functional MCP server (TypeScript, stdio transport)
- MCP tools that map to Veritas API endpoints:
  - `veritas_list_models` — List available models
  - `veritas_get_model` — Load a specific model
  - `veritas_create_model` — Create new model (type 1 or 2) with elements
  - `veritas_update_model` — Update model elements
  - `veritas_delete_model` — Remove a model
  - `veritas_generate_model` — AI-powered model generation from description (calls `/api/llm/generate-model`)
  - `veritas_analyze_model` — Get analysis summary
  - `veritas_suggest_actions` — Get action recommendations
  - `veritas_perform_mmot` — Execute MMOT four-step evaluation on a model
  - `veritas_export_model` / `veritas_import_model` — JSON import/export
- A CLI tool (`veritas-cli` or `npx veritas`) that wraps the same API calls
- Both MCP and CLI authenticate via `VERITAS_API_KEY` environment variable
- An LLM using these tools can autonomously generate a complete Performance Review Model

## Current Reality

- Veritas has a deployed API at `https://veritas.sanctuaireagentique.com` with endpoints:
  - `POST /api/llm/generate-model` — AI model generation
  - `GET/POST/PATCH/DELETE /api/models` — CRUD
  - `POST /api/auth/login` — Authentication
- No MCP server exists (`./mcp/` does not exist)
- No CLI tool exists
- `geminiService.ts` contains AI integration logic (model generation, suggestions, analysis)
- `modelService.ts` contains CRUD operations
- `types.ts` defines DigitalModel, DigitalElement interfaces
- coaia-narrative already has an MCP server pattern (`mcp_tool_interface.spec.md`, `mcp_api_specification.spec.md`) to follow as precedent

## Action Stack (Strategic Secondary Choices)

1. **SOUTH**: Read coaia-narrative's MCP server implementation and `mcp_api_specification.spec.md` for tool design patterns
2. **SOUTH**: Read mia-code's `mcp.rispecs.md` for MCP server patterns (JSON-RPC 2.0 over stdio)
3. **NORTH**: Create `./mcp/package.json` with @modelcontextprotocol/sdk dependency
4. **NORTH**: Create `./mcp/src/index.ts` — MCP server entry point with tool registrations
5. **NORTH**: Create `./mcp/src/api-client.ts` — HTTP client wrapping Veritas API endpoints
6. **NORTH**: Create `./mcp/src/tools/` — Individual tool handlers (model CRUD, AI generation, MMOT)
7. **NORTH**: Create `./mcp/src/types.ts` — Shared types (re-export from parent where applicable)
8. **NORTH**: Create `./cli/` directory with CLI entry point using commander.js
9. **NORTH**: Create `./cli/src/commands/` — CLI command implementations
10. **WEST**: Validate MCP server starts and responds to tool calls
11. **WEST**: Validate CLI commands execute against deployed API

## Files Needed

- `/workspace/repos/jgwill/veritas/types.ts` — Core type definitions
- `/workspace/repos/jgwill/veritas/services/modelService.ts` — API endpoint patterns
- `/workspace/repos/jgwill/veritas/services/geminiService.ts` — AI integration patterns
- `/workspace/repos/jgwill/veritas/services/authService.ts` — Auth patterns
- `/a/src/coaia-narrative/rispecs/mcp_api_specification.spec.md` — MCP tool design precedent
- `/a/src/coaia-narrative/rispecs/mcp_tool_interface.spec.md` — MCP interface patterns
- `/a/src/mia-code/rispecs/mcp.rispecs.md` — MCP server patterns

## Ambiguities

- [IMPLICIT] Should MCP server call the deployed API or operate locally? → Resolved: Call deployed API
- [IMPLICIT] Auth mechanism: API key vs login flow? → Use `VERITAS_API_KEY` env var for simplicity
- [IMPLICIT] Should CLI be a separate package or part of MCP? → Separate `./cli/` directory
- [EXPLICIT] "process the generation of a new MMOT" — does this mean a full MMOT four-step loop or just creating a type 2 model? → Both: create model + provide MMOT evaluation tool

## WEST Direction (Validation)

- MCP server starts without errors
- Each tool responds with valid JSON
- CLI commands match MCP tool capabilities
- An LLM can autonomously create a Performance Review Model through the tools
- Auth works with VERITAS_API_KEY
