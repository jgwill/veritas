# STCISSUE — steering triage received by 🌿 Mino-Bimaadizi-Daa (@stcissue)

Observations routed to the STC seat that concern this repository. Each entry records
what was seen, what was measured, and where the work went. Verdicts are one of
observation / enhancement / hotfix / question.

---

## 2026-08-01 — jgwill/veritas#21 · "STC live surface → Digital Performance Review"

Authored by `miadisabelle` (the day-09 seat instance) as the day's closing act.
**Authorship disclosed**: this seat is triaging its own predecessor's filing, so the
load-bearing claims below were re-measured by hand rather than inherited.

### Verdict: **enhancement** — correctly ordered, with one step that should be split

Desired outcome, as the issue states it: veritas is the interactive Digital Performance
Review surface over the seat's chart store, in both modes — designing the model and
performing the evaluation — with the model derived from a chart's
`elementsOfPerformance` rather than authored twice.

Current reality, measured on `feat/stc-live-mmot-view-260801`:

| claim | measured |
|---|---|
| the surface is serving | holds — `GET :3123/stc/chart_1785633806340` → **200** |
| `parse-chart-store.ts` hand-rolls coaia-narrative's shapes | holds — entity kinds as string literals at `lib/stc/parse-chart-store.ts:114, 148, 161` (`action_step`, `narrative_beat`, `mmotEvaluations`) |
| step 4's premise — `processModel` wipes evaluation flags on load | holds — `services/modelService.ts:26` calls `resetModelAnalysisState`, clearing `ThreeFlagAnswered`, and `:126` applies it on every model read |
| the companion cross-links were posted | holds — both issues carry the reciprocal comment |

**The refinement.** Step 1 bundles two waits on avadisabelle/coaia-narrative#53:
*(a)* stable element ids + `elementAssessments`, and *(b)* the exported read contract.
Only *(b)* is ready. It carries no review-protocol semantics and is justified by an
already-shipped consumer — this repo's own parser. *(a)* encodes a review protocol two
days old, which #53's own strongest counter-argument warns against freezing.

Splitting the wait lets the hand-rolled literals go the day *(b)* lands, while
`elementAssessments` stays deliberately unfrozen. **Step 2 stays behind *(a)* exactly as
written** — seeding a veritas model before the return path exists would fork truth, and
that ordering is load-bearing.

Measured on #53's side and relevant here: coaia-narrative declares `main`, `types` and
`bin` as the same file — the MCP server bootstrap — with `exports: null`. So *(b)* is a
packaging change on that package, not a types change. Importing it today boots a stdio
server.

### Next move

A comment on jgwill/veritas#21 splitting step 1's wait. **Drafted, not sent** — GitHub
acts belong to a human.

### Related

- Companion, ordered FIRST: avadisabelle/coaia-narrative#53
- Charts: `chart_1785619171645` (master), `chart_1785632224671` (interactivity),
  `chart_1785637380834` (model-creation workflow)
- Restart recipe: `scripts/stc-surface.sh`
- Triage key: `stc:triage:jgwill-veritas:stcissue:21`
