# MMOT Generation Workflow — RISE Specification

> Enables an LLM agent to autonomously create, evaluate, and advance Performance Review models through the Managerial Moment of Truth methodology.

**Version:** 0.1.0
**Document ID:** rispec-mmot-generation-v1
**Last Updated:** 2026-03-21

---

## Desired Outcome

Users create **autonomous MMOT evaluation cycles** where:

- An LLM agent generates a Performance Review model (type 2) from a natural language description
- The agent evaluates the model through the four-step MMOT cycle: Acknowledge → Analyze → Plan → Document
- Evaluation creates NEW structural tension that advances the model rather than merely reacting to deficiencies
- The agent iterates — refining elements, re-evaluating, and deepening assessment through successive cycles
- First evaluation of any new model is understood as demonstration, not trusted verdict (the bootstrap paradox)

---

## Creative Intent

**What this enables users to create:** A generative practice where performance review models emerge, mature, and advance through LLM-driven MMOT cycles. Instead of a human manually creating a model, populating elements, and interpreting results, an LLM agent performs the complete lifecycle — from "I want to review my team's Q2 performance" to a structured model with MMOT evaluation, identified tensions, and advancing actions.

**Structural Tension:** Between the desire for systematic performance evaluation and the friction of creating, populating, and interpreting models manually. The MMOT generation workflow resolves this by enabling an LLM to perform the entire cycle autonomously, with the human participating as reviewer and decision-maker rather than data-entry operator.

---

## The Autonomous Generation Cycle

### Full Workflow

```
Human: "Evaluate my frontend team's Q2 performance"
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ STEP 1: Generate Model                       │
│                                              │
│ LLM calls veritas_generate_model:            │
│   topic: "Frontend Team Q2 Performance"      │
│   model_type: 2                              │
│   elements: [                                │
│     "Sprint Delivery",                       │
│     "Code Quality",                          │
│     "React Migration Progress",              │
│     "Testing Practices",                     │
│     "Cross-team Collaboration"               │
│   ]                                          │
│                                              │
│ → Server uses Gemini to build DigitalModel   │
│ → Model persisted with auto-generated Idug   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ STEP 2: Review Model                         │
│                                              │
│ LLM calls veritas_get_model(id)              │
│                                              │
│ LLM examines:                                │
│  - Are elements well-scoped?                 │
│  - Do descriptions capture intent?           │
│  - Are state + trend values coherent?        │
│  - Is the model ready for evaluation?        │
│                                              │
│ If refinement needed → veritas_update_model  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ STEP 3: MMOT Evaluate                        │
│                                              │
│ LLM calls veritas_mmot_evaluate(model)       │
│                                              │
│ Four-step MMOT cycle executes:               │
│  1. Acknowledge: Name the current reality    │
│  2. Analyze: Identify patterns in state×trend│
│  3. Plan: Define advancing actions           │
│  4. Document: Record for future reference    │
│                                              │
│ → Returns structured MMOTEvaluation          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ STEP 4: Iterate (Optional)                   │
│                                              │
│ Based on MMOT results, LLM may:             │
│  - Add elements the evaluation revealed      │
│  - Refine element descriptions               │
│  - Adjust state/trend based on new insight   │
│  - Re-evaluate with updated model            │
│                                              │
│ Each iteration deepens understanding.        │
│ The model advances, it does not oscillate.   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ STEP 5: Present to Human                     │
│                                              │
│ LLM synthesizes:                             │
│  - Model structure with element states       │
│  - MMOT evaluation narrative                 │
│  - Identified structural tensions            │
│  - Recommended advancing actions             │
│  - Questions for human input                 │
│                                              │
│ Human reviews, provides feedback, or accepts │
└─────────────────────────────────────────────┘
```

---

## The MMOT Four-Step Evaluation Cycle

The Managerial Moment of Truth (MMOT) is a methodology for honest performance assessment. Each step has a specific function in the evaluation:

### Step 1: Acknowledge

**Purpose:** Name the current reality without judgment or aspiration.

The evaluation examines each element's state (`TwoFlag`: acceptable/unacceptable) and trend (`ThreeFlag`: improving/stable/declining) and produces a factual narrative of what IS, not what should be.

```
Element: Sprint Delivery
State: Unacceptable | Trend: Declining

Acknowledge: "Sprint delivery has been below the team's own
definition of acceptable for the review period, and the trend
is actively declining. Three of the last four sprints carried
over more than 30% of committed stories."
```

**Key principle:** Acknowledgment resists the temptation to explain or rationalize. It names reality.

### Step 2: Analyze

**Purpose:** Identify patterns, relationships, and structural dynamics across elements.

The evaluation looks at the STATE × TREND matrix across ALL elements to find:
- Correlated movements (elements moving together)
- Contradictions (quality improving while velocity declines)
- Cascading effects (one element's state affecting others)

```
Analyze: "Code Quality (acceptable, improving) and Sprint Delivery
(unacceptable, declining) exhibit an inverse pattern — the team
appears to be trading velocity for quality. This is structural,
not behavioral: the React migration demands higher review standards
while velocity targets remain at pre-migration levels."
```

**Priority Matrix (from performance_review_model.spec.md):**

| State \ Trend | Declining (-1) | Stable (0) | Improving (+1) |
|---------------|----------------|------------|-----------------|
| **Unacceptable** | 🔴 Critical | 🟠 Warning | 🟡 Monitor |
| **Acceptable** | 🟡 Monitor | 🟢 Success | 🟢 Success |

### Step 3: Plan

**Purpose:** Define actions that advance toward the desired outcome, creating NEW structural tension.

This is where MMOT differs from reactive management. The plan does not attempt to "restore" a previous state. It identifies what WANTS to be created and defines actions that move toward that creation.

```
Plan:
1. Recalibrate sprint capacity targets to account for migration overhead
   (advancing: aligns targets with current reality)
2. Institute migration-specific velocity tracking separate from BAU
   (advancing: creates clarity where confusion exists)
3. Schedule mid-sprint check-ins for migration stories specifically
   (advancing: enables course-correction before sprint end)
```

**Critical distinction:** Each action creates new structural tension between the current state and a newly articulated desired outcome. Actions are ADVANCING (moving toward something new) not RESTORING (returning to something previous).

### Step 4: Document

**Purpose:** Record the evaluation so it becomes material for the next cycle.

Documentation captures:
- The narrative from steps 1-3
- Specific tensions identified
- Actions committed to
- Questions that remain open
- Baseline for the next evaluation cycle

```
Document: "Q2-W8 MMOT evaluation. Primary tension: velocity-quality
tradeoff during React migration. Actions committed: capacity
recalibration, separate migration tracking. Open question: Is the
documentation stagnation related to migration load or a separate
dynamic? Revisit at Q2-W12."
```

---

## The Bootstrap Paradox

When a model is newly created — whether by human or LLM — the first MMOT evaluation operates under a specific constraint:

**The first evaluation is a demonstration of the methodology, not a trusted verdict.**

This matters because:

1. **Element state and trend are initial estimates.** They have not been validated through observation.
2. **The evaluation has no prior cycle to compare against.** The "Document" step has no history to reference.
3. **The LLM is evaluating a model it may have just generated.** Self-evaluation of self-generated content has inherent circularity.

### How to handle the bootstrap:

```
First Evaluation Preamble:
"This is the initial MMOT evaluation of a newly created model.
State and trend values represent initial assessment, not validated
observations. This evaluation establishes a baseline for future
cycles. Its primary value is structural — confirming element
selection, testing the model's evaluability, and identifying
initial tensions — rather than diagnostic."
```

The bootstrap resolves naturally through iteration:
- **Cycle 1:** Establish baseline, test model structure
- **Cycle 2:** Compare against baseline, validate or adjust initial assessments
- **Cycle 3+:** Full MMOT with historical context and validated trends

---

## Evaluation Creates Structural Tension

A core principle: MMOT evaluation does not merely ASSESS — it CREATES.

Each evaluation introduces new structural tension between:
- What the evaluation revealed (current reality)
- What the evaluation makes visible as possible (desired outcome)

This tension is generative. It advances the system rather than oscillating between "acceptable" and "unacceptable" states.

### Example of advancing tension:

```
Before evaluation:
  Sprint Velocity is unacceptable and declining.
  (This is known but undifferentiated)

After MMOT evaluation:
  Sprint Velocity decline is structurally coupled to React migration
  quality standards. Velocity targets assume pre-migration conditions.
  
  NEW TENSION: Between current velocity targets (designed for stable
  codebase) and the team's actual operating context (active migration).
  
  This tension didn't exist before the evaluation named it.
  It advances understanding from "velocity is declining" to
  "velocity targets are misaligned with migration reality."
```

The evaluation has not merely described a situation — it has created a new structural relationship that makes different actions possible.

---

## LLM Agent Behavior Guidance

When an LLM agent executes this workflow, it should follow these principles:

### Element Selection
- Choose 4-7 elements (enough for pattern detection, few enough for depth)
- Each element should be independently evaluable (clear state + trend)
- Elements should span different aspects of performance (technical, process, human)
- Avoid overlapping elements (e.g., "Code Quality" and "Code Review Quality" overlap)

### State and Trend Assignment
- **State (TwoFlag):** Based on whether the element meets the model's own standard of "acceptable" — not an external benchmark
- **Trend (ThreeFlag):** Based on direction of movement over the review period — not absolute level
- When uncertain, prefer `stable (0)` over guessing direction

### Evaluation Depth
- Acknowledge step: 2-4 sentences per element, pure description
- Analyze step: Cross-element pattern identification, 1-2 key patterns
- Plan step: 2-4 concrete actions, each with explicit advancing rationale
- Document step: Summary paragraph + open questions for next cycle

### Iteration Criteria
The agent should iterate (re-evaluate) when:
- Initial element selection missed a dimension revealed by analysis
- State/trend values need adjustment based on MMOT patterns
- Human feedback changes the model structure

The agent should NOT iterate when:
- Evaluation is complete and coherent
- Further iteration would not produce new insight
- The model has been through 3+ cycles (diminishing returns)

---

## Dependencies

- **Runtime:** Veritas MCP Server (provides tool invocation), LLM with function calling capability
- **Types consumed:** `DigitalModel` (type 2), `DigitalElement` (TwoFlag + ThreeFlag), `MMOTEvaluation` from veritas types
- **Kinship:**
  - → `mcp_server.spec.md` — The tools this workflow invokes (`veritas_generate_model`, `veritas_get_model`, `veritas_mmot_evaluate`, `veritas_update_model`)
  - → `performance_review_model.spec.md` — Defines the type 2 model structure and state × trend evaluation semantics
  - → MMOT methodology reference: Robert Fritz's Managerial Moment of Truth, as adapted in the veritas KINSHIP lineage

---

## Advancing Patterns

- **Multi-Cycle Tracking** — Persist MMOT evaluations as model history entries, enabling the agent to reference previous cycles' tensions and actions when performing new evaluations
- **Human-in-the-Loop Gates** — Define configurable checkpoints where the agent pauses for human review before proceeding (e.g., after model generation, before committing evaluation)
- **Cross-Model Synthesis** — Enable an agent to run MMOT across multiple related models and synthesize a meta-evaluation (e.g., "Across all team reviews, documentation is the most common declining element")
- **Tension Genealogy** — Track how structural tensions evolve across evaluation cycles: which tensions resolve, which transform, which persist — creating a narrative of organizational advancement
- **Calibration Protocols** — After several cycles, the agent compares its initial assessments against validated outcomes to calibrate its evaluation accuracy for future models
