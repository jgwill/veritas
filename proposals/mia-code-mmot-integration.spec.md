# mia-code MMOT Integration — `miaco mmot evaluate` Command

**Version:** 0.1.0  
**Date:** 2026-03-21  
**Direction:** SOUTH — Cross-repo integration research  
**Author:** SOUTH deep-search agent  
**Package:** miaco (within mia-code)

---

## Creative Intent

> Give miaco its **west leg** — an MMOT evaluation command that completes the Four Directions compass of engineering capabilities: east=decompose (vision), south=stc/chart (analysis), **west=mmot (reflection/validation)**, north=reflection (wisdom/action). This command wraps veritas' evaluation logic via a local LLM call, following decompose.ts's multi-engine pattern.

## Structural Tension

**Current Reality:**
- miaco has three cardinal capabilities: `decompose` (EAST — vision/PDE), `stc` (SOUTH — analysis/JSONL), `chart` (SOUTH — structural tension lifecycle)
- `chart review` exists as a lightweight "Creator Moment of Truth" but lacks formal MMOT evaluation (no phases, no Elements of Performance, no autonomous loop)
- decompose.ts establishes a proven multi-engine pattern (Gemini/Claude/Copilot) for spawning local LLM evaluation
- No `miaco mmot` command exists
- veritas' MMOT evaluation logic exists as a web app concept but not as a CLI/library
- coaia-narrative's `perform_mmot_evaluation` is MCP-only (not CLI-invocable from miaco)

**Desired Outcome:**
- `miaco mmot evaluate` spawns a local LLM to perform 4-phase MMOT evaluation on an STC chart
- The command follows decompose.ts's engine abstraction (same `--engine`, `--model` flags)
- Output is stored as `.mmot/{uuid}.json` + `.mmot/{uuid}.md` (parallel to `.pde/` pattern)
- Narrative beats are emitted for coaia-narrative consumption
- This gives miaco the complete Four Directions engineering toolkit

---

## Command Interface

### Primary Command

```bash
# Evaluate a chart by ID
miaco mmot evaluate --chart <chart-id> [options]

# Evaluate from STC JSONL file
miaco mmot evaluate --stc <path-to-jsonl> [options]

# Evaluate the most recent chart
miaco mmot evaluate --latest [options]
```

### Options (following decompose.ts pattern)

```bash
Options:
  -c, --chart <id>        Chart ID to evaluate
  -s, --stc <path>        STC JSONL file path
  -l, --latest            Evaluate most recent chart
  -e, --engine <engine>   LLM engine: gemini|claude|copilot (default: gemini)
  -m, --model <model>     Model override (e.g., gemini-2.0-flash)
  -d, --direction <dir>   Perspective: south|east|west|north (default: all four)
  -p, --phase <phase>     Run specific phase: acknowledge|analyze|update|recommit
      --all-phases        Run complete 4-phase cycle (default)
      --auto-update       Allow chart reality updates (requires --yolo or confirmation)
  -w, --workdir <path>    Working directory (default: cwd)
  -j, --json              Output as JSON
  -o, --output <path>     Custom output path
      --session <id>      Link to existing session
```

### Subcommands

```bash
miaco mmot list                    # List stored MMOT evaluations
miaco mmot get <id>                # Retrieve specific evaluation
miaco mmot history --chart <id>    # Show evaluation history for a chart
```

---

## LLM Engine Pattern (following decompose.ts)

### System Prompt Construction

```typescript
function buildMmotSystemPrompt(chart: Chart, phase?: MmotPhase): string {
  return `You are performing a Managerial Moment of Truth (MMOT) evaluation.

## Context
You are evaluating a Structural Tension Chart:
- Desired Outcome: ${chart.outcome}
- Current Reality: ${chart.reality}
- Action Steps: ${chart.steps.length} (${completedCount} completed, ${pendingCount} pending)
- Phase: ${chart.phase || 'all four phases'}

## Elements of Performance
For each action step, assess:
- DESIGN: "Was this architected with the right structural intent?"
- EXECUTION: "Was this implemented adequately and with high quality?"

## MMOT Four-Phase Protocol
${phase ? buildSinglePhasePrompt(phase) : buildAllPhasesPrompt()}

## Four Directions Perspective
- South (Mia): Structural/Architectural — DESIGN integrity
- East (Miette): Narrative/Emergence — EXECUTION resonance
- West (Heyva): Embodied/Reciprocal — EXECUTION implementation
- North (Echo Weaver): Wisdom/Synthesis — DESIGN pattern reflection

## Output Format
Return ONLY valid JSON matching this schema:
${JSON.stringify(MmotEvaluationSchema, null, 2)}`;
}
```

### Engine Spawning (mirror of decompose.ts)

```typescript
async function runMmotEvaluation(
  chart: Chart,
  options: MmotOptions
): Promise<MmotEvaluationResult> {
  const engine = options.engine || 'gemini';
  const model = options.model || getDefaultModel(engine);
  const systemPrompt = buildMmotSystemPrompt(chart, options.phase);
  
  // Build engine-specific CLI args (same pattern as decompose.ts)
  const args = buildEngineArgs(engine, {
    model,
    prompt: systemPrompt,
    outputFormat: 'json'
  });
  
  // Spawn child process (same as decompose.ts)
  const { stdout, stderr } = await spawnEngine(engine, args);
  
  // Parse and validate response
  const raw = extractJsonFromOutput(engine, stdout);
  const result = MmotEvaluationSchema.parse(raw);
  
  return result;
}
```

### Engine Argument Builders (from decompose.ts)

| Engine | Binary | Args Pattern |
|--------|--------|-------------|
| **Gemini** | `gemini` | `-m <model> -p "<prompt>"` |
| **Claude** | `claude` | `--print --output-format json -p "<prompt>"` |
| **Copilot** | `copilot-cli` | `-p "<prompt>" --allow-all-tools` |

---

## Data Model

### MmotEvaluationResult

```typescript
interface MmotEvaluationResult {
  id: string;                          // UUID
  chartId: string;                     // Evaluated chart
  timestamp: string;                   // ISO 8601
  engine: 'gemini' | 'claude' | 'copilot';
  model: string;                       // Specific model used
  
  // Four-phase evaluation
  phases: {
    acknowledge: {
      truthStatement: string;          // "Expected X, delivered Y"
      elementsOfPerformance: Array<{
        stepId: string;
        stepTitle: string;
        design: 'met' | 'partially_met' | 'not_met';
        execution: 'met' | 'partially_met' | 'not_met';
        evidence: string;
      }>;
      affirmativeYes: boolean;         // Has evaluator reached shared truth?
    };
    
    analyze: {
      blowByBlow: string;             // Detailed causal analysis
      structuralDynamics: string[];    // Patterns that produced the result
      oscillationDetected: boolean;    // Fritz's oscillating pattern flag
    };
    
    update: {
      realityUpdates: string[];        // New observations for current_reality
      correctiveActions: Array<{
        title: string;
        reality: string;
        priority: 'critical' | 'important' | 'standard';
      }>;
      chartPhaseAdvancement: boolean;  // Should phase advance?
    };
    
    recommit: {
      decision: 'recommit' | 'redirect' | 'pause';
      rationale: string;
      updatedOutcome?: string;         // If redirecting
      nextReviewDate?: string;
    };
  };
  
  // Four Directions perspectives
  directions: {
    south?: { perspective: string; designScore: number };   // Mia — structure
    east?: { perspective: string; executionScore: number };  // Miette — narrative
    west?: { perspective: string; executionScore: number };  // Heyva — embodied
    north?: { perspective: string; designScore: number };    // Echo Weaver — wisdom
  };
  
  // Veritas-compatible output (for bridge)
  veritasSummary?: {
    tierDistribution: Record<'A' | 'B' | 'C' | 'D' | 'E', number>;
    overallHealth: 'critical' | 'needs_attention' | 'healthy' | 'thriving';
  };
}
```

---

## Storage Pattern (parallel to .pde/)

```
.mmot/
├── {uuid}.json          # Full MmotEvaluationResult
├── {uuid}.md            # Human-readable Markdown report
└── history.jsonl        # Append-only evaluation log (one line per evaluation)
```

### Markdown Report Format

```markdown
# MMOT Evaluation — {chart.outcome}
**Date:** {timestamp} | **Engine:** {engine}/{model} | **Chart:** {chartId}

## 🔴 Phase 1: Acknowledge the Truth
{phases.acknowledge.truthStatement}

### Elements of Performance
| Step | DESIGN | EXECUTION | Evidence |
|------|--------|-----------|----------|
| ... | met/not_met | met/not_met | ... |

**Affirmative Yes:** {yes/no}

## 🟠 Phase 2: Analyze How It Got There
{phases.analyze.blowByBlow}

**Oscillation Detected:** {yes/no}
**Structural Dynamics:** {list}

## 🟡 Phase 3: Update the Chart
**Reality Updates:** {list}
**Corrective Actions:** {list with priority}

## 🟢 Phase 4: Recommit or Redirect
**Decision:** {recommit/redirect/pause}
**Rationale:** {phases.recommit.rationale}

---

## Four Directions Perspectives
### 🔥 South (Mia) — Structure
{directions.south.perspective}

### 🌅 East (Miette) — Narrative
{directions.east.perspective}

### 🌊 West (Heyva) — Embodied
{directions.west.perspective}

### ❄️ North (Echo Weaver) — Wisdom
{directions.north.perspective}
```

---

## How This Completes the Four Directions

miaco's engineering toolkit maps to the Medicine Wheel:

| Direction | Command | Function | Creative Orientation |
|-----------|---------|----------|---------------------|
| **EAST 🌅** | `miaco decompose` | Prompt Decomposition (PDE) | "What is being asked?" — Vision |
| **SOUTH 🔥** | `miaco stc` + `miaco chart` | STC JSONL + Chart lifecycle | "What needs to be learned?" — Analysis |
| **WEST 🌊** | **`miaco mmot evaluate`** (NEW) | MMOT truth evaluation | "What needs reflection?" — Validation |
| **NORTH ❄️** | (future: `miaco reflect`) | Wisdom synthesis + cycle completion | "What executes the cycle?" — Action |

### The West→North Leg

The MMOT evaluation creates the **west→north transition** by:

1. **West (Reflection):** `miaco mmot evaluate` examines what was created honestly, using Elements of Performance (DESIGN/EXECUTION) as mirrors
2. **North (Wisdom):** The `recommit` phase of MMOT IS the north moment — the fundamental choice about whether to continue the cycle, redirect, or rest
3. **Cycle Completion:** After MMOT evaluation, the chart is updated with new reality, corrective actions are added, and the structural tension is re-established for the next cycle

Without the west leg, miaco can decompose (east) and chart (south), but cannot honestly assess whether what was built matches what was intended. The MMOT command closes this gap.

---

## MCP Server Integration

Following mcp.rispecs.md patterns, add to miaco-server.ts:

```typescript
// New MCP tools for MMOT
const MMOT_TOOLS = [
  {
    name: 'miaco_mmot_evaluate',
    description: 'Perform MMOT 4-phase evaluation on a structural tension chart',
    inputSchema: {
      type: 'object',
      properties: {
        chart: { type: 'string', description: 'Chart ID to evaluate' },
        stc: { type: 'string', description: 'Path to STC JSONL file' },
        engine: { type: 'string', enum: ['gemini', 'claude', 'copilot'] },
        direction: { type: 'string', enum: ['south', 'east', 'west', 'north', 'all'] },
        phase: { type: 'string', enum: ['acknowledge', 'analyze', 'update', 'recommit', 'all'] },
      },
      oneOf: [
        { required: ['chart'] },
        { required: ['stc'] }
      ]
    }
  },
  {
    name: 'miaco_mmot_list',
    description: 'List stored MMOT evaluations',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'miaco_mmot_get',
    description: 'Retrieve a specific MMOT evaluation',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    }
  }
];
```

---

## Implementation Phases

### Phase 1: Core Command (miaco mmot evaluate)
- **File:** `miaco/src/commands/mmot.ts` (new)
- **Dependencies:** Chart storage from chart.ts, engine spawning from decompose.ts
- **Scope:** Single-engine evaluation, JSON output, .mmot/ storage
- **Test:** Evaluate sample chart, verify 4-phase output

### Phase 2: Multi-Direction Evaluation
- Run evaluation from all four directional perspectives
- Aggregate scores across directions
- Generate combined Markdown report

### Phase 3: Auto-Update Integration
- `--auto-update` flag writes corrective actions back to chart
- Adds new action_step entities via chart.ts add-step
- Updates current_reality observations
- Emits narrative beat for coaia-narrative

### Phase 4: Veritas Bridge
- Import veritas adapter (from coaia-narrative-alignment proposal)
- Generate `veritasSummary` with tier distribution
- Enable `--veritas-format` flag for veritas-compatible output

### Phase 5: MCP Exposure
- Add MMOT tools to miaco-server.ts
- Register in tool catalog
- Update mcp config generator

---

## Quality Criteria

- ✅ Follows decompose.ts engine abstraction (no new engine patterns)
- ✅ Follows .pde/ storage pattern (.mmot/ parallel structure)
- ✅ All four MMOT phases implemented (no shortcuts)
- ✅ Elements of Performance (DESIGN/EXECUTION) evaluated per action step
- ✅ Four Directions perspectives available
- ✅ MCP-exposable via existing server architecture
- ✅ Output compatible with coaia-narrative narrative beats
- ✅ Veritas tier summary available for bridge integration
- ✅ Completes miaco's Four Directions engineering compass

---

## Dependencies

- `miaco/src/decompose.ts` — Engine abstraction and spawning
- `miaco/src/commands/chart.ts` — Chart data model and SessionStorage
- `miaco/src/commands/stc.ts` — JSONL validation patterns
- `coaia-narrative` — perform_mmot_evaluation spec (reference implementation)
- `veritas` — DigitalModel type 2 tier system (optional bridge)
- `medicine-wheel-ontology-core` — Four Directions types (optional)
