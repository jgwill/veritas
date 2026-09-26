# Agent entry point: decisions and printed evaluations

Read [`skills/decision-analysis-print/SKILL.md`](skills/decision-analysis-print/SKILL.md) whenever a request involves constructing a decision model, evaluating real options, or rendering a printable decision sheet. Do not infer that the requester wants every stage of the application printed. Establish the **artifact and moment of use** first; demonstrate how a person would actually mark one real candidate before generating multiple pages.

For Type 1 source and implementation, cross-check `rispecs/decision_making_model.spec.md`, `components/ModelingView.tsx`, `components/ComparisonModal.tsx`, `components/AnalyzingView.tsx`, `components/StructuringView.tsx`, and `CAPABILITIES.md`. Specs, UI, and an individual print aid are not interchangeable. Never treat a source sample's stored priority or `Valid` field as a new user's confirmed preferences.

The September 2026 housing print exercise is recorded in [`skills/decision-analysis-print/references/housing-field-trial.md`](skills/decision-analysis-print/references/housing-field-trial.md). It documents shared iteration and assistant-origin mistakes without asserting that every mismatch is an application bug.
