# PDE Facet 02: Rispecs & Specifications

**UUID**: facet-02-rispecs-specifications
**Direction**: EAST (Vision) → NORTH (Action)
**Priority**: SECONDARY — supports Facet 01

## What Wants to Be Created

New rispecs (RISE specifications) for the MCP server and CLI tool, authored in SpecLang prose-code following the conventions observed across medicine-wheel, coaia-narrative, and mia-code rispecs. Additionally, review old `specs/` directory and determine what is already captured in `rispecs/` vs what needs migration.

## Desired Outcome

- New rispecs in `./rispecs/`:
  - `mcp-server.spec.md` — MCP server architecture, tool definitions, transport protocol
  - `cli-tool.spec.md` — CLI commands, argument patterns, output formatting
  - `mmot-generation.spec.md` — How LLMs use veritas tools to autonomously generate Performance Review Models
  - `api-client.spec.md` — API client patterns, auth, error handling
- Old `specs/` evaluated: contents already implied by existing rispecs get noted; any unique content migrated
- All new rispecs follow medicine-wheel convention:
  - Desired Outcome → Creative Intent → Types → Dependencies → Advancing Patterns

## Current Reality

- 8 rispecs exist in `./rispecs/`:
  - `app.spec.md`, `analysis_workflow.spec.md`, `decision_making_model.spec.md`
  - `model_generation.spec.md`, `model_persistence.spec.md`
  - `performance_review_model.spec.md`, `visualization_dashboard.spec.md`
  - `README.md`
- 4 old specs in `./specs/`:
  - `TandT_Base.spec.md`, `TandT_Agent_Discussion.spec.md`
  - `TandT_Human_Review.spec.md`, `TandT_LLM_Regeneration.spec.md`
- Old specs contain foundational TandT guidance (model types, algorithms, AI integration)
- Much of old specs content is already represented in rispecs (app.spec.md covers most)
- No MCP or CLI rispecs exist yet

## Action Stack

1. **SOUTH**: Survey all existing rispecs for section structure, naming, kinship references
2. **SOUTH**: Read old specs/ to identify unique content not yet in rispecs/
3. **NORTH**: Author `mcp-server.spec.md` following medicine-wheel convention
4. **NORTH**: Author `cli-tool.spec.md`
5. **NORTH**: Author `mmot-generation.spec.md` — the LLM workflow for autonomous MMOT creation
6. **NORTH**: Author `api-client.spec.md`
7. **NORTH**: Update `rispecs/README.md` with new spec index
8. **WEST**: Validate rispecs cross-reference each other correctly
9. **WEST**: Validate SpecLang compliance (creative orientation, no problem-solving language)

## Files Needed

- All files in `./rispecs/` and `./specs/`
- `/a/src/coaia-narrative/rispecs/` — convention precedent
- `/a/src/mia-code/rispecs/` — convention precedent
- `/workspace/repos/jgwill/medicine-wheel/rispecs/` — convention precedent
- `/a/src/llms/llms-rise-framework.txt` — SpecLang rules

## Ambiguities

- [IMPLICIT] Should old specs/ be deleted? → User said "might be deleted if all is implied" — evaluate and recommend
- [IMPLICIT] Naming convention: `.spec.md` vs `.rispec.md`? → Follow existing convention (`.spec.md`)

## WEST Direction (Validation)

- New rispecs follow observed section structure
- No problem-solving language (gaps, fixes, issues)
- Cross-references between rispecs are valid
- Old specs content is accounted for (migrated or noted as covered)
