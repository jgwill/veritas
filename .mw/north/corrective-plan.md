# Corrective Plan — Iteration 2 Structural Tensions

**Source**: session-mmot-evaluation.md (Heyva, 2026-03-21)
**Orientation**: Each correction creates NEW structural tension (desired future state), not a reactive fix
**Priority**: Correctness → Completeness → Polish

---

## Tension A: LLM Invocation Strategy

### Current Reality → Desired Outcome

**Current**: `mcp/src/tools.ts:567-577` runs `execFileAsync(llmBinary, [])` with no stdin pipe — a call that will always fail, followed by a catch that tries `-p` flag, followed by a catch that falls back to prompt-only mode.

**Desired**: The MMOT tool declares its execution strategy upfront. Each invocation path (stdin pipe, CLI flag, prompt-only) is an intentional choice, not a cascade of failures. The prompt-only path — which is actually the most immediately useful behavior — is a first-class citizen.

### Resolution Action

**File**: `mcp/src/tools.ts`
**Lines**: 563-609
**Change**: Replace the try/catch/try/catch cascade with an explicit strategy pattern:

```typescript
// Determine invocation strategy from configuration
type LlmStrategy = 'stdin' | 'flag' | 'prompt-only';

function detectLlmStrategy(binary: string): LlmStrategy {
  // If no binary specified or binary is 'prompt-only', skip LLM
  if (!binary || binary === 'prompt-only') return 'prompt-only';
  // Default to flag-based invocation (most common CLI pattern)
  return 'flag';
}
```

Then execute ONLY the chosen strategy, with prompt-only as the graceful fallback if the chosen strategy fails:

```typescript
const strategy = detectLlmStrategy(llmBinary);

if (strategy === 'prompt-only') {
  // Write prompt for manual evaluation — this IS a valid outcome
  // ...existing prompt-file code...
}

if (strategy === 'flag') {
  try {
    const { stdout } = await execFileAsync(llmBinary, ["-p", prompt], { ... });
    evaluation = stdout;
  } catch {
    // Fall back to prompt-only — document why
    // ...prompt-file code with "LLM binary failed, prompt saved" message...
  }
}
```

**Agent Assignment**: Facet 01 (MCP/CLI) correction agent
**Priority**: 1 (Correctness)

---

## Tension B: Flag Semantic Labels

### Current Reality → Desired Outcome

**Current**: `cli/src/commands/mmot.ts` lines 43-50, 83-84 — `stateLabel()` maps ThreeFlag and `trendLabel()` maps TwoFlag, but the variable names at the call site (`state` for ThreeFlag, `trend` for TwoFlag) invert the MMOT domain semantics where TwoFlag IS the binary state (acceptable/unacceptable) and ThreeFlag IS the trend (declining/stable/improving).

**Desired**: Output labels match the domain model. A user reading MMOT output learns the methodology's vocabulary correctly. The binary truth acknowledgment (TwoFlag) is labeled as acceptance, not trend. The directional movement (ThreeFlag) is labeled as trend, not state.

### Resolution Action

**File**: `cli/src/commands/mmot.ts`
**Lines**: 43-50

**Change**: Rename functions to match domain semantics:

```typescript
function acceptanceLabel(flag: boolean): string {
  return flag ? 'acceptable ✓' : 'unacceptable ✗';
}

function trendLabel(flag: number): string {
  if (flag > 0) return 'improving ↑';
  if (flag < 0) return 'declining ↓';
  return 'stable →';
}
```

**Lines**: 83-84

**Change**: Align variable names to domain:

```typescript
const acceptance = acceptanceLabel(el.TwoFlag);
const trend = trendLabel(el.ThreeFlag ?? 0);
```

Update all format strings that reference these variables to use the new names.

**Agent Assignment**: Facet 01 (MCP/CLI) correction agent
**Priority**: 1 (Correctness)

---

## Tension C: Scope Declaration

### Current Reality → Desired Outcome

**Current**: The validation checklist (`.pde/validation-checklist.md`) specified 11 tools, Zod schemas, output schemas, and a `tools/` directory. The implementation delivered 9 tools, JSON Schema objects, no output schemas, and a single file. No document records which divergences were deliberate scope decisions vs. oversights.

Specific undocumented divergences:
- `veritas_create_model` — not implemented (generate_model covers AI-powered creation; simple CRUD create may not exist in the API)
- `veritas_analyze_model` — not implemented
- `veritas_suggest_actions` — not implemented
- `veritas_perform_mmot` → named `veritas_mmot_evaluate`
- Zod schemas → JSON Schema objects
- `mcp/src/tools/` directory → single `mcp/src/tools.ts`
- Output schemas → not implemented

**Desired**: The validation checklist itself becomes the scope truth document. Each item is annotated with its iteration 1 status: ✅ implemented, 🔜 deferred (with reason), or ↔ diverged (with rationale).

### Resolution Action

**File**: `.pde/validation-checklist.md`
**Lines**: 25-62

**Change**: Annotate each checkbox with its actual status. Examples:

```markdown
- [x] `veritas_list_models` tool registered ~~with Zod schema~~ with JSON Schema object
- [ ] `veritas_create_model` 🔜 DEFERRED: API uses generate endpoint (Gemini-powered), no simple CRUD create. Evaluate whether a non-AI create is needed.
- [ ] `veritas_analyze_model` 🔜 DEFERRED: Analysis currently handled by mmot_evaluate. Separate analysis tool is iteration 2 scope.
- [ ] `veritas_suggest_actions` 🔜 DEFERRED: Action suggestions require deeper integration with the MMOT four-step process.
- [x] `veritas_perform_mmot` ↔ DIVERGED: Named `veritas_mmot_evaluate` — "evaluate" is more precise than "perform" for what the tool does.
```

**Agent Assignment**: Facet 05 (MMOT Self-Eval) correction agent — this is meta-documentation, not code
**Priority**: 2 (Completeness)

---

## Tension D: Context-Aware Language Audit

### Current Reality → Desired Outcome

**Current**: The validation checklist's language audit (lines 241-250) uses grep to flag words like "gap", "bridge", "fix", "issue", "solve" across all prose files. This catches false positives in `.mw/` READMEs where MMOT methodology vocabulary inherently uses "gap" (the expectation-delivery gap is the core concept).

**Desired**: The audit criteria distinguish between problem-solving framing and creative-orientation use of methodology terminology. MMOT's own vocabulary is recognized as domain language, not deficiency framing.

### Resolution Action

**File**: `.pde/validation-checklist.md`
**Lines**: 94-101 (Creative Orientation — Language Audit section)

**Change**: Add methodology vocabulary exceptions:

```markdown
### Creative Orientation — Language Audit

**Methodology Vocabulary Exceptions:**
The following words are acceptable when used to describe structural tension dynamics (MMOT methodology), NOT when used as deficiency framing:
- "gap" — acceptable: "expectation-delivery gap creates tension"; NOT acceptable: "there are gaps in coverage"
- "bridge" — acceptable: "type bridge between DigitalModel and STC"; NOT acceptable: "bridge the gap"
- "resolve" — acceptable: "structural tension resolves through creation"; NOT acceptable: "resolve the issue"

**Audit Rule:** Flag the word, then check context. If the sentence describes a structural dynamic, it's creative orientation. If the sentence describes a deficiency to be eliminated, it's problem-solving.
```

**Agent Assignment**: Facet 02 (Rispecs) correction agent — this is specification language
**Priority**: 3 (Polish)

---

## Tension E: Naming Convention Alignment

### Current Reality → Desired Outcome

**Current**: Two naming inconsistencies:
1. Rispec filenames use underscores (`mcp_server.spec.md`) — consistent with existing repo convention. The validation checklist expected hyphens (`mcp-server.spec.md`). The existing repo convention (underscores) is correct; the checklist was wrong.
2. `proposals/coaia-narrative-alignment.md` lacks the `.spec.md` suffix that its siblings have (`mia-code-mmot-integration.spec.md`, `medicine-wheel-veritas-bridge.spec.md`).

**Desired**: A declared convention and consistent application. The coaia-narrative proposal either gets `.spec.md` if it IS a spec, or a note explains why it's `.md` (it's an alignment analysis, not a specification).

### Resolution Actions

**File**: `proposals/coaia-narrative-alignment.md`
**Action**: Rename to `proposals/coaia-narrative-alignment.spec.md` if the content is a specification (it contains type mappings, integration phases, and schema proposals — it IS a spec). OR add a note to the proposals README explaining the distinction.

**File**: `.pde/validation-checklist.md`
**Lines**: 80-83
**Action**: Update expected filenames to match existing convention (underscores):
```markdown
- [ ] `rispecs/mcp_server.spec.md` exists
- [ ] `rispecs/cli_tool.spec.md` exists
- [ ] `rispecs/mmot_generation.spec.md` exists
- [ ] `rispecs/api_client.spec.md` exists
```

**Agent Assignment**: 
- Proposal rename → Facet 04 (Integration) correction agent
- Checklist update → Facet 05 (MMOT Self-Eval) correction agent
**Priority**: 3 (Polish)

---

## Priority Summary

| Priority | Tension | Agent | Files | Nature |
|----------|---------|-------|-------|--------|
| 1 | B — Flag Semantics | Facet 01 | `cli/src/commands/mmot.ts` | Correctness: labels mislead users |
| 1 | A — LLM Invocation | Facet 01 | `mcp/src/tools.ts` | Correctness: dead code on every run |
| 2 | C — Scope Declaration | Facet 05 | `.pde/validation-checklist.md` | Completeness: undocumented divergence |
| 3 | D — Language Audit | Facet 02 | `.pde/validation-checklist.md` | Polish: false positive audit criteria |
| 3 | E — Naming Convention | Facet 04 + 05 | `proposals/`, `.pde/validation-checklist.md` | Polish: inconsistent naming |

---

## What This Plan Does NOT Cover

- **Adding the 3 missing tools** (`create_model`, `analyze_model`, `suggest_actions`): This requires a design decision — are these genuinely needed, or does the current 9-tool surface suffice? This is a HUMAN decision, not a correction agent's scope.
- **Adding Zod schemas**: The JSON Schema approach works. Migrating to Zod would add runtime validation, which is valuable but is a feature decision, not a correctness fix.
- **Adding output schemas**: Same — valuable for client-side type safety but requires a design session to define return types for all 9 tools.
- **External KINSHIP updates**: The ceremony KINSHIP.md at openclaw workspace may not be accessible from this workspace. This is an environmental constraint flagged in the validation checklist.

These are tensions to HOLD, not tensions to resolve in iteration 2. They become the structural tension for iteration 3 — or they become conscious decisions to NOT pursue. Either is honest.

---

*Corrections create NEW structural tension. The desired outcomes above are not "fixes" — they are the next thing that wants to be created. The current reality is what it is. The movement between current and desired is the work.*
