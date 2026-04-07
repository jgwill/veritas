# Veritas CLI Tool — RISE Specification

> Enables terminal-native model management and MMOT evaluation through a structured command interface.

**Version:** 0.1.0
**Document ID:** rispec-cli-tool-v1
**Last Updated:** 2026-03-21

---

## Desired Outcome

Users create **terminal workflows for digital thinking models** where:

- Models are listed, inspected, created, and exported without leaving the terminal
- MMOT evaluations run locally from the command line, producing structured feedback
- Human-readable output (chalk-formatted) and machine-readable output (`--json`) coexist
- Shell scripts and CI pipelines consume Veritas model data programmatically
- The CLI surface mirrors MCP tool capabilities — same actions, different interface

---

## Creative Intent

**What this enables users to create:** A command-line practice where digital thinking models live alongside code, documentation, and other terminal artifacts. A developer reviewing quarterly performance runs `veritas mmot evaluate` from the same terminal where they run tests. A script exports all models nightly. A CI step validates that a decision model has been evaluated before deployment proceeds.

**Structural Tension:** Between the Veritas web interface (rich but browser-bound) and terminal-centric development workflows. The CLI resolves this by providing the complete model lifecycle as composable shell commands, with output modes designed for both human reading and programmatic consumption.

---

## Data Model / Architecture

### Runtime & Dependencies

```typescript
interface VeritasCLI {
  binary: "veritas";                // Installed globally or via npx
  framework: "commander.js";        // Command parsing
  formatting: "chalk";              // Terminal colors and styling
  httpClient: "VeritasAPIClient";   // Shared API client (see api_client.spec.md)
  runtime: "node";                  // Node.js ≥ 18
}
```

### Command Tree

```
veritas
├── models
│   ├── list                        # List all models
│   ├── get <id>                    # Get model details
│   ├── delete <id>                 # Delete a model
│   ├── export <id> [--format]      # Export model to file
│   └── import <file>               # Import model from file
├── generate                        # Generate model from description
├── mmot
│   └── evaluate <id|file>          # Run MMOT evaluation
└── schema                          # Display type schemas
```

---

## Commands

### veritas models list

Lists all models for the authenticated user.

```bash
# Human output (default)
$ veritas models list
┌────────────────────────────────────────────────────────────┐
│ Models (3)                                                 │
├──────────┬──────────────────────────┬──────┬──────────────┤
│ ID       │ Name                     │ Type │ Updated      │
├──────────┼──────────────────────────┼──────┼──────────────┤
│ abc-1234 │ Q1 Engineering Review    │ PR   │ 2026-03-20   │
│ def-5678 │ Vendor Selection 2026    │ DM   │ 2026-03-18   │
│ ghi-9012 │ Team Health Assessment   │ PR   │ 2026-03-15   │
└──────────┴──────────────────────────┴──────┴──────────────┘

# Machine output
$ veritas models list --json
[
  {"id":"abc-1234","name":"Q1 Engineering Review","type":2,"updatedAt":"2026-03-20T..."},
  ...
]
```

**Options:**
- `--type <1|2>` — Filter by model type (1 = Decision Making, 2 = Performance Review)
- `--json` — Output as JSON array

### veritas models get

Retrieves and displays a complete model.

```bash
# Human output shows model structure
$ veritas models get abc-1234
╔══════════════════════════════════════════╗
║ Q1 Engineering Review                    ║
║ Type: Performance Review │ 5 elements    ║
╚══════════════════════════════════════════╝

  1. Code Quality
     State: ✅ Acceptable │ Trend: ⬆️ Improving
     Priority: success

  2. Sprint Velocity
     State: ❌ Unacceptable │ Trend: ⬇️ Declining
     Priority: critical

  3. Documentation Coverage
     State: ❌ Unacceptable │ Trend: ➡️ Stable
     Priority: warning
  ...

# Machine output
$ veritas models get abc-1234 --json
{ "Idug": "abc-1234", "ModelName": "Q1 Engineering Review", ... }
```

**Options:**
- `--json` — Output complete DigitalModel as JSON
- `--elements-only` — Output only the elements array

### veritas models delete

Permanently removes a model after confirmation.

```bash
$ veritas models delete abc-1234
⚠  Delete "Q1 Engineering Review"? This cannot be undone.
   Confirm with: veritas models delete abc-1234 --confirm

$ veritas models delete abc-1234 --confirm
✓ Model "Q1 Engineering Review" deleted.
```

**Options:**
- `--confirm` — Skip interactive confirmation (for scripts)
- `--json` — Output result as JSON

### veritas models export

Exports a model to a file.

```bash
$ veritas models export abc-1234
✓ Exported to q1-engineering-review.json

$ veritas models export abc-1234 --format csv --output ./exports/
✓ Exported to ./exports/q1-engineering-review.csv

# Pipe-friendly: output to stdout
$ veritas models export abc-1234 --stdout | jq '.Model | length'
5
```

**Options:**
- `--format <json|csv>` — Export format (default: json)
- `--output <dir>` — Output directory (default: current directory)
- `--stdout` — Write to stdout instead of file

### veritas models import

Imports a model from a JSON file.

```bash
$ veritas models import ./q1-engineering-review.json
✓ Imported "Q1 Engineering Review" (id: xyz-3456)

# Import from stdin
$ cat model.json | veritas models import --stdin
✓ Imported "Vendor Selection 2026" (id: xyz-7890)
```

**Options:**
- `--stdin` — Read model JSON from stdin
- `--json` — Output imported model summary as JSON

### veritas generate

Generates a new model from a topic description using AI.

```bash
$ veritas generate \
    --topic "Q2 Frontend Team Review" \
    --type 2 \
    --description "Evaluate React migration progress, testing practices, and delivery cadence"

⏳ Generating model...
✓ Created "Q2 Frontend Team Review" (id: new-1234)

  Elements generated:
  1. React Migration Progress
  2. Test Coverage & Quality
  3. Sprint Delivery Cadence
  4. Code Review Throughput
  5. Developer Experience

# With explicit elements
$ veritas generate \
    --topic "Hiring Decision: Senior Engineer" \
    --type 1 \
    --element "Technical Skills" \
    --element "Culture Fit" \
    --element "Growth Potential" \
    --element "Compensation Alignment"
```

**Options:**
- `--topic <string>` — Model topic (required)
- `--type <1|2>` — Model type (required)
- `--description <string>` — Additional context for generation
- `--element <string>` — Element name (repeatable, 2-20 times)
- `--json` — Output created model as JSON

### veritas mmot evaluate

Runs a Managerial Moment of Truth evaluation on a Performance Review model (type 2). This command operates locally — it invokes an LLM to assess the model's elements through the four-step MMOT cycle.

```bash
# Evaluate by model ID (fetches from API first)
$ veritas mmot evaluate abc-1234

⏳ Evaluating "Q1 Engineering Review" via MMOT...

╔══════════════════════════════════════════════════╗
║ MMOT Evaluation: Q1 Engineering Review           ║
╚══════════════════════════════════════════════════╝

📋 ACKNOWLEDGE (Current Reality)
   The team shows strength in code quality and collaboration
   but faces declining sprint velocity and stagnant documentation.

🔍 ANALYZE (Patterns)
   Two elements share an unacceptable state, with Sprint Velocity
   actively declining — this is the model's primary tension.
   Documentation is stable-but-unacceptable, indicating drift
   rather than active deterioration.

📐 PLAN (Advancing Actions)
   1. Sprint retrospective focused on velocity impediments
   2. Documentation sprint: dedicated capacity for 1 iteration
   3. Maintain current code review practices (sustaining success)

📝 DOCUMENT (Record)
   Evaluation recorded. Key tension: velocity decline concurrent
   with quality maintenance suggests capacity constraint, not
   skill constraint.

  Element Details:
  ┌────────────────────────┬───────┬──────────┬──────────┐
  │ Element                │ State │ Trend    │ Priority │
  ├────────────────────────┼───────┼──────────┼──────────┤
  │ Sprint Velocity        │ ❌    │ ⬇️ Down  │ 🔴 critical │
  │ Documentation Coverage │ ❌    │ ➡️ Stable │ 🟠 warning  │
  │ Team Collaboration     │ ✅    │ ➡️ Stable │ 🟢 success  │
  │ Code Quality           │ ✅    │ ⬆️ Up    │ 🟢 success  │
  └────────────────────────┴───────┴──────────┴──────────┘

# Evaluate from a local file (no API needed)
$ veritas mmot evaluate ./exported-model.json

# Machine output
$ veritas mmot evaluate abc-1234 --json
{ "model_id": "abc-1234", "steps": { ... }, "element_assessments": [...] }
```

**Options:**
- `<id|file>` — Model ID (fetched from API) or path to JSON file (local evaluation)
- `--focus <element-id>` — Focus evaluation on specific elements (repeatable)
- `--json` — Output evaluation as JSON

**Behavior when given a file path:** The CLI detects whether the argument is a file path (contains `/` or `.json`) or a model ID. File-based evaluation requires no API key — the model is read locally and evaluated locally.

### veritas schema

Displays the DigitalModel and DigitalElement type schemas.

```bash
$ veritas schema
DigitalModel {
  Idug: string              // Unique model identifier
  ModelName: string         // Display name
  DigitalThinkingModelType: number  // 1 = Decision, 2 = Performance
  DigitalTopic: string      // Subject/topic
  Model: DigitalElement[]   // Array of elements
  Decision: boolean         // Final decision (Type 1 only)
  Decided: boolean          // Has evaluation completed?
  ...
}

$ veritas schema --json
{ "DigitalModel": { ... }, "DigitalElement": { ... } }
```

**Options:**
- `--json` — Output as JSON Schema

---

## Output Modes

### Human Mode (default)

- Chalk-formatted colors: green for success, red for critical, yellow for warnings
- Box-drawing characters for tables and headers
- Unicode symbols: ✅ ❌ ⬆️ ⬇️ ➡️ 🔴 🟠 🟡 🟢
- Progress indicators: ⏳ for async operations
- Confirmation prompts for destructive actions

### Machine Mode (`--json`)

- Valid JSON to stdout
- No color codes, no decorations
- Errors output to stderr as JSON: `{"error": "message", "code": "ERROR_CODE"}`
- Exit codes: 0 = success, 1 = error, 2 = validation failure

---

## Environment Configuration

```bash
# Required for API operations
export VERITAS_API_KEY="your-uuid-token"

# Optional: override API URL (default: https://api.example.com)
export VERITAS_API_URL="https://custom-instance.example.com"
```

The CLI reads these at startup. Missing `VERITAS_API_KEY` produces a clear message for any command that requires network access. Local-only commands (`veritas mmot evaluate <file>`, `veritas schema`) function without any environment configuration.

---

## Error Handling

| Situation | Human Output | Machine Output | Exit Code |
|-----------|-------------|----------------|-----------|
| Missing API key | `✗ VERITAS_API_KEY not set. Export it to use API commands.` | `{"error":"VERITAS_API_KEY not set","code":"AUTH_MISSING"}` | 1 |
| Model not found | `✗ Model "xyz" not found.` | `{"error":"Model not found","code":"NOT_FOUND"}` | 1 |
| Network unreachable | `✗ Cannot reach Veritas API at https://...` | `{"error":"Network unreachable","code":"NETWORK_ERROR"}` | 1 |
| MMOT on type 1 | `✗ MMOT evaluation requires a Performance Review model (type 2).` | `{"error":"Type mismatch","code":"TYPE_MISMATCH"}` | 2 |
| Invalid JSON import | `✗ Invalid model file: missing required field "ModelName"` | `{"error":"Validation failed","code":"VALIDATION_ERROR","details":[...]}` | 2 |

---

## Dependencies

- **Runtime:** Node.js ≥ 18, `commander` (CLI framework), `chalk` (formatting), `ora` (spinners)
- **Types consumed:** `DigitalModel`, `DigitalElement`, `MMOTEvaluation` from veritas types
- **Kinship:**
  - → `mcp_server.spec.md` — Same capabilities exposed as MCP tools; CLI and MCP share the API client and MMOT evaluation logic
  - → `api_client.spec.md` — HTTP client for all network operations

---

## Advancing Patterns

- **Interactive Mode** — `veritas interactive` launches a REPL where users navigate models, run evaluations, and iterate conversationally without restarting the CLI
- **Watch Mode** — `veritas mmot evaluate --watch` re-evaluates when the source model file changes, enabling a feedback loop during model development
- **Pipeline Composition** — Enable `veritas models list --json | veritas mmot evaluate --stdin --batch` for evaluating multiple models in sequence
- **Shell Completions** — Generate bash/zsh/fish completions from the commander.js command tree for tab-completion of commands, model IDs, and options
- **Config File** — Support `~/.veritasrc` for persistent API key and URL configuration, reducing environment variable management
