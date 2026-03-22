# SOUTH Cross-Repo Analysis — Deep Search Results

**Date:** 2026-03-21  
**Direction:** SOUTH — Research & Growth  
**Agent:** SOUTH deep-search  
**Workdir:** /workspace/repos/jgwill/veritas  

---

## Executive Summary

Three cross-repo integration targets analyzed. All three revealed **structural tension already named in KINSHIP files** but with **no adapters yet built**. The creative pull at each integration point is clear — these repos want to connect.

---

## Task A: coaia-narrative MMOT Alignment

**Status:** ✅ Proposal written → `proposals/coaia-narrative-alignment.md`

### Key Findings

1. **`perform_mmot_evaluation` is fully implemented** in coaia-narrative as an MCP tool
   - Inputs: `chartId`, `phase` (acknowledge|analyze|update|recommit), `assessment`, optional `direction`, `correctiveActions`
   - Evaluates: Entity/Relation JSONL (STC chart entities — desired_outcome, current_reality, action_step)
   - Uses Elements of Performance (DESIGN/EXECUTION) as evaluation criteria
   - Emits narrative beats documenting each evaluation phase

2. **veritas Type 2 differs in granularity, not intent**
   - veritas evaluates DigitalElements individually (TwoFlag=acceptable?, ThreeFlag=trend?)
   - coaia evaluates chart-level tension (desired_outcome vs. current_reality)
   - Both answer: "Is current reality honestly acknowledged?"

3. **Zero cross-awareness** — No DigitalModel/DigitalElement references in coaia-narrative, no Entity/Relation JSONL awareness in veritas

### Proposed Bridge
- `StcToVeritasAdapter`: Convert STC chart → DigitalModel (type 2) for veritas evaluation
- `VeritasToMmotAdapter`: Convert veritas tier analysis → MMOT phase input
- Shared `EvaluationResult` type in ontology-core

---

## Task B: mia-code MMOT Integration

**Status:** ✅ Proposal written → `proposals/mia-code-mmot-integration.spec.md`

### Key Findings

1. **decompose.ts establishes the multi-engine pattern** — Gemini/Claude/Copilot spawning with JSON output, stored in `.pde/` directory
2. **chart.ts has "Creator Moment of Truth"** (review command) — a proto-MMOT but without the 4-phase structure, Elements of Performance, or Four Directions perspectives
3. **No `miaco mmot` command exists** — the west leg of the Four Directions compass is missing
4. **Existing commands map cleanly:**
   - EAST: `miaco decompose` (vision/PDE)
   - SOUTH: `miaco stc` + `miaco chart` (analysis/charts)
   - WEST: **missing** → `miaco mmot evaluate` fills this gap
   - NORTH: future reflection/wisdom command

### Proposed Command
```
miaco mmot evaluate --chart <id> [--engine gemini|claude|copilot] [--direction all] [--all-phases]
```
- Follows decompose.ts engine spawning pattern exactly
- Stores in `.mmot/` (parallel to `.pde/`)
- MmotEvaluationResult includes 4 phases, Elements of Performance, Four Directions perspectives
- MCP-exposable via miaco-server.ts (3 new tools)

---

## Task C: medicine-wheel Type Bridge

**Status:** ✅ Proposal written → `proposals/medicine-wheel-veritas-bridge.spec.md`

### Key Findings

1. **StructuralTensionChart ↔ DigitalModel (type 2)** — Container-level mapping is clean
   - `desired_outcome` → `DigitalTopic`, `current_reality` → `Note`, `action_steps[]` → `Model[]`
   
2. **ActionStep ↔ DigitalElement** — Partially compatible
   - ActionStep→DigitalElement is **lossless** (all ActionStep fields map)
   - DigitalElement→ActionStep is **lossy** (ThreeFlag, DominanceFactor, ComparationTableData have no ActionStep equivalent)
   - Proposal: `VeritasEnrichedActionStep` extends ActionStep with metadata preservation

3. **Ceremony phases align with veritas modes:**
   - Opening (East) → Modeling (set up evaluation)
   - Council (South) → Analyzing (honest assessment)
   - Integration (West) → Structuring (review tier dashboard)
   - Closure (North) → Not yet in veritas (MMOT recommit fills this gap)

4. **TensionPhase maps to evaluation progress:**
   - germination → no elements answered
   - assimilation → partially analyzed
   - completion → all elements answered, tiers assigned

5. **Tier → ceremony action mapping** — Tier A (critical) requires return-to-ceremony; Tier E (thriving) suggests new vision setting

---

## Cross-Cutting Patterns Discovered

### 1. The MMOT Four Phases Appear Everywhere
| Phase | coaia-narrative | mia-code chart.ts | veritas (proposed) |
|-------|----------------|-------------------|-------------------|
| Acknowledge | ✅ Phase 1 | "review" shows outcome vs. reality | Tier assignment reveals gaps |
| Analyze | ✅ Phase 2 | (missing) | (missing — needs CLI) |
| Update | ✅ Phase 3 | add-step, complete | (missing — needs chart integration) |
| Recommit | ✅ Phase 4 | (missing) | (missing — closure ceremony) |

### 2. ontology-core Is the Semantic Authority
All three proposals converge on medicine-wheel's ontology-core as the shared type system. The bridge types should live there (or at least reference its schemas), not be duplicated.

### 3. The Four Directions Compass Is Incomplete
miaco lacks west (MMOT evaluation). veritas lacks north (ceremony closure). The integration work completes both.

### 4. JSONL Is the Interchange Format
coaia-narrative's Entity/Relation JSONL is the serialization format. veritas' DigitalModel JSON and medicine-wheel's ontology-core TypeScript types are the in-memory representations. Adapters translate between them at boundaries.

---

## Files Produced

| File | Purpose |
|------|---------|
| `proposals/coaia-narrative-alignment.md` | Task A — STC ↔ DigitalModel adapter proposal |
| `proposals/mia-code-mmot-integration.spec.md` | Task B — `miaco mmot evaluate` command spec |
| `proposals/medicine-wheel-veritas-bridge.spec.md` | Task C — Type bridge with ceremony alignment |
| `.pde/deep-search/south-cross-repo-analysis.md` | This summary |

---

## Recommended Next Steps

1. **WEST agent:** Refine the three proposals into executable rispecs with acceptance criteria
2. **NORTH agent:** Implement `services/medicineWheelBridge.ts` in veritas (Phase 1 of Task C)
3. **Parallel:** Open issues in coaia-narrative and mia-code repos for their respective integration work
4. **Dependency:** ontology-core ^0.2.0 with shared `EvaluationResult` type should be first deliverable
