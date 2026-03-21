# WEST Direction — Validation Checklist

**Prepared**: 2026-03-21 (WEST reflection, pre-NORTH completion)
**Purpose**: Lead agent runs this checklist AFTER all NORTH executors complete
**Orientation**: Creative — each criterion asks "did this come into being?" not "what's broken?"

---

## Pre-Flight: Current Reality Snapshot

Before NORTH executors began:
- `mcp/` — does not exist
- `cli/` — does not exist
- `proposals/` — exists, empty
- `.mw/` — exists with `east/ south/ west/ north/ south-west/` subdirectories (all empty except `south-west/` which has README.md + structural-thinking-questions.md)
- `rispecs/` — 7 specs + README.md (no MCP/CLI/MMOT/API specs)
- `KINSHIP.md` — pi-mono update 2026-03-21, names `.mw/west/` but no content there
- `types.ts` — DigitalModel, DigitalElement, HistoryEntry, ChatMessage, ActionSuggestion, ModelSummary defined

---

## Facet 01: MCP Server & CLI

### Structural Existence
- [ ] `./mcp/package.json` exists
- [ ] `./mcp/package.json` declares `@modelcontextprotocol/sdk` dependency
- [ ] `./mcp/package.json` declares `zod` dependency (for input/output schemas)
- [ ] `./mcp/src/index.ts` exists as MCP server entry point
- [ ] `./mcp/src/api-client.ts` exists (HTTP client wrapping Veritas API)
- [ ] `./mcp/src/tools/` directory exists with individual tool handler files
- [ ] `./mcp/src/types.ts` exists (re-exports or mirrors parent types.ts)

### Tool Registration Completeness
- [ ] `veritas_list_models` tool registered with Zod schema
- [ ] `veritas_get_model` tool registered with Zod schema
- [ ] `veritas_create_model` tool registered with Zod schema
- [ ] `veritas_update_model` tool registered with Zod schema
- [ ] `veritas_delete_model` tool registered with Zod schema
- [ ] `veritas_generate_model` tool registered with Zod schema
- [ ] `veritas_analyze_model` tool registered with Zod schema
- [ ] `veritas_suggest_actions` tool registered with Zod schema
- [ ] `veritas_perform_mmot` tool registered with Zod schema
- [ ] `veritas_export_model` / `veritas_import_model` tools registered
- [ ] Each tool has both input AND output Zod schemas (not just input)

### Auth & Network
- [ ] `VERITAS_API_KEY` env var read for authentication (static UUID, NOT JWT)
- [ ] Network mode calls `https://veritas.sanctuaireagentique.com` (not localhost)
- [ ] API client sets proper auth header using VERITAS_API_KEY
- [ ] No hardcoded API keys in source

### MMOT Ownership Boundary (⚠️ CRITICAL)
- [ ] `veritas_perform_mmot` evaluates `DigitalModel` (type 2 Performance Review)
- [ ] `veritas_perform_mmot` does NOT evaluate STC charts / Entity-Relation JSONL
- [ ] Documentation distinguishes veritas MMOT (DigitalModel) from coaia-narrative MMOT (STC charts)
- [ ] If STC evaluation is referenced, it delegates to coaia-narrative (not duplicated)

### Generate Model Contract (⚠️ CRITICAL)
- [ ] `veritas_generate_model` sends a **description string** to `/api/llm/generate-model`
- [ ] `veritas_generate_model` does NOT construct DigitalModel JSON client-side
- [ ] Server-side Gemini does the generation — MCP tool is a passthrough
- [ ] Return type is a complete `DigitalModel` received from the API

### CLI
- [ ] `./cli/` directory exists
- [ ] CLI uses `commander.js` (or equivalent) for command parsing
- [ ] CLI commands mirror MCP tool names/capabilities (list, get, create, update, delete, generate, analyze, suggest, mmot, export, import)
- [ ] CLI reads `VERITAS_API_KEY` from environment
- [ ] CLI has a `--help` that documents all commands

### ⚠️ WEST Concerns to Flag
- **Two-mode coexistence**: Facet specifies network AND local modes. Local mode (`veritas-cli mmot evaluate --local`) spawns local LLM binary (miaco pattern). Verify whether local mode was implemented or deferred — if deferred, it must be documented as future work, not silently omitted.
- **stdio transport**: MCP server should use stdio transport (JSON-RPC 2.0 over stdin/stdout), NOT HTTP. Verify transport choice.

---

## Facet 02: Rispecs & Specifications

### New Rispecs Created
- [ ] `rispecs/mcp-server.spec.md` exists
- [ ] `rispecs/cli-tool.spec.md` exists
- [ ] `rispecs/mmot-generation.spec.md` exists
- [ ] `rispecs/api-client.spec.md` exists
- [ ] `rispecs/README.md` updated with index entries for all 4 new specs

### Medicine-Wheel Section Convention
For EACH new rispec, verify these sections exist:
- [ ] Desired Outcome section
- [ ] Creative Intent section
- [ ] Types / Data Structures section (referencing DigitalModel, DigitalElement from types.ts)
- [ ] Dependencies section (what this spec relies on)
- [ ] Advancing Patterns section (how momentum builds)

### Creative Orientation — Language Audit
- [ ] NO use of "gap" / "gaps" (problem-solving frame)
- [ ] NO use of "fix" / "fixes" / "fixing" (reactive frame)
- [ ] NO use of "issue" / "issues" (deficiency frame)
- [ ] NO use of "bridge" / "bridging" (forcing connection frame)
- [ ] NO use of "solve" / "solving" / "solution" (problem-solving frame)
- [ ] NO use of "eliminate" / "address" in deficiency context
- [ ] Language orients toward what wants to be created, not what's wrong

### SpecLang Compliance
- [ ] Variable detail level — critical paths have more detail, obvious paths are brief
- [ ] Intent-based expression — specs describe WHAT and WHY, not step-by-step HOW
- [ ] Specs are autonomous — each readable independently without other specs
- [ ] Cross-references between new rispecs use correct filenames
- [ ] Cross-references to existing rispecs (app.spec.md, performance_review_model.spec.md, etc.) are valid

### Old specs/ Accounting
- [ ] Each file in `specs/` (TandT_Base, TandT_Agent_Discussion, TandT_Human_Review, TandT_LLM_Regeneration) has been evaluated
- [ ] Unique content migrated OR explicitly noted as covered by existing rispecs
- [ ] Recommendation made: keep, migrate, or deprecate (per user guidance: "might be deleted if all is implied")

---

## Facet 03: Kinship Web & .mw/

### .mw/ Directory Structure
- [ ] `.mw/east/README.md` exists with content (Vision: MMOT as honest assessment practice)
- [ ] `.mw/south/README.md` exists with content (Learning: evaluation case studies)
- [ ] `.mw/west/README.md` exists with content (Reflection: MMOT evaluation artifacts land here)
- [ ] `.mw/north/README.md` exists with content (Integration: wisdom and accountability)

### .mw/ Scope Integrity (⚠️ CRITICAL)
- [ ] `.mw/` content describes veritas' OWN development cycle introspection
- [ ] `.mw/` does NOT contain evaluations of external repos' work
- [ ] Each direction README describes what that direction means FOR VERITAS specifically
- [ ] Pre-existing `south-west/` content preserved (structural-thinking-questions.md)

### Direction Mapping Awareness
- [ ] Direction mapping note honored: acknowledgment that mcp-pde maps WEST=Validation/NORTH=Action while Indigenous framework maps differently
- [ ] If `.mw/` uses Indigenous mapping, this is explicitly stated
- [ ] No conflation between PDE directions and ceremonial directions

### KINSHIP.md Updates
- [ ] KINSHIP.md Section 1 updated: "What this place offers" includes MCP tools and CLI
- [ ] KINSHIP.md Section 2 updated: mia-code added as sibling (not just coaia-narrative)
- [ ] KINSHIP.md Section 4: "Tensions held" updated — CLI/MCP no longer "planned but not yet built" (if they now exist)
- [ ] KINSHIP.md Section 5: Relational change log has entry for this session's work
- [ ] All paths in KINSHIP.md point to real files/directories

### Ceremony KINSHIP.md
- [ ] Ceremony KINSHIP.md at openclaw workspace updated with session links
- [ ] OR: if external path is inaccessible, a note documents this limitation

### ⚠️ WEST Concerns to Flag
- **south-west/ is extra**: Facet 03 specifies east/south/west/north. The existing `.mw/south-west/` directory was created before this session. Verify it wasn't accidentally deleted or its content overwritten.
- **Bidirectionality**: If KINSHIP.md claims mia-code as sibling, verify that a reciprocal proposal exists (Facet 04 should handle this).

---

## Facet 04: Cross-Repo Integration Proposals

### Proposal Files
- [ ] `proposals/mia-code-mmot-integration.spec.md` exists (miaco mmot evaluate command)
- [ ] `proposals/medicine-wheel-veritas-bridge.spec.md` exists (DigitalModel ↔ StructuralTensionChart)
- [ ] `proposals/coaia-narrative-alignment.spec.md` exists (MMOT ownership, schema convergence)

### Content Integrity — mia-code Proposal
- [ ] Describes `miaco mmot evaluate` command concept
- [ ] References local LLM engine pattern (from miaco decompose.ts)
- [ ] Describes how miaco would invoke veritas MCP tools
- [ ] Does NOT duplicate miaco's existing chart/stc/decompose functionality

### Content Integrity — medicine-wheel Proposal
- [ ] Maps DigitalModel/DigitalElement to ontology-core's StructuralTensionChart/ActionStep
- [ ] Type alignment is explicit (which fields correspond)
- [ ] Respects medicine-wheel's existing ontology — proposes bridge, doesn't restructure

### Content Integrity — coaia-narrative Proposal
- [ ] Clearly distinguishes: coaia-narrative MMOT evaluates STC charts; veritas MMOT evaluates DigitalModels
- [ ] Schema convergence documented (Entity/Relation JSONL ↔ DigitalModel)
- [ ] References workspace-openclaw#28 for schema convergence tracking
- [ ] End-to-end flow articulated: coaia creates chart → veritas evaluates → mia-code acts

### Non-Duplication
- [ ] Proposals don't restate content already in existing rispecs
- [ ] Proposals don't conflict with coaia-narrative's `mmot_evaluation_loop.spec.md`
- [ ] Each proposal has unique, non-overlapping scope

---

## Facet 05: MMOT Self-Evaluation

### Performance Review Model
- [ ] Performance Review Model JSON exists (type 2, DigitalThinkingModelType: 2)
- [ ] DESIGN elements defined (MCP architecture, CLI usability, Rispec completeness, Kinship accuracy, .mw/ fidelity)
- [ ] EXECUTION elements defined (Code correctness, Schema alignment, Cross-repo consistency, Documentation clarity)
- [ ] Each element has ThreeFlag (-1/0/1) evaluation and Status

### MMOT Four-Step Evaluation
- [ ] **Step 1 — Acknowledge**: Honest accounting of what was delivered vs intended
- [ ] **Step 2 — Analyze**: Blow-by-blow of how each element reached its current state
- [ ] **Step 3 — Plan**: Corrective actions that create NEW structural tension (desired future state)
- [ ] **Step 4 — Document**: Written record in `.mw/north/session-mmot-evaluation.md`

### Bootstrap Paradox (⚠️ CRITICAL)
- [ ] Report explicitly names the bootstrap paradox: veritas evaluating veritas
- [ ] First-pass evaluation labeled as DEMONSTRATION, not trusted verdict
- [ ] Honest current reality prioritized over performative confidence
- [ ] No claim that this self-evaluation is equivalent to external validation

### Corrective Plan Quality
- [ ] Plan creates NEW structural tension (what we want to create next)
- [ ] Plan is NOT a reactive fix list (no "fix X", "resolve Y" language)
- [ ] Each corrective item is specific and actionable
- [ ] Corrections orient toward desired outcome, not away from current problems

### Second Iteration
- [ ] Second iteration was actually executed (not just planned)
- [ ] Corrections from iteration 1 applied to files from Facets 01-04
- [ ] `.mw/north/iteration-2-mmot-comparison.md` exists
- [ ] Comparison report shows element-by-element state between iteration 1 and 2
- [ ] Honest assessment of whether iteration 2 advanced or merely changed

---

## Cross-Cutting Validation

### File Ownership — No Executor Collision
Verify that no two NORTH executor agents modified the same file. Expected ownership:

| Executor | Owned Files |
|----------|-------------|
| Facet 01 (MCP/CLI) | `mcp/**`, `cli/**` |
| Facet 02 (Rispecs) | `rispecs/mcp-server.spec.md`, `rispecs/cli-tool.spec.md`, `rispecs/mmot-generation.spec.md`, `rispecs/api-client.spec.md`, `rispecs/README.md` |
| Facet 03 (Kinship) | `.mw/east/`, `.mw/south/`, `.mw/west/`, `.mw/north/` READMEs, `KINSHIP.md` |
| Facet 04 (Integration) | `proposals/**` |
| Facet 05 (MMOT Self-Eval) | `.mw/north/session-mmot-evaluation.md`, `.mw/north/iteration-2-mmot-comparison.md`, Performance Review Model JSON |

- [ ] No file appears in two executors' git diffs
- [ ] Facet 05 writes to `.mw/north/` — verify Facet 03 creates the README there BEFORE Facet 05 writes evaluation artifacts (ordering dependency)
- [ ] `KINSHIP.md` owned by Facet 03 only — Facet 05 does not modify it
- [ ] `rispecs/README.md` owned by Facet 02 only

### ⚠️ Potential Collision Zone
- `.mw/north/`: Facet 03 creates `README.md`, Facet 05 writes `session-mmot-evaluation.md` and `iteration-2-mmot-comparison.md`. These are different files but same directory — verify no overwrites.

### Creative Orientation — Global Language Audit
Run across ALL new files:
```bash
grep -ri "gap\|fix\|issue\|bridge\|solve\|problem\|broken\|missing\|lack" \
  mcp/ cli/ proposals/ rispecs/mcp-server.spec.md rispecs/cli-tool.spec.md \
  rispecs/mmot-generation.spec.md rispecs/api-client.spec.md \
  .mw/east/README.md .mw/south/README.md .mw/west/README.md .mw/north/README.md \
  2>/dev/null | grep -v node_modules | grep -v '.git/'
```
- [ ] Zero hits of problem-solving language in creative-orientation documents
- [ ] Technical files (code) are exempt from this check — only prose/specs/docs
- [ ] Any unavoidable technical uses (e.g., "missing API key" in error handling) are contextually appropriate

### Git Discipline
- [ ] All commits reference `jgwill/veritas#10` in commit message
- [ ] Commits are atomic per facet (not one mega-commit)
- [ ] No secrets committed (VERITAS_API_KEY, VERITAS_GEMINI_API_KEY)
- [ ] `.env` is in `.gitignore`

### Kinship Web Consistency
- [ ] Every sibling named in KINSHIP.md has a reciprocal reference (or proposal for one)
- [ ] Every path referenced in KINSHIP.md resolves to a real file/directory
- [ ] `.mw/west/` referenced as artifact home in KINSHIP.md — verify `.mw/west/README.md` exists and describes this role
- [ ] medicine-wheel, coaia-narrative, mia-code relations are all accounted for

### Type System Integrity
- [ ] `mcp/src/types.ts` aligns with root `types.ts` (DigitalModel, DigitalElement interfaces match)
- [ ] No field name divergence between MCP types and root types
- [ ] DigitalThinkingModelType: 1 = Decision, 2 = Performance Review — consistent everywhere
- [ ] ThreeFlag values (-1, 0, 1) used correctly in MMOT evaluation model

---

## Validation Execution Protocol

When lead agent runs this checklist:

1. **Check structural existence first** (do the files exist?)
2. **Check content integrity second** (do they contain what's specified?)
3. **Run language audit third** (creative orientation compliance)
4. **Check cross-cutting last** (file ownership, git, kinship consistency)

For each failed check:
- Note the specific file and line
- Classify as: **CREATION NEEDED** (thing doesn't exist yet) vs **REFINEMENT NEEDED** (exists but incomplete) vs **CONCERN** (design question requiring human input)
- Do not fix — flag for NORTH correction pass or human decision

---

## ⚠️ WEST Reflections — Concerns Worth Naming

1. **Facet 05 depends on all others**: MMOT self-evaluation cannot run until Facets 01-04 complete. If any executor stalls, Facet 05 has nothing to evaluate. The lead agent should sequence Facet 05 LAST.

2. **Local mode may be aspirational**: Facet 01 describes both network AND local modes. Local mode (spawning LLM binaries) is a significant implementation. It may be appropriate to implement network mode fully and document local mode as the next structural tension. Verify this decision was made explicitly.

3. **Ceremony KINSHIP.md access**: The ceremony path (`/home/mia/.openclaw/workspace/ceremonies/...`) may not be accessible from this workspace. If Facet 03 couldn't update it, this is an environmental constraint, not an executor failure.

4. **Cross-repo proposals are LOCAL copies**: Proposals in `proposals/` are veritas-side documents. The actual target repos (mia-code, medicine-wheel) would need their own PRs. Verify proposals are self-contained enough to be submitted as PRs later.

5. **rispecs/README.md last-updated date**: Currently says "December 8, 2024". After Facet 02 updates it, verify the date advances to 2026-03-21.

6. **Pre-existing .mw/south-west/**: This directory exists from prior work. No facet claims ownership of it. Verify it was preserved untouched.

---

*Prepared by WEST direction agent. This checklist validates what wanted to be created — it does not prescribe corrections. Corrections emerge from the structural tension between intended outcome and current reality, which is NORTH work.*
