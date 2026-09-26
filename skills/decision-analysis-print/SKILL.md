---
name: decision-analysis-print
description: Use when modeling a decision or making a printable per-candidate evaluation. Establish the human workflow before rendering.
version: 1.0.0
author: Veritas contributors
license: MIT
metadata:
  hermes:
    tags: [decision-making, type-1, evaluation, print]
    related_skills: []
---

# Decision modeling versus a usable evaluation sheet

## Overview

Veritas Type 1 can model a YES/NO decision with elements and pairwise comparisons, analyze a candidate against those elements, and structure the resulting hierarchy. A **paper artifact is not a screenshot or a dump of all three app modes**. Determine whether the human needs (a) a model-building workbook, (b) a one-place reality evaluation, or (c) a comparative summary. One request may eventually need several artifacts, but do not make the user carry all of them to a telephone call.

## Before creating anything

1. Ask what the sheet will be used for in one sentence: “I have one candidate in front of me; what do I write, and where?” If still ambiguous, prototype one card and explain its marking procedure before expanding.
2. List atomic, independently answerable criteria. A combined card is invalid if the user may say YES to one part and NO to another, or prioritize them separately. A compact sheet must not achieve brevity by bundling unlike criteria.
3. Name the decision, the candidate, and the operator's acceptable threshold where known. Don't infer weights, ranks, or universal vetoes from a sample model. The operator may refine criteria and their wording.
4. Distinguish the **decision model** (what matters and any pairwise judgments) from **reality evaluation** (whether a specific candidate satisfies each criterion). Don't make hierarchy mandatory on a per-candidate sheet unless requested.
5. Use Type 1 sources deliberately: `rispecs/decision_making_model.spec.md`, `components/ModelingView.tsx`, `components/ComparisonModal.tsx`, `components/AnalyzingView.tsx`, `components/StructuringView.tsx`, `CAPABILITIES.md`. Check intended design against runtime before claiming exact software behavior. Type 2 trend controls do not belong on a Type 1 print aid.

## Default paper evaluation pattern

- One candidate per sheet. Start with the candidate identity/date, then cards with **name, concrete description, exactly two marks: acceptable / non acceptable**, and a short precision/evidence line. **Both marks blank = not yet evaluated**. Do not add an “unverified” checkbox merely to restate that absence. Never interpret blank as YES.
- Optional criteria may have a separate **not applicable** control (e.g. litter only if cats are present); it is not an acceptable vote. Use exactly one applicability rule per conditional criterion and explain it in plain language.
- The same criterion is evaluated once; revise it when new evidence arrives. A statement on the phone and an observation during a visit are different evidence, **not necessarily two separate acceptability decisions**. Provide stage-specific rows only if the user explicitly wants them.
- Keep the description meaningful enough for a real judgment. Leave space for specific facts (price, date, measurement, distance, odor source). If a one-page constraint limits handwriting, say so instead of pretending otherwise; use the reverse side or an optional notes page if authorized.
- A bottom “next action” is **not** an automatic Type 1 verdict. Do not report a fully reliable YES from partial responses, an incomplete hierarchy, or undocumented veto logic.
- Visual layout may borrow legible card grouping, but should not copy UI navigation, dominance pills, progress bars, comparison modals, or rankings into a simple field sheet. Use text plus outlines so monochrome print works.

## Separate model-building artifact, only when requested

Pairwise questions concern priorities before any candidate is evaluated. Log the human's own answers and unresolved ties/indispensable pairs; don't fill rankings from the app's old housing sample. The UI's `ComparisonModal.tsx` maps YES to the first element and NO to the second, but a NO to “have A without B?” does **not** logically prove B globally dominates A if both are indispensable. `CAPABILITIES.md` and the analyzing view also need reconciliation before any automatic veto claim. Keep this modeling aid separate from the field evaluation.

## Worked example and proof

Follow-up product proposal: [jgwill/veritas#22](https://github.com/jgwill/veritas/issues/22). See [`references/housing-field-trial.md`](references/housing-field-trial.md) for a September 2026 iterative print exercise. To reproduce the final one-page layout with the example factors (ReportLab and DejaVuSans required):

```bash
uv run --with reportlab python skills/decision-analysis-print/scripts/render.py \
  skills/decision-analysis-print/templates/housing-one-page.json /tmp/housing-sheet.pdf
pdfinfo /tmp/housing-sheet.pdf
pdftoppm -f 1 -l 1 -png /tmp/housing-sheet.pdf /tmp/housing-sheet
```

The JSON is an **example**, not default priorities or universal housing requirements. The renderer validates unique IDs, 1–14 factors, width and short descriptions; it does not calculate a decision. The episode's final N PDF/source are archived outside this repo. The repo now includes a reusable print aid, **not** an app-integrated export endpoint.

Before release: validate factor count and identity, inspect extracted PDF text, rasterize **every page**, check clipping/overlap, print size/orientation, handwriting space, and read the sheet aloud as if using it. If a user corrects the interaction, update the model of use before refining colors. Do not send a draft to a print service before its exact final bytes are reviewed; a revised PDF needs its own confirmation/code.

## Common pitfalls

- Treating all criticism as proof of a repo bug. Separate ambiguous human instructions, assistant translation mistakes, contradictory specs, and reproducible runtime defects.
- Packing nature/shops/transit, price/date, space/A/C, or calm/ventilation into single cards for page economy.
- Printing the application workflow instead of a usable per-candidate instrument.
- Adding a third “to verify” mark when blank already means not evaluated.
- Treating a telephone assertion as observed evidence, or an unanswered criterion as acceptable.
- Calling a paper design an official Veritas export without implementation and tests.

## Verification checklist

- [ ] Artifact type and operator's marking sequence are stated in plain language.
- [ ] Every criterion can independently receive acceptable/non acceptable.
- [ ] Blank and not-applicable semantics are explicit; no duplicate unknown control.
- [ ] One-page request remains one page after rasterization, at intended print dimensions.
- [ ] No ranks/verdicts are invented; any software-specific claim has source/test evidence.
- [ ] Repository changes are tested and committed on the intended branch; issues cite reproducible repo defects or clearly labeled product proposals.
