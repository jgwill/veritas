# medicine-wheel ↔ veritas Type Bridge Proposal

**Version:** 0.1.0  
**Date:** 2026-03-21  
**Direction:** SOUTH — Cross-repo schema analysis  
**Author:** SOUTH deep-search agent  

---

## Creative Intent

> Bridge veritas' DigitalModel/DigitalElement types with medicine-wheel's StructuralTensionChart/ActionStep types, enabling veritas to function as the truth-evaluation layer for the entire Medicine Wheel ecosystem — honoring both the formal type system and the ceremonial phases that give it meaning.

## Structural Tension

**Current Reality:**
- medicine-wheel's KINSHIP.md already names veritas as a sibling: "truth evaluator; operates on structures defined here"
- ontology-core defines `StructuralTensionChart` (id, desired_outcome, current_reality, action_steps[], phase, direction) and `ActionStep` with Zod validation
- veritas defines `DigitalModel` (ModelName, DigitalTopic, Model: DigitalElement[], DigitalThinkingModelType) and `DigitalElement` (DisplayName, TwoFlag, ThreeFlag, DominanceFactor)
- medicine-wheel has NO DigitalModel/DigitalElement awareness; veritas has NO StructuralTensionChart/ActionStep awareness
- The relationship is acknowledged in KINSHIP but no adapter, bridge, or shared type exists
- ontology-core's `TensionPhase` (germination/assimilation/completion) and ceremony phases (opening/council/integration/closure) have no mapping to veritas' AppMode (Modeling/Analyzing/Structuring) or DigitalThinkingModelType (1=Decision, 2=Performance Review)

**Desired Outcome:**
- A concrete type mapping that allows bidirectional translation between the two type systems
- Clear alignment between ceremony phases and veritas evaluation modes
- veritas can evaluate any StructuralTensionChart; medicine-wheel can express any DigitalModel evaluation as a ceremony cycle

---

## Type Mapping: StructuralTensionChart ↔ DigitalModel

### Core Alignment

| medicine-wheel (ontology-core) | ↔ | veritas | Notes |
|-------------------------------|---|---------|-------|
| `StructuralTensionChart` | ↔ | `DigitalModel` (type 2) | Container types |
| `StructuralTensionChart.id` | → | `DigitalModel.Idug` | Unique identifier |
| `StructuralTensionChart.desired_outcome` | → | `DigitalModel.DigitalTopic` | What we're evaluating toward |
| `StructuralTensionChart.current_reality` | → | `DigitalModel.Note` | Current state description |
| `StructuralTensionChart.action_steps[]` | ↔ | `DigitalModel.Model[]` (DigitalElement array) | Evaluatable units |
| `ActionStep` | ↔ | `DigitalElement` | Individual evaluatable item |
| `ActionStep.id` | → | `DigitalElement.Idug` | Step/element identifier |
| `ActionStep.title` | → | `DigitalElement.DisplayName` | Human-readable name |
| `ActionStep.reality` | → | `DigitalElement.Description` | Current reality of this step |
| `ActionStep.completed` | → | `DigitalElement.TwoFlag` | Acceptable (completed) or not |
| `TensionPhase` | ~ | `AppMode` | Phase/mode alignment (see below) |

### ActionStep → DigitalElement Adapter

```typescript
function actionStepToDigitalElement(
  step: ActionStep,
  index: number,
  chartContext: StructuralTensionChart
): DigitalElement {
  return {
    SortNo: index + 1,
    Idug: step.id,
    DisplayName: step.title,
    Description: step.reality || '',
    
    // State: completed maps to acceptable
    TwoFlag: step.completed,
    TwoFlagAnswered: true,        // ActionStep always has completion state
    
    // Trend: derived from phase progression
    ThreeFlag: deriveThreeFlag(step, chartContext),
    ThreeFlagAnswered: chartContext.phase !== 'germination',
    
    // Weight: equal by default (STC doesn't have dominance)
    DominanceFactor: 1.0 / chartContext.action_steps.length,
    
    // Not applicable for STC-derived elements
    ComparationTableData: [],
    Status: step.completed ? 3 : 1,
    evaluation: step.completed ? 'accepted' : 'neutral',
  };
}

function deriveThreeFlag(
  step: ActionStep,
  chart: StructuralTensionChart
): -1 | 0 | 1 {
  // Phase-based trend derivation:
  // - germination: stable (0) — tension just established
  // - assimilation: depends on completion status
  //   - completed → improving (+1)
  //   - not completed → declining (-1) if past due, stable (0) otherwise  
  // - completion: completed → improving (+1), not completed → declining (-1)
  
  switch (chart.phase) {
    case 'germination': return 0;
    case 'assimilation': return step.completed ? 1 : 0;
    case 'completion': return step.completed ? 1 : -1;
    default: return 0;
  }
}
```

### DigitalModel → StructuralTensionChart Adapter

```typescript
function digitalModelToStc(model: DigitalModel): StructuralTensionChart {
  return {
    id: model.Idug || model.FileId || generateId(),
    desired_outcome: model.DigitalTopic,
    current_reality: model.Note || deriveRealityFromElements(model),
    action_steps: model.Model.map(elementToActionStep),
    phase: derivePhaseFromModel(model),
    direction: undefined,  // veritas doesn't track direction
    created_at: model.history?.[0]?.timestamp || new Date().toISOString(),
    updated_at: model.history?.slice(-1)[0]?.timestamp || new Date().toISOString(),
  };
}

function elementToActionStep(element: DigitalElement): ActionStep {
  return {
    id: element.Idug,
    title: element.DisplayName,
    reality: element.Description,
    completed: element.TwoFlag === true && element.TwoFlagAnswered === true,
    completedAt: element.TwoFlag ? Date.now() : undefined,
  };
}

function derivePhaseFromModel(model: DigitalModel): TensionPhase {
  const elements = model.Model;
  const answeredCount = elements.filter(e => e.TwoFlagAnswered).length;
  const acceptableCount = elements.filter(e => e.TwoFlag).length;
  
  if (answeredCount === 0) return 'germination';
  if (acceptableCount === elements.length) return 'completion';
  return 'assimilation';
}
```

---

## Can a DigitalElement Be Viewed as an ActionStep?

**Yes, with caveats.**

### Structural Equivalence

Both represent **evaluatable units within a larger goal**:

| Property | DigitalElement | ActionStep | Compatible? |
|----------|---------------|------------|-------------|
| Identity | `Idug` | `id` | ✅ Direct |
| Name | `DisplayName` | `title` | ✅ Direct |
| Description | `Description` | `reality` | ✅ Semantic equivalent |
| Completion | `TwoFlag` (acceptable) | `completed` (boolean) | ✅ Functionally equivalent |
| Timestamp | Via `history[]` | `completedAt` | ⚠️ Indirect |
| Trend | `ThreeFlag` (-1/0/+1) | Not present | ❌ No ActionStep equivalent |
| Weight | `DominanceFactor` | Not present | ❌ No ActionStep equivalent |
| Comparison | `ComparationTableData` | Not present | ❌ Type 1 only |

### Key Differences

1. **DigitalElement is richer** — It carries trend (ThreeFlag), weight (DominanceFactor), and pairwise comparison data that ActionStep lacks
2. **ActionStep is simpler** — It's a boolean completion tracker; DigitalElement is a multi-dimensional assessment
3. **DigitalElement serves two model types** — Type 1 (Decision) uses DominanceFactor/ComparationTableData; Type 2 (Performance Review) uses TwoFlag/ThreeFlag. Only Type 2 maps cleanly to ActionStep.
4. **ActionStep lives in ceremony context** — ActionStep exists within a StructuralTensionChart that has `direction` and `phase`, connecting it to ceremonial progression. DigitalElement has no ceremony awareness.

### Recommendation

**A DigitalElement (Type 2) IS an ActionStep** with additional evaluation metadata. The bridge should:
- Treat the conversion as **lossless in the ActionStep→DigitalElement direction** (all ActionStep data maps)
- Treat it as **lossy in the DigitalElement→ActionStep direction** (ThreeFlag, DominanceFactor are lost)
- Preserve the lost data in ActionStep metadata extensions when converting back

```typescript
// Extended ActionStep that preserves veritas evaluation data
interface VeritasEnrichedActionStep extends ActionStep {
  veritasMetadata?: {
    threeFlag: -1 | 0 | 1;
    dominanceFactor: number;
    tier: 'A' | 'B' | 'C' | 'D' | 'E';
    evaluation: 'accepted' | 'rejected' | 'neutral';
  };
}
```

---

## DigitalThinkingModelType ↔ Ceremony Phase Alignment

### The Medicine Wheel Ceremony Cycle

ontology-core defines four ceremony phases following the Four Directions:

| Phase | Direction | Season | Focus | DIRECTION_ACTS |
|-------|-----------|--------|-------|---------------|
| **Opening** | East 🌅 | Spring | Vision, intention setting | Act 1 |
| **Council** | South 🔥 | Summer | Analysis, growth, learning | Act 2 |
| **Integration** | West 🌊 | Autumn | Reflection, validation | Act 3 |
| **Closure** | North ❄️ | Winter | Wisdom, action, completion | Act 4 |

### veritas' Three Modes

| Mode | Function |
|------|----------|
| **Modeling** | Build/edit model structure (add elements, set descriptions) |
| **Analyzing** | Evaluate elements (mark TwoFlag, ThreeFlag) |
| **Structuring** | Review results (tier dashboard, action suggestions) |

### The Alignment

```
Ceremony Cycle          veritas Mode         What Happens
─────────────────────────────────────────────────────────────
Opening (East)    →     Modeling             Vision: Define what we're evaluating
                                             Set desired outcome / create elements

Council (South)   →     Analyzing            Analysis: Honestly assess each element
                                             Mark TwoFlag (acceptable?), ThreeFlag (trend?)

Integration (West) →    Structuring          Reflection: See the tier distribution
                                             Generate action suggestions, review dashboard

Closure (North)   →     (not yet in veritas) Wisdom: Commit to actions, close the cycle
                                             MMOT 4-phase recommit or redirect
```

### DigitalThinkingModelType as Ceremony Type

| ModelType | Ceremony Analogy | Orientation |
|-----------|-----------------|-------------|
| **Type 1 (Decision Making)** | **Talking Circle** — collective weighing of alternatives through pairwise comparison, seeking consensus on which path to walk | West-facing (introspective, choosing) |
| **Type 2 (Performance Review)** | **MMOT Ceremony** — honest acknowledgment of current reality, analysis of structural dynamics, updating the chart, recommitting to the path | South-facing (analytical, truth-seeking) |

### TensionPhase ↔ Evaluation Progress

| TensionPhase | veritas Equivalent | Trigger |
|-------------|-------------------|---------|
| **germination** | No elements answered (fresh model) | Model just created, no TwoFlag/ThreeFlag set |
| **assimilation** | Partially analyzed (some elements answered) | Some TwoFlagAnswered=true, evaluation in progress |
| **completion** | All elements answered, tiers assigned | All TwoFlagAnswered=true, Structuring mode shows results |

---

## Proposed Bridge Architecture

### Package: `veritas-medicine-wheel-bridge`

Lives in veritas repo as `services/medicineWheelBridge.ts` (since veritas is the truth evaluator that "operates on structures defined in medicine-wheel"):

```typescript
// services/medicineWheelBridge.ts

import type { StructuralTensionChart, ActionStep, TensionPhase, DirectionName } from 'medicine-wheel-ontology-core';
import type { DigitalModel, DigitalElement } from '../types';

export interface BridgeConfig {
  preserveVeritasMetadata: boolean;  // Keep ThreeFlag/DominanceFactor in ActionStep metadata
  deriveTrend: boolean;              // Auto-compute ThreeFlag from phase progression
  ceremonialContext?: {
    direction: DirectionName;
    phase: 'opening' | 'council' | 'integration' | 'closure';
  };
}

// STC → DigitalModel (for veritas evaluation)
export function stcToDigitalModel(chart: StructuralTensionChart, config?: BridgeConfig): DigitalModel;

// DigitalModel → STC (for medicine-wheel consumption)  
export function digitalModelToStc(model: DigitalModel, config?: BridgeConfig): StructuralTensionChart;

// Individual element conversions
export function actionStepToElement(step: ActionStep, index: number, chart: StructuralTensionChart): DigitalElement;
export function elementToActionStep(element: DigitalElement): ActionStep;

// Phase/mode alignment
export function tensionPhaseFromModel(model: DigitalModel): TensionPhase;
export function appModeFromCeremonyPhase(phase: string): 'Modeling' | 'Analyzing' | 'Structuring';
export function ceremonyPhaseFromAppMode(mode: string): 'opening' | 'council' | 'integration' | 'closure';

// Veritas tier → ceremony action mapping
export function tierToCeremonyAction(tier: 'A' | 'B' | 'C' | 'D' | 'E'): {
  urgency: string;
  ceremonyRequired: boolean;
  suggestedDirection: DirectionName;
};
```

### Tier → Ceremony Action Mapping

When veritas assigns tiers to elements, these carry ceremony implications:

| Tier | Urgency | Ceremony Required? | Direction | Ceremony Action |
|------|---------|-------------------|-----------|----------------|
| **A** (Critical: unacceptable + declining) | Immediate | ✅ Yes — MMOT ceremony needed | South 🔥 | Return to honest acknowledgment |
| **B** (Urgent: unacceptable) | High | ✅ Yes — Analysis ceremony | South 🔥 | Deep analysis of structural causes |
| **C** (Proactive: acceptable + declining) | Medium | ⚠️ Recommended | West 🌊 | Reflective integration before decline worsens |
| **D** (Monitor: acceptable + stable) | Low | No | North ❄️ | Maintain wisdom watch |
| **E** (Maintain: acceptable + improving) | None | No | East 🌅 | Celebrate, set new vision |

---

## Implementation Phases

### Phase 1: Type Adapter (veritas-side)
- New file: `services/medicineWheelBridge.ts`
- Implement `stcToDigitalModel` and `digitalModelToStc`
- Import ontology-core types (or define compatible interfaces)
- Unit tests with sample STC charts from coaia-narrative samples

### Phase 2: Ceremony-Aware Evaluation
- Extend veritas' analysis flow to accept `ceremonialContext`
- When ceremony context is present, evaluation results include directional perspective
- The Structuring view can display ceremony phase guidance alongside tier dashboard

### Phase 3: Zod Schema Bridge
- Use ontology-core's `StructuralTensionChartSchema` and `ActionStepSchema` for validation
- Create corresponding Zod schemas for DigitalModel/DigitalElement in veritas
- Validate at bridge boundaries (both directions)

### Phase 4: Narrative Beat Emission
- When veritas evaluates an STC-derived model, emit a narrative beat
- Beat includes direction, act, evaluation summary
- Compatible with medicine-wheel's NarrativeBeat type and narrative-engine's beat sequencer

---

## What WANTS to Be Created

At each integration point, there's a creative pull:

1. **StructuralTensionChart → DigitalModel**: The chart wants to be *evaluated honestly*. It holds tension between outcome and reality but cannot assess whether that tension is being held truthfully. Veritas provides the mirror.

2. **ActionStep → DigitalElement**: Each action step wants to know *whether it's actually advancing toward the outcome* or merely creating the appearance of progress. The TwoFlag/ThreeFlag system gives it vocabulary for that assessment.

3. **Ceremony phases → veritas modes**: The ceremony cycle wants a *truth-telling moment* — which is exactly what veritas' Analyzing mode provides. The Integration (West) phase especially yearns for the kind of honest assessment that veritas' tier system delivers.

4. **Tier distribution → ceremony guidance**: When veritas reveals that elements are in Tier A (critical), the ceremony system wants to respond with the appropriate protocol — not just a notification, but a return to ceremony, a re-grounding in relational accountability.

5. **The bridge itself**: medicine-wheel's KINSHIP.md already holds the structural tension: "truth evaluator; operates on structures defined here" — but the adapter is "not yet built." This proposal is the response to that tension. What wants to be created is the actual living connection between these two ways of knowing.

---

## Quality Criteria

- ✅ Bidirectional conversion preserves essential semantics
- ✅ Lossy conversions are explicitly documented with metadata preservation options
- ✅ Ceremony phases map meaningfully to evaluation modes (not forced)
- ✅ ontology-core remains the semantic authority (veritas adapts to its types, not vice versa)
- ✅ Zod validation at all bridge boundaries
- ✅ Narrative beats emitted for cross-repo observability
- ✅ OCAP® compliance preserved in bridge operations
- ✅ Type 1 (Decision) models acknowledged as not directly mappable to STC (documented boundary)

---

## Dependencies

- `medicine-wheel-ontology-core` ^0.1.1 (StructuralTensionChart, ActionStep, DirectionName, TensionPhase types + Zod schemas)
- `veritas` types.ts (DigitalModel, DigitalElement)
- `coaia-narrative` schema/ (Entity/Relation JSONL format — for end-to-end testing)

## Open Questions

1. Should DominanceFactor be preserved in ActionStep metadata, or should STC adopt a weighting concept?
2. Type 1 (Decision Making) models don't map to STC — should there be a separate bridge for decision models?
3. Should the bridge enforce ceremony requirements (e.g., Tier A requires ceremony before proceeding)?
4. How does the `direction` field on StructuralTensionChart interact with veritas evaluation — should each direction produce a separate evaluation?
