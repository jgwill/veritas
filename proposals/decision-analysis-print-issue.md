# Type 1 evaluation sheet and model-to-reality handoff

**Filed issue:** [jgwill/veritas#22](https://github.com/jgwill/veritas/issues/22). First phase shipped in `768c9cc`: in-repo skill, standalone renderer, example, and tests. This issue tracks possible application integration, not an existing broken export.

## User need

A decision model is useful only if a person can evaluate a concrete candidate without redoing its hierarchy. A printable per-candidate sheet should carry independently answerable criteria, one acceptability judgment each, and a place for the fact behind that judgment. Two unchecked boxes mean not yet evaluated; conditional not-applicable is separate. The sheet should not require the user to traverse modeling/analysis/structuring on paper.

## Scope proposal

1. Define an export surface from existing Type 1 elements into a field-sheet data shape (candidate label, title, ordered atomic factor IDs/names/descriptions, conditional applicability). Preserve element identity and avoid importing stored dominance as a fresh user's preference.
2. Expose an optional print action with one-candidate-per-sheet, black-and-white readable layout. Blank is unknown; neither blank nor not-applicable is a positive response. Allow correction after new evidence. Do not automatically emit YES/NO from incomplete evaluations.
3. Validate long labels, page overflow, factor count, uniqueness, conditional rule, and printed/rasterized output. The prototype under `skills/decision-analysis-print/` is a reusable **standalone helper**, not yet an application export.
4. Separately investigate the previously observed spec/runtime tensions around pairwise dominance and unanswered elements in `AnalyzingView.tsx`. Open a bug only after a reproducible test on current `main`; do not fold unverified logic claims into this UX proposal.

## Acceptance

- A user can state how they would mark one candidate in under a minute without being taught the application navigation.
- Nature/shops/transit, cost/date, space/A/C, and calm/ventilation can each be independently evaluated when selected.
- For every selected criterion, exactly one of acceptable/non acceptable can be checked; both blank are an unambiguous unevaluated state; no third “to verify” checkbox.
- One-page output is checked for legibility, overflow and monochrome print; no preset ranks or fabricated verdict.
- Source-facing skill and housing example remain available to future agents even without the original agent's local skills.

## Provenance and boundary

`skills/decision-analysis-print/references/housing-field-trial.md` records the September 2026 co-discovery and distinguishes agent translation errors, evolving human requirements, and possible repository issues. The field trial is evidence for **this product proposal**, not evidence that Veritas currently has a broken PDF export. Any actual app change should receive separate tests and review.
