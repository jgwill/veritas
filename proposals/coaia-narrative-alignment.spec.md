# coaia-narrative ↔ veritas MMOT Alignment Proposal

**Version:** 0.1.0  
**Date:** 2026-03-21  
**Direction:** SOUTH — Cross-repo schema analysis  
**Author:** SOUTH deep-search agent  

---

## Creative Intent

> Enable veritas to evaluate coaia-narrative's Structural Tension Charts using its DigitalModel/DigitalElement type system, and conversely allow coaia-narrative's `perform_mmot_evaluation` to consume veritas' Performance Review (type 2) analysis results — creating a bidirectional truth-evaluation bridge.

## Structural Tension

**Current Reality:**
- coaia-narrative has a fully implemented `perform_mmot_evaluation` tool operating on Entity/Relation JSONL (STC charts)
- veritas has a DigitalModel type 2 (Performance Review) with TwoFlag/ThreeFlag evaluation and 5-tier priority system
- These two systems evaluate overlapping domains (performance against expectations) but share NO types, NO data formats, and NO integration points
- coaia-narrative has zero awareness of DigitalModel/DigitalElement; veritas has zero awareness of Entity/Relation JSONL
- KINSHIP.md documents the sibling relationship but no bridge exists

**Desired Outcome:**
- A shared evaluation protocol where veritas can ingest STC charts and coaia-narrative can consume veritas evaluation results
- Type adapters that translate between the two schema systems without either repo absorbing the other's types

---

## How `perform_mmot_evaluation` Works Today

### Inputs
The tool accepts:
```typescript
{
  chartId: string;          // STC chart identifier
  phase: 'acknowledge' | 'analyze' | 'update' | 'recommit';
  assessment: string;       // Free-text evaluation of current phase
  direction?: 'South' | 'East' | 'West' | 'North';  // Perspective lens
  correctiveActions?: string[];   // Actions to address gaps
  updateReality?: boolean;        // Whether to write new observations to current_reality
}
```

### What It Evaluates
1. **Entity/Relation JSONL** — STC chart entities (desired_outcome, current_reality, action_step) and their relations (creates_tension_with, advances_toward, depends_on)
2. **Elements of Performance** — Metadata on entities with `type: 'DESIGN' | 'EXECUTION'` describing structural intent vs. implementation quality
3. **Four-phase cycle**: Acknowledge truth → Analyze cause → Update chart → Recommit/redirect

### Evaluation Flow
1. Loads the STC chart's Entity/Relation JSONL from knowledge graph
2. Compares `desired_outcome` observations against `current_reality` observations
3. Checks `action_step` completion status and `advances_toward` relations
4. Applies directional perspective (South=structure, East=narrative, West=embodied, North=wisdom)
5. Emits an `mmot_evaluation` narrative beat documenting the assessment
6. Optionally updates `current_reality` entity observations with new truth

### Output
- A narrative beat (entity) with `entityType: "narrative_beat"` containing the evaluation
- Updated chart entities if `updateReality: true`
- Observable event in coaia-visualizer showing "Turning Point"

---

## How veritas Type 2 (Performance Review) Differs

### veritas Evaluation Model
| Aspect | veritas Type 2 | coaia-narrative MMOT |
|--------|---------------|---------------------|
| **Unit of evaluation** | `DigitalElement` (named criterion) | Entity/Relation JSONL (STC chart components) |
| **State assessment** | `TwoFlag` (acceptable/unacceptable) | Observation comparison (desired vs. current) |
| **Trend assessment** | `ThreeFlag` (-1 declining, 0 stable, +1 improving) | Phase progression (germination → assimilation → completion) |
| **Prioritization** | 5-tier system (A=critical → E=maintain) | 4-phase MMOT cycle (acknowledge → recommit) |
| **Perspective** | Single evaluator (user or AI) | Four Directions (South/East/West/North perspectives) |
| **Output** | Tier assignments + action suggestions | Narrative beats + chart updates |
| **Persistence** | localStorage + API (DigitalModel JSON) | JSONL append-only file |

### Key Semantic Overlap
Both systems answer the same fundamental question: **"Is current reality honestly acknowledged, and do planned actions actually advance toward the desired outcome?"**

- veritas' `TwoFlag = false` (unacceptable) ≈ coaia's "current reality diverges from desired outcome"
- veritas' `ThreeFlag = -1` (declining) ≈ coaia's "action steps not advancing toward outcome"
- veritas' Tier A (unacceptable + declining) ≈ coaia's "Phase 1: Acknowledge the truth" trigger condition

---

## Proposed Type Adapters

### 1. STC Chart → DigitalModel Adapter

Convert an STC chart's entity/relation JSONL into a veritas DigitalModel for evaluation:

```typescript
interface StcToVeritasAdapter {
  // Convert STC chart to evaluatable DigitalModel
  fromStcChart(chartJsonl: string[]): DigitalModel;
  
  // Map action_step entities → DigitalElement array
  actionStepsToElements(entities: Entity[]): DigitalElement[];
  
  // Derive TwoFlag from action_step completion + tension analysis
  deriveTwoFlag(step: Entity, relations: Relation[]): boolean;
  
  // Derive ThreeFlag from temporal observations
  deriveThreeFlag(step: Entity, history: Entity[]): -1 | 0 | 1;
}
```

**Mapping Rules:**
| STC Entity | → | DigitalModel Field |
|------------|---|-------------------|
| `structural_tension_chart.name` | → | `ModelName` |
| `desired_outcome.observations[0]` | → | `DigitalTopic` |
| `current_reality.observations` | → | `Note` |
| Each `action_step` entity | → | `DigitalElement` in `Model[]` |
| `action_step.observations[0]` | → | `DigitalElement.DisplayName` |
| `advances_toward` relation exists | → | `TwoFlag = true` (advancing = acceptable) |
| `action_step.metadata.completionStatus` | → | `ThreeFlag` derivation |
| `DigitalThinkingModelType` | → | Always `2` (Performance Review) |

### 2. DigitalModel → MMOT Evaluation Input Adapter

Convert veritas evaluation results back into coaia-narrative's MMOT format:

```typescript
interface VeritasToMmotAdapter {
  // Convert tier analysis to MMOT phase assessment
  tierToMmotPhase(model: DigitalModel): MmotEvaluationInput;
  
  // Map Tier A/B elements to corrective actions
  criticalElementsToCorrectiveActions(model: DigitalModel): string[];
  
  // Generate assessment text from tier distribution
  generateAssessment(model: DigitalModel): string;
}
```

**Phase Derivation Logic:**
- If ANY Tier A elements exist → `phase: 'acknowledge'` (truth not yet fully acknowledged)
- If Tier B but no Tier A → `phase: 'analyze'` (acknowledged but needs causal analysis)
- If only Tier C/D/E → `phase: 'update'` (reality aligned, update chart)
- If all Tier E → `phase: 'recommit'` (fully advancing, recommit to next cycle)

---

## Implementation Plan

### Phase 1: Shared Schema Contract (medicine-wheel owns)
- Define `EvaluationResult` interface in ontology-core that both repos can import
- Add `evaluationAdapter` module to ontology-core with bidirectional converters
- Version: ontology-core ^0.2.0

### Phase 2: veritas Adapter Module
- New file: `services/stcAdapter.ts` in veritas
- Imports: Entity/Relation types from ontology-core
- Exports: `fromStcChart()`, `toMmotInput()`
- Tests: Convert sample STC charts to DigitalModel, verify tier assignment

### Phase 3: coaia-narrative Consumer
- Extend `perform_mmot_evaluation` to accept optional `veritasEvaluation` parameter
- When present, skip manual assessment — use veritas tier analysis as Phase 1 input
- Emit narrative beat referencing veritas evaluation source

### Phase 4: CLI Bridge
- `veritas evaluate --stc <chart-id>` — Load STC chart, convert, evaluate, return MMOT-compatible result
- `coaia-narrative perform_mmot_evaluation --veritas-model <model-id>` — Load veritas model, convert, run MMOT cycle

---

## Quality Criteria

- ✅ Neither repo absorbs the other's type system (adapters live at boundaries)
- ✅ ontology-core remains single semantic authority for shared types
- ✅ JSONL format preserved (coaia-narrative) and JSON format preserved (veritas)
- ✅ Four Directions perspective available in both evaluation flows
- ✅ Bidirectional: STC → DigitalModel AND DigitalModel → MMOT input
- ✅ Observable: Every cross-repo evaluation emits a narrative beat

---

## Dependencies

- `medicine-wheel-ontology-core` ^0.2.0 (shared evaluation types)
- `coaia-narrative` ^current (perform_mmot_evaluation tool)
- `veritas` ^current (DigitalModel type 2 evaluation)

## Open Questions

1. Should the adapter live in veritas, coaia-narrative, or as a standalone package?
2. Does ontology-core need an `EvaluationResult` type, or should adapters remain boundary-only?
3. How should historical evaluations be synchronized across the two persistence formats?
