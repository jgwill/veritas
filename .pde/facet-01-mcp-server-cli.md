# PDE Facet 01: MCP Server & CLI Tool

**UUID**: facet-01-mcp-server-cli
**Direction**: NORTH (Action — what executes the cycle) ← NOTE: direction mapping under active discussion, see .mw/README.md
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
- Both MCP and CLI authenticate via `VERITAS_API_KEY` environment variable (static UUID token, not JWT — see `.env`)
- An LLM using these tools can autonomously generate a complete Performance Review Model
- `veritas_generate_model` calls the API's `/api/llm/generate-model` which uses Gemini server-side — the LLM calling the tool does NOT construct the model JSON itself, it sends a description and gets back a complete `DigitalModel`

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

## ⚠️ Key Structural Tension: MMOT Ownership

coaia-narrative already has `perform_mmot_evaluation` as a tool that evaluates STC charts using the MMOT 4-step process. Veritas is building MMOT MCP tools for its own `DigitalModel` evaluation. These serve DIFFERENT purposes:
- **coaia-narrative MMOT**: evaluates STC chart progress (Entity/Relation JSONL) — is the chart advancing or oscillating?
- **veritas MMOT**: evaluates Performance Review Models (DigitalModel with DigitalElements) — are DESIGN and EXECUTION elements acceptable?

The veritas MCP should NOT duplicate coaia-narrative's STC evaluation. It should own `DigitalModel` evaluation. If STC evaluation is needed, delegate to coaia-narrative.

## ⚠️ Network vs Local — TWO MODES REQUIRED

The MCP is a network client (calls `veritas.sanctuaireagentique.com`). The `.mw/` vision is local-first. **Both modes must coexist.**

**Network mode**: Model CRUD, AI generation via Veritas API (requires `VERITAS_API_KEY`)
**Local mode**: MMOT evaluation on local JSONL charts, writes artifacts to `.mw/north/`

**Precedent**: `mcp-pde` (network, Anthropic API) vs `mia-code/miaco decompose` (local, spawns claude/gemini/copilot binary). Same decomposition, two modes.

**DELEGATE (subagent with claude-opus-4.6)**: Have a subagent analyze `/a/src/mia-code/miaco/src/decompose.ts` and `/a/src/mia-code/miaco/src/commands/stc.ts` to understand the local-engine pattern (spawning LLM binaries). Then design how `veritas-cli mmot evaluate --local -M .mw/south/chart.jsonl` would work — spawning a local LLM to generate MMOT evaluation, writing results to `.mw/north/`. This is the same pattern miaco uses for PDE decomposition.

**DELEGATE (subagent with claude-opus-4.6)**: Have a subagent analyze `/a/src/mia-code/miaco/src/commands/chart.ts` and propose what `miaco mmot evaluate` would look like as a new miaco command that wraps veritas' local evaluation. Reference: the miaco CLI already has `decompose` (east), `stc convert` (south→south), `chart` (south). Adding `mmot` gives it the west→north leg. Propose rispecs at `/a/src/mia-code/rispecs/mmot-integration.spec.md`.

## Type Reference

`DigitalModel` has `DigitalThinkingModelType: number` where:
- Type 1 = Decision Making Model (binary yes/no evaluation of elements)
- Type 2 = Performance Review Model (DESIGN + EXECUTION element categories with state/trend)

Each `DigitalElement` has `ThreeFlag` (-1/0/1) for evaluation state and `Status` for lifecycle.

## Files Needed

- `/workspace/repos/jgwill/veritas/types.ts` — Core type definitions (DigitalModel, DigitalElement)
- `/workspace/repos/jgwill/veritas/services/modelService.ts` — API endpoint patterns
- `/workspace/repos/jgwill/veritas/services/geminiService.ts` — AI integration (uses Gemini server-side via VERITAS_GEMINI_API_KEY)
- `/workspace/repos/jgwill/veritas/constants.ts` — Example Performance Review Model with 8+ elements
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
