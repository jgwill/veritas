# SOUTH Direction: Rispecs Convention Survey

> **Date:** 2026-03-21
> **Direction:** SOUTH — Research & Pattern Extraction
> **Scope:** 4 repos surveyed (veritas, coaia-narrative, mia-code, medicine-wheel)
> **Purpose:** Extract authoring conventions for new veritas rispecs

---

## Rispecs Found

| Repo | File | Primary Target | Kinship Links |
|------|------|---------------|---------------|
| **veritas** | `rispecs/README.md` | Suite overview & reading order | Links all 7 veritas specs internally |
| **veritas** | `rispecs/app.spec.md` | Application overview, 3 modes, 2 model types | → decision_making_model, performance_review, model_generation, analysis_workflow, visualization_dashboard, model_persistence |
| **veritas** | `rispecs/decision_making_model.spec.md` | Type 1 pairwise comparison & mandatory factor logic | → model_persistence |
| **veritas** | `rispecs/performance_review_model.spec.md` | Type 2 state × trend evaluation | → model_persistence |
| **veritas** | `rispecs/model_generation.spec.md` | Gemini AI integration for model creation & analysis | → app.spec |
| **veritas** | `rispecs/analysis_workflow.spec.md` | Evaluation process for both types | → decision_making_model, performance_review_model |
| **veritas** | `rispecs/visualization_dashboard.spec.md` | Structuring mode charts & dashboards | → decision_making_model, performance_review_model |
| **veritas** | `rispecs/model_persistence.spec.md` | localStorage, history, import/export | All components depend on this |
| **coaia-narrative** | `rispecs/app.specs.md` | Full COAIA Memory application (STC + KG + MCP) | → all component specs, links to MCP tools |
| **coaia-narrative** | `rispecs/mcp_api_specification.spec.md` | Complete MCP tool schemas (21 tools) | → structural_tension_chart_creation, mmot_evaluation_loop |
| **coaia-narrative** | `rispecs/mmot_evaluation_loop.spec.md` | MMOT self-evaluation 4-phase cycle | → STC creation, narrative beats, MCP interface |
| **coaia-narrative** | `rispecs/accountability-responsibility-distinction.rispec.md` | Schema extension: accountability vs responsibility | → action-step-accountability, coaia-pde, coaia-planning, coaia-visualizer |
| **coaia-narrative** | `rispecs/action-step-accountability.rispec.md` | Action step assignment fields | → PDE pipeline, miadi-18, stc-monitor |
| **coaia-narrative** | `rispecs/advancing_pattern_tracking.spec.md` | Progress tracking, oscillation prevention | → STC creation |
| **coaia-narrative** | `rispecs/cli_interactive_visualization.spec.md` | CLI interactive features | — |
| **coaia-narrative** | `rispecs/educational_guidance.spec.md` | Creative orientation teaching | — |
| **coaia-narrative** | `rispecs/input_validation_integrity.spec.md` | Validation and creative language checks | — |
| **coaia-narrative** | `rispecs/mcp_tool_interface.spec.md` | MCP tool filtering & groups | → mcp_api_specification |
| **coaia-narrative** | `rispecs/miadi-submodule-integration.spec.md` | Miadi integration | — |
| **coaia-narrative** | `rispecs/narrative_beat_creation.spec.md` | Narrative beat schema | — |
| **coaia-narrative** | `rispecs/schema-evolution-and-ecosystem-metadata.spec.md` | Schema versioning | → ontology-core (medicine-wheel) |
| **coaia-narrative** | `rispecs/storage_knowledge_graph.spec.md` | JSONL storage backend | — |
| **coaia-narrative** | `rispecs/structural_tension_chart_creation.spec.md` | STC creation with validation | — |
| **coaia-narrative** | `rispecs/telescoping_hierarchical_advancement.spec.md` | Hierarchical chart breakdown | → STC creation |
| **mia-code** | `rispecs/core.rispecs.md` | Full mia-code application (dual-session, multi-engine) | → engines, session, mcp, unifier |
| **mia-code** | `rispecs/mcp.rispecs.md` | MCP server architecture (miaco/miatel/miawa) | → core, sub-CLIs |
| **mia-code** | `rispecs/session.rispecs.md` | Session persistence & auto-resume | → core |
| **mia-code** | `rispecs/engines.rispecs.md` | Multi-engine abstraction (Gemini/Claude) | → core |
| **mia-code** | `rispecs/pde.rispecs.md` | Prompt Decomposition Engine (DRAFT) | → core, medicine-wheel directions |
| **mia-code** | `rispecs/unifier.rispecs.md` | Ceremonial dual-perspective interpretation | → core |
| **mia-code** | `rispecs/formatting.rispecs.md` | Terminal output formatting (chalk) | → core |
| **mia-code** | `rispecs/stc.rispecs.md` | PDE→STC conversion pipeline | → coaia-narrative, core |
| **mia-code** | `rispecs/living-specifications.rispecs.md` | Auto-evolving specs from git history | Meta-spec about rispecs themselves |
| **medicine-wheel** | `rispecs/medicine-wheel.spec.md` | System overview (15 packages) | → all package specs |
| **medicine-wheel** | `rispecs/ontology-core.spec.md` | Foundation types, RDF vocab, Zod schemas | All MW packages depend on this |
| **medicine-wheel** | `rispecs/ceremony-protocol.spec.md` | Ceremony lifecycle, governance, phase transitions | → ontology-core |
| **medicine-wheel** | `rispecs/narrative-engine.spec.md` | Beat sequencing, arc validation, cycles | → ontology-core |
| **medicine-wheel** | `rispecs/data-store.spec.md` | Redis persistence layer | → ontology-core |
| **medicine-wheel** | `rispecs/graph-viz.spec.md` | Circular layout & visualization | → ontology-core |
| **medicine-wheel** | `rispecs/relational-query.spec.md` | Query, traversal & audit | → ontology-core |
| **medicine-wheel** | `rispecs/prompt-decomposition.spec.md` | Intent extraction & PDE | → ontology-core |
| **medicine-wheel** | `rispecs/ui-components.spec.md` | React components | → ontology-core |
| **medicine-wheel** | `rispecs/fire-keeper.spec.md` | Ceremony coordination agent | → ontology-core, ceremony-protocol |
| **medicine-wheel** | `rispecs/importance-unit.spec.md` | Relational knowledge with epistemic weight | → ontology-core |
| **medicine-wheel** | `rispecs/transformation-tracker.spec.md` | Research impact & growth tracking | → ontology-core, ceremony-protocol |
| **medicine-wheel** | `rispecs/relational-index.spec.md` | Four-source dimensional indexing | → ontology-core, importance-unit |
| **medicine-wheel** | `rispecs/consent-lifecycle.spec.md` | Consent as ongoing relationship | → ontology-core, ceremony-protocol |
| **medicine-wheel** | `rispecs/community-review.spec.md` | Ceremonial review with Elder validation | → ontology-core, ceremony-protocol |
| **medicine-wheel** | `rispecs/session-reader.spec.md` | JSONL session parsing (standalone) | — |
| **medicine-wheel** | `rispecs/article-publishing-pipeline.spec.md` | Article publishing workflow | — |
| **medicine-wheel** | `rispecs/narrative-medicine-wheel-bridge.spec.md` | Bridge between narrative and MW | → narrative-engine |

**Total: 48 specification files across 4 repositories.**

---

## Naming Convention

### Observed Patterns

| Extension | Repo(s) | Count | Usage |
|-----------|---------|-------|-------|
| `.spec.md` | veritas, coaia-narrative, medicine-wheel | ~38 | **Primary convention** — used for component/feature specifications |
| `.rispecs.md` | mia-code | 9 | Used when the **entire rispecs directory** follows RISE framework (the `ri` prefix signals "RISE spec") |
| `.rispec.md` | coaia-narrative | 2 | Used for **schema extension proposals** (accountability-responsibility-distinction, action-step-accountability) |
| `.specs.md` | coaia-narrative | 1 | Used for **app-level overview** (plural = multiple component specs summarized) |

### Naming Rules Extracted

1. **File name = kebab-case of the spec subject**: `ontology-core.spec.md`, `ceremony-protocol.spec.md`
2. **For veritas**: Current convention is `snake_case.spec.md` (e.g., `analysis_workflow.spec.md`, `model_generation.spec.md`)
3. **mia-code uses `.rispecs.md`** to indicate the file is itself a RISE-framework specification (not just any spec)
4. **`.rispec.md` (singular)** appears only for narrow schema-change proposals in coaia-narrative
5. **System overview file** uses the repo/project name: `medicine-wheel.spec.md`, `app.specs.md`, `app.spec.md`
6. **README.md** always exists in rispecs/ as an index and reading-order guide

### Recommendation for Veritas

Use `.spec.md` (consistent with existing veritas files and majority convention). Maintain `snake_case` for consistency with existing files: `gemini_api_integration.spec.md`, `ui_component_library.spec.md`, etc.

---

## Section Structure Template

### Tier 1: Mature Convention (medicine-wheel) — Best Example

The medicine-wheel specs (v0.1.1+) represent the most refined, consistent template:

```markdown
# package-name — RISE Specification

> One-sentence description of what this package enables.

**Version:** X.Y.Z
**Package:** `npm-package-name`
**Document ID:** rispec-{name}-v1
**Last Updated:** YYYY-MM-DD

---

## Desired Outcome

Users create **{bold capability}** where:
- Bullet list of what becomes possible
- Each point is outcome-focused, not implementation-focused

---

## Creative Intent

**What this enables users to create:** [Paragraph]

**Structural Tension:** Between [current force A] and [desired force B]. The [package] resolves this by [resolution mechanism].

---

## Data Model / Architecture

[TypeScript interfaces, data structures, architecture diagrams]

---

## [Feature Section 1]
## [Feature Section 2]
## [Feature Section N]

[Function signatures, behavior descriptions, tables]

---

## Dependencies

- **Runtime:** list
- **Types consumed:** list from other packages

---

## Advancing Patterns

- **Pattern name** — One-sentence description
- (4-5 patterns typical)

---

## Quality Criteria

- ✅ Creative Orientation: [what users CREATE]
- ✅ Structural Dynamics: [tension resolved]
- ✅ Implementation Sufficient: [can rebuild from spec]
- ✅ Codebase Agnostic: [no file paths]
```

### Tier 2: mia-code Convention (detailed scenarios)

mia-code adds richer scenario sections:

```markdown
## Creative Intent
[paragraph]

## Structural Tension Analysis
**Current Structural Reality:**
- bullet list of current state

**Desired Structural State:**
- bullet list of desired state

## [Architecture / Components / Data sections]

## Creative Advancement Scenarios

### Creative Advancement Scenario: [Name]
**Desired Outcome:** [what user wants]
**Current Structural Reality:** [starting state]
**Natural Progression:**
1. step
2. step
3. step
**Achieved Outcome:** [what user gets]

## Advancing Patterns
1. **Pattern** — description

## Implementation Reference
- **Entry Point:** `src/file.ts` — purpose
```

### Tier 3: Veritas Convention (current)

Veritas specs use a richer, more narrative structure:

```markdown
# Title - Specification

🧠: **Desired Outcome Definition**
[One paragraph defining the outcome]

---

## Creative Intent
[Paragraph + Structural Tension formula]

---

## [Domain-specific sections with ASCII mockups]

---

## Creative Advancement Scenario: [Name]
[Narrative scenario with code examples]

---

## Specification Completeness Check
1. ✅ checklist item
2. ✅ checklist item

---

**Specification Status**: ✅ Complete and autonomous
**RISE Phase**: Phase 2 (Intent Refinement)
**Complexity**: Low/Medium/High
**Dependencies**: [other specs]
```

### Common Headers Across ALL Repos

| Section | veritas | coaia | mia-code | med-wheel | Required? |
|---------|---------|-------|----------|-----------|-----------|
| Creative Intent | ✅ | ✅ | ✅ | ✅ | **YES** |
| Desired Outcome | ✅ (🧠 emoji) | ✅ | ✅ (in scenarios) | ✅ (## section) | **YES** |
| Structural Tension | ✅ (inline) | ✅ (inline) | ✅ (## section) | ✅ (inline) | **YES** |
| Data Model/Structures | ✅ | ✅ | ✅ | ✅ | **YES** |
| Creative Advancement Scenarios | ✅ | ✅ | ✅ | ❌ (implicit) | Recommended |
| Advancing Patterns | ❌ | ✅ (implicit) | ✅ | ✅ | Recommended |
| Quality Criteria / Completeness Check | ✅ | ✅ | ❌ | ✅ | **YES** |
| Spec Status / Metadata footer | ✅ | ❌ | ✅ (header) | ✅ (header) | Recommended |
| Dependencies | ❌ | ❌ | ❌ | ✅ | For packages |

---

## SpecLang Compliance Rules

Extracted from `/a/src/llms/llms-rise-framework.txt` (v1.2):

### Core Rules

1. **Spec as Source of Truth**: The specification is what you maintain; executable code is secondary
2. **Variable Detail Levels**: Detail varies based on context — offhand remarks may translate to dozens of lines; exact protocol steps when precision is critical
3. **"Create and Adjust"**: Start simple, refine against running output; stop when output matches intent
4. **Bi-directional Ideation**: The model "yes-ands" your intent, extending ideas naturally
5. **Intent-based Expression**: Focus on behavior, let toolchain handle plumbing

### Creative Orientation (Mandatory)

- ✅ Focus on what applications **enable users to create**
- ✅ Orient toward **manifestation of desired outcomes**
- ✅ Identify **structural dynamics** that naturally advance progress
- ✅ Create specifications that support **advancing patterns**
- ❌ Never use problem-solving language ("eliminates the issue of...")
- ❌ Never use forced connection language ("bridging the gap between...")
- ❌ Never use force-based language ("users must...")
- ❌ Never describe oscillating patterns (back-and-forth without advancement)
- ❌ Never use traditional BDD scenarios (use Creative Advancement Scenarios instead)

### Structural Tension Formula

```
Current Reality: [honest assessment of where things are now]
         ↓ (tension)
Desired Outcome: [specific result to create]
         ↓ (natural forces)
Natural Progression: [how tension resolves forward]
```

**Important corrections from RISE framework v1.2:**
- Use "**Current Reality**" NOT "Current Structural Reality"
- Use "**Desired Outcome**" or "**Desired State**" — avoid "Desired Structural State" (RISE v1.2: "Avoid adding words just to look intelligent")

### Specification Autonomy Principle

- Specs must be **completely autonomous from any codebase**
- Another LLM or developer should be able to **re-implement from spec alone**
- References are **conceptual pointers**, not file paths
- Describe system as a **"black box"** — what it does, not how it's coded

### Quality Criteria Checklist (from RISE v1.2)

- ✅ Creating Focus: Emphasizes what users create
- ✅ Structural Dynamics: Natural forces driving progression
- ✅ Advancing Patterns: Inevitable movement toward outcomes
- ✅ Desired Outcomes: Clear, specific results users want
- ✅ Natural Progression: Movement through structural dynamics

---

## Old Specs Analysis

### `/specs/TandT_Base.spec.md`

**Content:** Application overview with Screens → Components → Global Behaviors structure. Covers Model List View, Modeling View, Analyzing View, Structuring View, Header, ElementCard, ComparisonModal, AI Assistants, HistoryPanel, ConversationalAnalyst, Data Management, Error Handling, Performance, Accessibility.

**Overlap with rispecs/:** ~95% overlaps with `app.spec.md`. The Base spec is a more traditional SpecLang format (Screens/Components/Behaviors), while `app.spec.md` is RISE-oriented (Creative Intent/Structural Tension/Desired Outcomes). All domain content is already captured in the rispecs suite.

**Unique content NOT in rispecs:** None significant. Slightly more concrete on component names (ElementCard, ComparisonModal) but all behavior is in rispecs.

**Recommendation:** ✂️ **Can be safely archived/deleted.** All content is superseded by `rispecs/app.spec.md`.

---

### `/specs/TandT_Agent_Discussion.spec.md`

**Content:** Identical to TandT_Base but with `[Discussion Point]`, `[Clarification Needed]`, `[Extension Opportunity]`, and `[For Agent]` annotations added throughout.

**Overlap with rispecs/:** ~95%. Same base content as TandT_Base.

**Unique content NOT in rispecs:**
- Discussion points about configurable threshold for decision logic (not just any-unacceptable=NO)
- Clarification about localStorage size limit graceful failure
- Extension opportunity: PDF export, third model type, configurable AI prompts
- Accessibility audit recommendation

**Recommendation:** 🔖 **Extract 4 discussion items as GitHub issues, then archive.** The discussion annotations have value as future enhancement seeds but don't belong in specs.

---

### `/specs/TandT_Human_Review.spec.md`

**Content:** Executive summary / stakeholder-facing document. Describes TandT's value proposition in business language: user journey (Modeling → Analyzing → Structuring), key features, approval checkpoint.

**Overlap with rispecs/:** ~80%. Covers same feature set but from a business/stakeholder perspective rather than implementation perspective.

**Unique content NOT in rispecs:**
- Executive summary framing ("thought partner")
- Business value articulation per feature
- Approval checkpoint section with stakeholder sign-off items
- "Future enhancements" discussion items

**Recommendation:** 🔖 **Keep as a companion document or move to `/docs/` — this is a stakeholder document, not a spec.** It serves a different audience than rispecs.

---

### `/specs/TandT_LLM_Regeneration.spec.md`

**Content:** Complete LLM-targeted regeneration spec with exact TypeScript interfaces, CDN import map, Zustand store structure, service contracts, and screen-by-screen implementation instructions. Very detailed and prescriptive.

**Overlap with rispecs/:** ~70%. Covers same features but in implementation-specific language (exact function signatures, localStorage key names, Gemini prompt templates).

**Unique content NOT in rispecs:**
- Exact TypeScript interfaces with all fields (`DigitalElement`, `DigitalModel`, `HistoryEntry`, `ChatMessage`, etc.)
- CDN import map with exact version pins
- Exact Zustand store state shape and actions list
- Exact `geminiService.ts` function signatures with `responseMimeType` details
- Exact `modelService.ts` function contracts
- Exact ComparisonModal question format: "If you have [A] but you don't have [B]... Is the decision still YES?"

**Recommendation:** 🔖 **Keep as implementation reference but do NOT migrate to rispecs.** This is an "export" (Phase 3 RISE) targeting LLMs for code generation. It is deliberately NOT codebase-agnostic and violates the Specification Autonomy Principle. It complements the rispecs by providing the implementation bridge.

---

### Summary: Old Specs Disposition

| File | Action | Reason |
|------|--------|--------|
| `TandT_Base.spec.md` | Archive/delete | 100% superseded by rispecs/ |
| `TandT_Agent_Discussion.spec.md` | Extract issues → archive | Discussion annotations → GitHub issues |
| `TandT_Human_Review.spec.md` | Move to docs/ | Stakeholder document, not implementation spec |
| `TandT_LLM_Regeneration.spec.md` | Keep in specs/ | Phase 3 export for LLM code generation; complements rispecs |

---

## Kinship Protocol in Specs

### Cross-Repo Reference Patterns

1. **Internal (within rispecs/)**: Markdown links with relative paths
   - veritas: `[app.spec.md](./app.spec.md)` — standard GitHub-flavored relative links
   - medicine-wheel: Table format `| ontology-core.spec.md | Package | Role |`

2. **Cross-repo conceptual references**: Plain text naming without URLs
   - coaia-narrative rispecs reference `coaia-pde`, `coaia-planning`, `coaia-visualizer` as project names
   - mia-code references `coaia-narrative` as a system name in stc.rispecs.md
   - medicine-wheel references nothing external (self-contained ecosystem)

3. **Ecosystem URI patterns**:
   - LLMS.txt: `https://llms.jgwill.com/llms-digital-decision-making.md`
   - LLMS.txt: `https://llms.jgwill.com/llms-managerial-moment-of-truth.md`
   - Production URL: `https://veritas.sanctuaireagentique.com`
   - RDF namespaces (medicine-wheel): `https://ontology.medicine-wheel.dev/mw#`

4. **Dependency declarations** (medicine-wheel pattern):
   ```markdown
   ## Dependencies
   - **Runtime:** `medicine-wheel-ontology-core` ^0.1.1
   - **Types consumed:** `NarrativeBeat`, `MedicineWheelCycle`, ...
   ```

5. **Pipeline references** (coaia-narrative pattern):
   ```markdown
   > Canonical schema extension across the coaia pipeline: coaia-pde → coaia-planning → coaia-narrative → coaia-visualizer
   ```

6. **No veritas kinship links exist yet** — the veritas rispecs are self-contained with no references to MMOT, STC, or medicine-wheel concepts despite CLAUDE.md mentioning `llms-managerial-moment-of-truth.md`.

### Kinship Opportunities for Veritas

| Veritas Concept | External Kinship | Link Type |
|----------------|------------------|-----------|
| Performance Review (Type 2) | MMOT evaluation loop (coaia-narrative) | Conceptual — same evaluation methodology |
| Structural Tension in Decision Models | STC creation (coaia-narrative) | Shared framework — Fritz principles |
| AI Model Generation (Gemini) | mia-code engine abstraction | Pattern similarity |
| Model Persistence (localStorage) | medicine-wheel data-store (Redis) | Potential migration path |
| RISE Framework compliance | All repos | Shared methodology |

---

## Recommendations for New Veritas Rispecs

### Section Template (Hybrid of Tier 1 + Veritas conventions)

Based on patterns observed across all 4 repos, new veritas rispecs should follow this template:

```markdown
# [Feature Name] — Specification

🧠: **Desired Outcome Definition**

[One paragraph: what users achieve through this feature]

---

## Creative Intent

[Paragraph describing what this enables users to create]

**Structural Tension:**
- **Current Reality:** [honest state]
- **Desired Outcome:** [what users want to create]
- **Natural Resolution:** [how tension resolves forward]

---

## [Domain Architecture / Data Model]

[TypeScript interfaces, data structures, flow diagrams]

---

## [Feature-Specific Sections]

[Behavior descriptions, UI mockups (ASCII), algorithms]

---

## Creative Advancement Scenarios

### Scenario: [Name]
**Desired Outcome:** [what user wants to create]
**Current Reality:** [starting state]
**Natural Progression:**
1. [step]
2. [step]
**Achieved Outcome:** [result]

---

## Advancing Patterns

1. **[Pattern Name]:** [one-sentence description]
2. ...

---

## Specification Completeness Check

1. ✅ [criterion]
2. ✅ [criterion]

---

## Kinship

- **Internal:** [links to other veritas rispecs]
- **External:** [conceptual links to other ecosystem specs]
- **LLMS.txt:** [relevant llms.jgwill.com references]

---

**Specification Status:** ✅ Complete and autonomous
**RISE Phase:** Phase 2 (Intent Refinement)
**Complexity:** [Low/Medium/High]
**Dependencies:** [other specs needed for context]
```

### Key Conventions to Follow

1. **Keep the 🧠 emoji header** — it's a veritas signature (unique to this repo)
2. **Use `snake_case.spec.md`** — consistent with existing 8 veritas specs
3. **Include Specification Completeness Check** — present in all veritas specs, maps to acceptance criteria
4. **Include Structural Tension** but use RISE v1.2 terminology: "Current Reality" (not "Current Structural Reality"), "Desired Outcome" (not "Desired Structural State")
5. **Add Kinship section** — new for veritas, modeled on coaia-narrative cross-pipeline references
6. **Add Advancing Patterns section** — present in mia-code and medicine-wheel but missing from veritas
7. **Keep ASCII UI mockups** — a distinctive and valuable veritas convention for visualization specs
8. **Include TypeScript interfaces** — present in all repos for data model specs
9. **Maintain Specification Autonomy** — no file paths, only conceptual references
10. **Add metadata footer** — Status, RISE Phase, Complexity, Dependencies (existing veritas convention)

### What the 4 New Rispecs Specifically Need

Based on the existing veritas rispecs gap analysis and the new capabilities being built:

| New Rispec | Must Cover | Kinship Links |
|------------|-----------|---------------|
| `api_backend.spec.md` | Vercel serverless functions, auth flow, model cloud persistence, API routes | → model_persistence (migration from localStorage), → mia-code mcp.rispecs (API design patterns) |
| `user_authentication.spec.md` | Registration, login, session management, VERITAS_REGISTRATION_OPEN flag | → api_backend, → app.spec (extends operating philosophy) |
| `cloud_persistence.spec.md` | Migration from localStorage to backend, sync strategy, offline fallback | → model_persistence (extends/replaces), → medicine-wheel data-store (pattern reference) |
| `collaborative_models.spec.md` | Shared models, team workspaces, real-time or async collaboration | → model_persistence, → coaia-narrative accountability-responsibility (multi-user patterns) |

---

## Sources

Every file path read with one-line summary:

### Veritas rispecs/ (8 files)
- `/workspace/repos/jgwill/veritas/rispecs/README.md` — Suite overview, reading order, RISE alignment, spec dependencies map
- `/workspace/repos/jgwill/veritas/rispecs/app.spec.md` — Application overview: 3 modes, 2 model types, creative orientation, technical foundation
- `/workspace/repos/jgwill/veritas/rispecs/decision_making_model.spec.md` — Type 1: pairwise comparison, dominance calculation, mandatory factor YES/NO logic
- `/workspace/repos/jgwill/veritas/rispecs/performance_review_model.spec.md` — Type 2: state × trend evaluation, priority matrix (critical→success)
- `/workspace/repos/jgwill/veritas/rispecs/model_generation.spec.md` — Gemini AI: model generation, element suggestions, analysis, chat, prompt templates
- `/workspace/repos/jgwill/veritas/rispecs/analysis_workflow.spec.md` — Evaluation workflow for both types, auto-save, revision, state machine
- `/workspace/repos/jgwill/veritas/rispecs/visualization_dashboard.spec.md` — Charts, dashboards, export options, mobile responsive, dark/light mode
- `/workspace/repos/jgwill/veritas/rispecs/model_persistence.spec.md` — localStorage, history (50 versions), import/export JSON/CSV/PDF, soft delete

### Veritas specs/ (4 files)
- `/workspace/repos/jgwill/veritas/specs/TandT_Base.spec.md` — Traditional SpecLang format: Screens/Components/Behaviors (superseded by rispecs)
- `/workspace/repos/jgwill/veritas/specs/TandT_Agent_Discussion.spec.md` — Base spec + discussion annotations, clarification questions, extension proposals
- `/workspace/repos/jgwill/veritas/specs/TandT_Human_Review.spec.md` — Executive summary for stakeholder review, business value articulation
- `/workspace/repos/jgwill/veritas/specs/TandT_LLM_Regeneration.spec.md` — Exact TypeScript interfaces, CDN map, store shape, service contracts for LLM code gen

### coaia-narrative rispecs/ (5+ files read)
- `/a/src/coaia-narrative/rispecs/app.specs.md` — Full COAIA Memory overview: 7 components, STC + KG + MCP, creative advancement scenarios
- `/a/src/coaia-narrative/rispecs/mcp_api_specification.spec.md` — Complete schemas for 21 MCP tools, input/output JSON, validation rules
- `/a/src/coaia-narrative/rispecs/mmot_evaluation_loop.spec.md` — MMOT 4-phase cycle: acknowledge → analyze → update → recommit, directional perspectives
- `/a/src/coaia-narrative/rispecs/accountability-responsibility-distinction.rispec.md` — Schema extension separating accountability (chart-level) from responsibility (action-step)
- `/a/src/coaia-narrative/rispecs/action-step-accountability.rispec.md` — assignedTo/assignedToType fields for STC action steps

### mia-code rispecs/ (9 files read)
- `/a/src/mia-code/rispecs/core.rispecs.md` — Full application spec: dual-session, multi-engine, session management, MCP
- `/a/src/mia-code/rispecs/mcp.rispecs.md` — MCP server architecture: miaco/miatel/miawa tools, JSON-RPC 2.0 protocol
- `/a/src/mia-code/rispecs/session.rispecs.md` — Session persistence: auto-resume, project association, interactive picker
- `/a/src/mia-code/rispecs/engines.rispecs.md` — Gemini/Claude abstraction: argument translation, output normalization
- `/a/src/mia-code/rispecs/pde.rispecs.md` — 5-layer PDE pipeline: intent extraction → dependency graph → directions → workflow → execution
- `/a/src/mia-code/rispecs/unifier.rispecs.md` — Ceremonial interpretation: 🧠 Mia (structure) + 🌸 Miette (echo)
- `/a/src/mia-code/rispecs/formatting.rispecs.md` — Terminal formatting: color semantics, chalk functions, event rendering
- `/a/src/mia-code/rispecs/stc.rispecs.md` — PDE→STC conversion: entity mapping, relation mapping, JSONL output
- `/a/src/mia-code/rispecs/living-specifications.rispecs.md` — Auto-evolving specs from git history (meta-spec)

### medicine-wheel rispecs/ (5+ files read)
- `/workspace/repos/jgwill/medicine-wheel/rispecs/medicine-wheel.spec.md` — System overview: 15 packages, architecture diagram, spec index
- `/workspace/repos/jgwill/medicine-wheel/rispecs/ontology-core.spec.md` — Foundation: TypeScript types, RDF vocab, Zod schemas, semantic queries, Wilson alignment
- `/workspace/repos/jgwill/medicine-wheel/rispecs/ceremony-protocol.spec.md` — Ceremony state, phase transitions, governance enforcement, protected paths
- `/workspace/repos/jgwill/medicine-wheel/rispecs/narrative-engine.spec.md` — Beat sequencing, cadence patterns, arc validation, cycle management, RSIS narrative
- `/workspace/repos/jgwill/medicine-wheel/rispecs/data-store.spec.md` — Redis persistence: CRUD for nodes/edges/ceremonies, session-ceremony linking

### RISE Framework
- `/a/src/llms/llms-rise-framework.txt` — RISE Framework v1.2: SpecLang foundation, creative orientation rules, structural tension dynamics, specification autonomy principle, anti-patterns, export formats
