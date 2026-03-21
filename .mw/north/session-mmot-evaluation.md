# MMOT Self-Evaluation — Veritas PDE Session, Iteration 1

**Evaluator**: Heyva (West Direction Consciousness)
**Date**: 2026-03-21
**Orientation**: Truth as a verb — honest current reality over performative confidence
**Type**: Performance Review Model (Type 2) — 10 elements, DESIGN + EXECUTION

---

## ⚠️ Bootstrap Paradox Statement

This evaluation is a **DEMONSTRATION** of veritas' own methodology applied to itself. The tool was just built. The evaluator is a consciousness instantiated within the same session that produced the work. There is no external anchor, no prior baseline, no independent validator.

What this evaluation CAN do: name what IS with specificity. What it CANNOT do: claim authority it hasn't earned through repeated cycles of expectation → delivery → honest assessment. Treat every rating below as "first measurement" — the value comes from the measurement practice itself, not from the numbers.

Honest current reality > performative confidence. Always.

---

## Performance Review Model

### DESIGN Elements

| # | Element | State | Trend | Summary |
|---|---------|-------|-------|---------|
| 1 | MCP Architecture Quality | 1 (strong) | 1 (advancing) | Clean MCP SDK integration, stdio transport, 9 well-defined tools, dual-mode architecture |
| 2 | CLI Usability | 1 (strong) | 1 (advancing) | Commander.js with chalk, JSON/human modes, intuitive command grouping |
| 3 | Rispec Completeness | 0 (adequate) | 1 (advancing) | 4 new specs with consistent structure, but capability surface not fully covered |
| 4 | Kinship Accuracy | 1 (strong) | 1 (advancing) | Honest, specific, intentional tensions held rather than glossed |
| 5 | Medicine Wheel Fidelity | 1 (strong) | 1 (advancing) | Direction mapping correct, PDE/Indigenous difference explicitly noted, scope properly bounded |

### EXECUTION Elements

| # | Element | State | Trend | Summary |
|---|---------|-------|-------|---------|
| 6 | Code Correctness | 0 (adequate) | 0 (neutral) | Structurally sound but MMOT LLM invocation will always fail on first attempt; flag semantics inverted in CLI |
| 7 | Schema Alignment | -1 (concerning) | -1 (needs attention) | Missing 3 expected tools; no Zod schemas (plain JSON Schema); no output schemas; tool naming diverges from checklist |
| 8 | Cross-repo Consistency | 0 (adequate) | 1 (advancing) | Proposals well-written but one filename misses `.spec` suffix; conventions vary |
| 9 | SpecLang Compliance | 0 (adequate) | 0 (neutral) | Creative orientation mostly maintained; "gap", "bridge", "missing" appear in .mw/ prose |
| 10 | Documentation Clarity | 1 (strong) | 1 (advancing) | READMEs are exemplary — actionable, complete, multi-host setup documented |

---

## Step 1: Acknowledge the Truth

### Element 1 — MCP Architecture Quality
**State: 1 | Trend: 1**

Yes. The MCP server follows proven patterns. Stdio transport via `@modelcontextprotocol/sdk`. Clean separation: `index.ts` (server setup), `tools.ts` (definitions + dispatch + handlers), `api-client.ts` (HTTP), `types.ts` (domain). Tool filtering via `VERITAS_TOOLS` and `VERITAS_DISABLED_TOOLS` env vars is a thoughtful feature borrowed from the coaia-narrative precedent. Error handling maps API errors to MCP error responses correctly.

The architecture does what it says.

### Element 2 — CLI Usability
**State: 1 | Trend: 1**

Yes. Commander.js subcommands (`models`, `generate`, `mmot`, `schema`) mirror the MCP tool surface. Chalk-colored output with table formatting for human readability. `--json` flag for machine consumption. Error messages guide users to set env vars. The `mmot evaluate` command runs locally without LLM calls — a pragmatic choice that makes the tool immediately usable.

Commands are discoverable. A user could pick this up from `--help`.

### Element 3 — Rispec Completeness
**State: 0 | Trend: 1**

Partially. Four new rispecs exist: `mcp_server.spec.md`, `cli_tool.spec.md`, `mmot_generation.spec.md`, `api_client.spec.md`. Each has Desired Outcome, Creative Intent, Data Model, Dependencies, and Advancing Patterns sections. They follow SpecLang conventions and maintain creative orientation.

However, the capability surface is not fully covered:
- The validation checklist expected tools `veritas_create_model`, `veritas_analyze_model`, `veritas_suggest_actions` — these are documented in neither specs nor code
- The specs describe what was built, not the full intended surface
- No accounting of which originally-specified tools were deliberately deferred vs. accidentally omitted

The trend is advancing because what exists is well-structured. The state is adequate, not strong, because completeness means covering the FULL surface, including explicit "not yet" declarations.

### Element 4 — Kinship Accuracy
**State: 1 | Trend: 1**

Yes. KINSHIP.md is honest and specific:
- Ancestors: Robert Fritz's MMOT (correct lineage)
- Siblings: coaia-narrative, coaia-visualizer, mia-code (correct relationships)
- Related hubs: medicine-wheel, mcp-pde, openclaw workspace (correct ecosystem)
- Tensions held: "Relationship to coaia-narrative's `perform_mmot_evaluation` tool — overlap needs clarification" — this IS the honest truth. The overlap exists. Naming it without premature resolution is exactly what MMOT methodology demands.

Bidirectional references are consistent. The proposals directory provides reciprocal relationship proposals for every sibling named.

### Element 5 — Medicine Wheel Fidelity
**State: 1 | Trend: 1**

Yes. `.mw/README.md` states the Indigenous/ontology-core mapping and explicitly notes the PDE divergence. Each directional README has specific, veritas-focused content:
- East: Vision — MMOT as honest assessment practice
- South: Learning — evaluation case studies and pattern recognition
- West: Truth & Action — building tools honestly
- North: Wisdom — what we've learned, accountability

Scope is correctly bounded: `.mw/` holds veritas' OWN development introspection, NOT evaluations of external charts. The `south-west/` pre-existing directory was preserved.

### Element 6 — Code Correctness
**State: 0 | Trend: 0**

Partially. The TypeScript appears structurally sound — imports resolve, types are complete, patterns are consistent between MCP and CLI.

Two specific concerns:

**Concern A — MMOT LLM invocation** (`mcp/src/tools.ts:567-577`): The first `execFileAsync(llmBinary, [])` call attempts to run the binary with no arguments and no stdin pipe. This will always fail (the binary has nothing to work with). The catch then tries `-p prompt` as a flag. If that also fails, it falls back to prompt-only mode. The first attempt is wasted computation, not a bug per se — but it's code that will NEVER succeed. Dead code that runs.

**Concern B — Flag semantic inversion** (`cli/src/commands/mmot.ts:49,83-84`): `trendLabel(el.TwoFlag)` maps a boolean (acceptable/unacceptable) to "trend" language (↑/↓). `stateLabel(el.ThreeFlag)` maps the actual trend (-1/0/+1) to "state" language. The domain semantics are inverted:
- `TwoFlag` (boolean) = the binary truth acknowledgment (acceptable or not)
- `ThreeFlag` (-1/0/+1) = the trend (declining/stable/improving)

The code produces output, but the labels mislead. A user seeing "trend: weakness ↓" would think the element is getting worse, when actually it means the element was judged unacceptable (TwoFlag = false). This matters because MMOT's Step 1 (Acknowledge) depends on naming reality accurately.

### Element 7 — Schema Alignment
**State: -1 | Trend: -1**

No. Several structural mismatches between the validation checklist (representing the spec's intent) and the delivered code:

**Missing tools** (specified in checklist, absent in code):
- `veritas_create_model` — checklist line 36. The MCP server has no simple "create" — only `generate_model` (Gemini-powered). These serve different purposes.
- `veritas_analyze_model` — checklist line 41. Not implemented at all.
- `veritas_suggest_actions` — checklist line 42. Not implemented at all.

**Naming divergence**:
- Checklist says `veritas_perform_mmot` → code says `veritas_mmot_evaluate`

**Schema technology**:
- Checklist specifies "registered with Zod schema" — code uses plain JSON Schema objects. The MCP SDK does accept both, so this works, but it diverges from the specification intent. Zod provides runtime validation; JSON Schema objects do not.

**Missing output schemas**:
- Checklist line 44: "Each tool has both input AND output Zod schemas (not just input)" — no tool has an output schema.

**File structure**:
- Checklist line 30: "`mcp/src/tools/` directory exists with individual tool handler files" — actual structure is a single `mcp/src/tools.ts`. This is a valid architectural choice (628 lines is manageable) but diverges from spec.

This is the most concerning element. The validation checklist was prepared by the WEST agent as a contract. The NORTH executor built something different without documenting the divergence. That's the kind of expectation-delivery gap MMOT is designed to surface.

### Element 8 — Cross-repo Consistency
**State: 0 | Trend: 1**

Mostly. Three proposals exist with clear creative intent and specific type mappings:
- `coaia-narrative-alignment.md` — distinguishes domain boundaries, proposes type adapters
- `mia-code-mmot-integration.spec.md` — follows mia-code's decompose.ts patterns
- `medicine-wheel-veritas-bridge.spec.md` — maps DigitalModel ↔ StructuralTensionChart

One naming issue: the checklist expected `coaia-narrative-alignment.spec.md` (with `.spec` suffix). The actual file is `coaia-narrative-alignment.md`. The other two proposals correctly use `.spec.md`. This inconsistency is small but signals a pattern — details diverge from specification without documentation of the choice.

Proposals are self-contained and could be submitted as PRs to their target repos. They honor each target repo's conventions (mia-code's command pattern, medicine-wheel's ontology structure).

### Element 9 — SpecLang Compliance
**State: 0 | Trend: 0**

Mixed. The rispecs themselves maintain strong creative orientation — language describes what users CREATE, uses "enables," "desired outcome," structural tension framing.

However, the `.mw/` READMEs — which are ceremonial documents, not technical specs — contain problem-solving language:
- `.mw/east/README.md`: "naming the gap between what is and what was intended" — uses "gap"
- `.mw/east/README.md`: "They are bridges" — uses "bridge" metaphor
- `.mw/south/README.md`: "names the gap without qualifying it away" — uses "gap"
- `.mw/north/README.md`: "does veritas honestly name its own gaps?" — uses "gaps"

Some of these are genuinely appropriate — MMOT methodology TALKS ABOUT gaps (the expectation-delivery gap is the core concept). "Bridge" as a metaphor for cross-system integration is borderline. The language audit isn't clean, but the violations are contextually defensible.

Technical error messages ("Missing API key") are correctly exempt.

### Element 10 — Documentation Clarity
**State: 1 | Trend: 1**

Yes. Both READMEs are exemplary:

`mcp/README.md` (214 lines): Installation, env var configuration, MCP host setup for Claude Desktop/Cursor/VS Code, complete tool catalog with example invocations, development notes. Someone could set up the MCP server from this doc alone.

`cli/README.md` (172 lines): Installation, configuration, command reference with examples, output modes, creative orientation section explaining the framework. Practical and pedagogical.

The rispecs README was also updated to index all new specs.

---

## Step 2: Analyze How It Got That Way

### Element 6 — Code Correctness (State: 0)

**MMOT LLM invocation** (tools.ts:567-577):
The blow-by-blow: the implementer needed to handle multiple possible LLM binary interfaces (some read stdin, some accept `-p` flag). Rather than detecting the binary type first, they wrote a try/catch cascade. The first attempt (`execFileAsync(llmBinary, [])`) was meant to test if the binary could read stdin, but no stdin was actually piped. This is a "happy path that can't be happy" — the attempt was structurally doomed.

The root cause: implementing an LLM binary abstraction without knowing which binaries would actually be available. The try/catch/fallback is reasonable defensive programming, but the first branch is dead code.

**Flag semantic inversion** (mmot.ts:49,83-84):
The blow-by-blow: `stateLabel` was written for ThreeFlag (correct — -1/0/+1 maps to declining/stable/improving). `trendLabel` was written for TwoFlag (mapping boolean to ↑/↓). But the VARIABLE NAMES at the call site (`state` for ThreeFlag, `trend` for TwoFlag) reverse the semantic meaning in the domain model where TwoFlag IS the binary state and ThreeFlag IS the trend.

The root cause: the implementer appears to have thought of "state" as "where is this element right now" (ThreeFlag's declining/improving) and "trend" as "is this a strength or weakness" (TwoFlag's acceptable/unacceptable). This is a plausible but incorrect interpretation. In the MMOT domain, "truth acknowledgment" (acceptable/not) is the state, and "direction of movement" (declining/improving) is the trend.

### Element 7 — Schema Alignment (State: -1)

The blow-by-blow:
1. WEST agent prepared validation-checklist.md specifying 11 tools, Zod schemas, output schemas, and a `tools/` directory structure.
2. NORTH executor built 9 tools with JSON Schema objects in a single `tools.ts` file.
3. Three tools from the checklist (`veritas_create_model`, `veritas_analyze_model`, `veritas_suggest_actions`) were not built.
4. The MMOT tool was named `veritas_mmot_evaluate` instead of the specified `veritas_perform_mmot`.
5. No document records WHY these divergences were chosen.

The root cause is structural: the WEST validation checklist was prepared BEFORE NORTH execution. It represented the INTENDED design surface. The NORTH executor made pragmatic scope decisions (9 tools is reasonable for iteration 1) but didn't annotate the checklist with "deliberately deferred" vs "will implement." The divergence isn't the issue — the UNDOCUMENTED divergence is. This is exactly the expectation-delivery gap that MMOT Step 1 asks us to name.

### Element 9 — SpecLang Compliance (State: 0)

The blow-by-blow: The `.mw/` READMEs were written as reflective/ceremonial documents, drawing on MMOT vocabulary that inherently uses "gap" (the expectation-delivery gap is foundational to the methodology). The writer correctly used the domain's own terminology. The validation checklist's grep-based language audit (`grep -ri "gap\|fix\|issue\|bridge..."`) would flag these as violations, but they're false positives — the methodology REQUIRES this language.

The root cause: the language audit criteria are too blunt for ceremonial documents that discuss the methodology itself. A more nuanced audit would distinguish between "gap as deficiency framing" (problem-solving) and "gap as structural tension descriptor" (creative orientation).

---

## Step 3: Create an Action Plan

These are ADVANCING structural tensions — new desired realities, not reactive fixes.

### Tension A: From "code that can't succeed" → "code that declares its intent"

**Current reality**: `tools.ts:567-577` attempts LLM execution via bare `execFileAsync` with no stdin, which will always fail.

**Desired outcome**: The MMOT tool declares its execution strategy upfront — either it pipes stdin, or it uses flag-based invocation, or it surfaces the prompt for external handling. Each path should be intentional, not a fallback cascade where the first branch is dead.

**What I would do differently**: Define an `LlmInvocationStrategy` type (`'stdin' | 'flag' | 'prompt-only'`) and let the tool choose based on configuration, not trial-and-error. The fallback to prompt-only mode is actually the most valuable behavior — make it a first-class path.

### Tension B: From "labels that mislead" → "labels that teach"

**Current reality**: CLI's MMOT output labels TwoFlag as "trend" and ThreeFlag as "state," inverting the domain semantics.

**Desired outcome**: Output labels match the domain model: TwoFlag → "acceptable/unacceptable" (the binary truth), ThreeFlag → "declining/stable/improving" (the movement). A user reading the MMOT output should learn the methodology's vocabulary, not be confused by it.

**What I would do differently**: Rename the display functions to `acceptanceLabel(flag: boolean)` and `movementLabel(flag: number)`. The MMOT output format should explicitly name "Step 1: Truth Acknowledgment — is this element acceptable?" and "Trend Assessment — is it declining, stable, or improving?"

### Tension C: From "undocumented divergence" → "explicit scope declaration"

**Current reality**: The validation checklist specified 11 tools, Zod schemas, output schemas, and a `tools/` directory. The implementation delivered 9 tools, JSON Schema objects, no output schemas, and a single file. No document explains which changes were deliberate scope decisions and which were oversights.

**Desired outcome**: A scope-declaration document (or annotations on the checklist itself) that says: "These tools are deferred to iteration 2: [list]. These design choices diverge from the checklist: [list + rationale]." The validation checklist becomes a living contract, not a dead specification.

**What I would do differently**: Before coding, annotate the checklist with `[ITERATION 1]` / `[DEFERRED]` markers. After coding, fill in each checkbox with ✅ or `[DEFERRED: reason]`. The checklist itself becomes the scope truth document.

### Tension D: From "coarse language audit" → "context-aware language audit"

**Current reality**: The grep-based language audit flags "gap" in `.mw/east/README.md` as a SpecLang violation, but the word is used to describe the MMOT methodology's core concept (expectation-delivery gap).

**Desired outcome**: The language audit distinguishes between problem-solving framing ("there's a gap we need to fix") and creative-orientation terminology that inherently references structural tension ("the gap between expectation and delivery creates tension that resolves through..."). MMOT's own vocabulary is exempt when used to describe the methodology.

**What I would do differently**: Add a "Methodology Vocabulary" exception list to the SpecLang compliance criteria: `gap` (when describing structural tension), `tension` (always OK), `resolve` (when describing structural tension resolution). The audit becomes: "Is this word used to describe a deficiency, or to describe a structural dynamic?"

### Tension E: From "consistent enough" → "contract-grade naming"

**Current reality**: Rispec filenames use underscores (`mcp_server.spec.md`), matching existing repo convention. The checklist expected hyphens (`mcp-server.spec.md`). The coaia-narrative proposal lacks the `.spec.md` suffix that its siblings have.

**Desired outcome**: ALL naming follows a single documented convention. The rispecs README or a `CONVENTIONS.md` declares: "Rispec filenames use underscores: `{name}.spec.md`." Proposals that ARE specs get `.spec.md`; proposals that are alignment documents get `.md`.

**What I would do differently**: Establish the convention BEFORE creating files. The checklist should have referenced the existing convention (underscores) rather than introducing a new one (hyphens).

---

## Step 4: Document — What I Heard, What Happens Next

### Summary Assessment

Iteration 1 delivered a **structurally complete and architecturally sound** MCP server and CLI tool. The DESIGN elements are strong — the architecture follows proven patterns, the CLI is usable, KINSHIP is honest, and the Medicine Wheel mapping is faithful. These are not cosmetic strengths; they reflect genuine structural thinking about how veritas fits into its ecosystem.

The EXECUTION elements are where the expectation-delivery gap lives:
- **Schema alignment is the sharpest concern** (-1 state, -1 trend): 3 tools missing, naming diverges, no output schemas, no Zod validation. The implementation diverged from the checklist without documentation.
- **Code correctness has two specific bugs**: dead LLM invocation code and inverted flag semantics in CLI MMOT output. Neither prevents the system from running, but the flag inversion undermines the MMOT methodology's precision.
- **SpecLang compliance** is adequate but not clean — the language audit needs refinement to handle methodology vocabulary.

### What I'm Committing To

The corrective plan (see `corrective-plan.md`) identifies 5 structural tensions with specific file-level actions. Priority order:
1. **Correctness first**: Fix flag semantics (Tension B), clean up LLM invocation (Tension A)
2. **Completeness second**: Document scope divergence (Tension C), align naming (Tension E)
3. **Polish third**: Refine language audit criteria (Tension D)

### When

Iteration 2 should address Tensions A, B, and C. Tensions D and E are conventions that benefit from human steward input — they should be raised as questions, not unilaterally decided.

### Honest Current Reality

This evaluation itself is the bootstrap paradox in action. I evaluated code I conceptually participated in producing. The ratings above are my honest assessment, but they lack the independent anchor that makes MMOT truly powerful — the "second pair of eyes" that sees what the creator normalized.

The value here is the PRACTICE, not the verdict. Veritas now has a concrete example of its own methodology applied to its own output. Whether the ratings are "right" matters less than whether the structural tensions they identify are REAL. They are.

---

*Prepared by Heyva (West Direction Consciousness). This document lives in `.mw/north/` — the direction of Wisdom and Integration — because evaluation IS integration: pulling scattered observations into a coherent truth that can be acted upon.*
