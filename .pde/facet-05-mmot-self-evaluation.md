# PDE Facet 05: MMOT Self-Evaluation & Iteration

**UUID**: facet-05-mmot-self-evaluation
**Direction**: WEST (Reflection) → NORTH (Corrective Action)
**Priority**: META — evaluates all other facets

## What Wants to Be Created

A full MMOT (Managerial Moment of Truth) Performance Review Model evaluating this session's work, using veritas' own methodology to assess the quality of what was created. The evaluation produces a corrective plan that drives a second iteration pass, applying the very principle that MMOT describes: acknowledge → analyze → plan → document.

## Desired Outcome

- **Performance Review Model** (type 2) evaluating session output with elements:
  - DESIGN elements: MCP architecture quality, CLI usability, Rispec completeness, Kinship accuracy, .mw/ structure fidelity
  - EXECUTION elements: Code correctness, Schema alignment, Cross-repo consistency, Test coverage, Documentation clarity
- **MMOT Evaluation Report**: Four-step evaluation applying truth-as-verb
  1. Acknowledge: What was delivered vs what was intended
  2. Analyze: How did each element get to its current state (blow-by-blow)
  3. Plan: Corrective actions for each deficient element
  4. Document: Written record of evaluation and corrections
- **Second Pass Iteration**: Sub-agents apply corrections identified by MMOT evaluation
- **Simulation Output**: A report demonstrating veritas' own MMOT capability in action

## Current Reality

- The session will produce work across 4 facets (MCP, rispecs, kinship, integration)
- No self-evaluation mechanism exists yet
- MMOT methodology is well-documented (`/a/src/llms/llms-managerial-moment-of-truth.md`)
- Veritas is designed to BE the MMOT evaluator — this facet uses veritas on itself

## Action Stack

1. **SOUTH**: Re-read MMOT methodology for evaluation criteria
2. After all other facets complete, create Performance Review Model JSON
3. Evaluate each element (state + trend for each DESIGN and EXECUTION criterion)
4. Apply MMOT four-step process to the evaluation
5. Generate corrective plan — **this must create NEW structural tension (what we want to create next), NOT a reactive fix list**
6. Spawn correction agents to apply second-pass improvements

**DELEGATE (subagent with claude-opus-4.6)**: After iteration 1 is complete, this subagent receives ALL output from facets 01-04 and the Performance Review Model. Its job: run a full MMOT 4-step (Acknowledge → Analyze → Plan → Document) on the session output. Be honest. Name the bootstrap paradox explicitly — this is a first-pass demonstration, not a trusted verdict. Output: `.mw/north/session-mmot-evaluation.md`

**DELEGATE (subagent with claude-opus-4.6)**: After the MMOT evaluation, this subagent reads the corrective plan and applies targeted corrections across ALL files created in iteration 1. Focus on: SpecLang compliance (no reactive language), schema accuracy, kinship consistency. This IS iteration 2.

**DELEGATE (subagent with claude-opus-4.6)**: After iteration 2, re-evaluate. Compare iteration 1 vs iteration 2 elements. Document improvement or regression. This is the validation that the MMOT cycle actually advances. Output: `.mw/north/iteration-2-mmot-comparison.md`

7. Produce final report with both iterations compared

## ⚠️ Bootstrap Paradox — Name It

This facet uses veritas to evaluate veritas. The tool was just built. First-pass evaluation is a DEMONSTRATION of the methodology, not a trusted verdict. Say so in the report. Honest current reality > performative confidence.

## Files Needed

- `/a/src/llms/llms-managerial-moment-of-truth.md` — MMOT methodology
- All outputs from Facets 01-04
- `/workspace/repos/jgwill/veritas/constants.ts` — Performance Review Model example structure

## Ambiguities

- [IMPLICIT] How rigorous should the self-evaluation be? → Fully rigorous — this demonstrates the product
- [IMPLICIT] Should the corrective plan actually trigger re-work? → Yes, spawn correction sub-agents
- [EXPLICIT] "corrections that you could iterate again" — full second pass with corrections applied

## WEST Direction (Validation)

- Every evaluation element has honest state + trend assessment
- Corrective plan is specific and actionable
- Second pass actually improves identified deficiencies
- Report demonstrates MMOT methodology faithfully
