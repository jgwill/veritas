# veritas CLI

> *Every model is a lens; every evaluation, a moment of truth.*

Terminal-native access to the **veritas TandT** framework — the same Performance Review and Decision Making capabilities the web application offers, living where your shell prompt lives.

## Installation

```bash
cd cli
npm install

# Link globally (optional)
npm link
```

## Configuration

### Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VERITAS_API_KEY` | **Yes** | — | Static UUID bearer token for API authentication |
| `VERITAS_API_URL` | No | `http://localhost:3123` | API base URL override |
| `VERITAS_ENV_FILE` | No | — | Explicit path to a `.env` file to load |

### Env File Resolution

The CLI automatically loads `VERITAS_*` variables from `.env` files in this order (first value found wins, already-set env vars always take precedence):

1. **`VERITAS_ENV_FILE`** — if set, load that file first
2. **`./.env`** — project-local env file
3. **`$HOME/.env`** — user-global env file

```bash
# Option A: export directly
export VERITAS_API_KEY="your-uuid-token-here"
export VERITAS_API_URL="https://veritas.sanctuaireagentique.com"

# Option B: put in .env (project or $HOME)
echo 'VERITAS_API_KEY="your-uuid-token-here"' >> .env

# Option C: point to a shared env file
export VERITAS_ENV_FILE="/path/to/shared/.env"
```

## Commands

### Models — CRUD Operations

```bash
# List all models
veritas models list
veritas models list --json            # Machine-readable

# Get model details
veritas models get <id>
veritas models get <id> --json

# Delete a model
veritas models delete <id>

# Export to JSON file
veritas models export <id>
veritas models export <id> --output my-model.json

# Import from JSON file
veritas models import ./my-model.json
```

### Generate — AI-Powered Model Creation

Create models using the veritas AI generation endpoint. The API analyses your topic and elements, building a complete DigitalModel with states and trends pre-evaluated.

```bash
veritas generate <topic> --elements "el1,el2,el3" [options]
```

**Options:**

| Flag | Default | Description |
|---|---|---|
| `--type <1\|2>` | `2` | 1 = Decision Making, 2 = Performance Review |
| `--description "..."` | — | Optional model description/notes |
| `--elements "a,b,c"` | — | **Required.** Comma-separated element names |
| `--json` | — | Machine-readable JSON output |

**Example — Performance Review in one command:**

```bash
veritas generate "Q1 Engineering Team Review" \
  --type 2 \
  --description "Quarterly performance assessment for platform team" \
  --elements "Code Quality,Sprint Velocity,Technical Debt,Team Collaboration,Documentation,On-Call Response,Architecture Decisions"
```

**Example — Decision Making model:**

```bash
veritas generate "Cloud Provider Selection" \
  --type 1 \
  --elements "Cost,Reliability,Ecosystem,Migration Effort,Compliance"
```

### MMOT — Managerial Moment of Truth Evaluation

Run a structured 4-phase evaluation against any Performance Review model (type 2):

1. **Acknowledge** — Truth statement: "Expected X, delivered Y"
2. **Analyze** — Element-by-element causal analysis + structural dynamics
3. **Plan** — Corrective action plan prioritised by urgency
4. **Feedback** — Decision: RECOMMIT / REDIRECT / PAUSE + rationale

```bash
veritas mmot evaluate <modelId> [options]
```

**Options:**

| Flag | Default | Description |
|---|---|---|
| `--source <api\|local>` | `api` | Where to read the model from |
| `--engine <gemini\|claude\|copilot>` | `gemini` | LLM engine for enhanced evaluation |
| `--model <name>` | — | LLM model name override |
| `--output-dir <path>` | `.mw/north/` | Directory for evaluation report output |
| `--phase <phase>` | `full` | Run specific phase: acknowledge, analyze, plan, feedback, or full |
| `--json` | — | Machine-readable JSON output |

**Example — Full MMOT evaluation:**

```bash
veritas mmot evaluate abc12345-def6-7890-ghij-klmnopqrstuv
```

**Example — Acknowledge phase only, JSON output:**

```bash
veritas mmot evaluate abc12345 --phase acknowledge --json
```

**Example — Custom output directory:**

```bash
veritas mmot evaluate abc12345 --output-dir ./reports/mmot/
```

### Schema — API Information

```bash
veritas schema              # Human-readable
veritas schema --json       # Machine-readable
```

## Output Modes

**Human mode** (default): Coloured output with tables, formatted summaries, and progress indicators.

**Machine mode** (`--json`): Pure JSON to stdout. Errors as JSON to stderr. Exit codes: `0` = success, `1` = error.

```bash
# Pipe model list into jq
veritas models list --json | jq '.[].name'

# Use in scripts
if veritas models get "$MODEL_ID" --json > /dev/null 2>&1; then
  echo "Model exists"
fi
```

## Running Without Global Install

```bash
# Via npm script
npm start -- models list

# Via npx
npx tsx src/index.ts models list
```

## Creative Orientation

The veritas CLI embodies the same **Twos and Threes** digital thinking framework that powers the web application:

- **Type 1 (Decision Making)**: Pairwise comparison of elements to surface a dominant choice. *The Two-flag asks: is this element stronger than that one?*
- **Type 2 (Performance Review)**: State + trend evaluation across elements. *The Three-flag captures trajectory (-1/0/+1); the Two-flag captures current strength (true/false).*
- **MMOT**: The Managerial Moment of Truth — a structured confrontation with reality that turns performance data into corrective action.

The CLI is the NORTH direction tool: it reaches outward from the veritas core into the systems that surround it — CI pipelines, agent workflows, terminal sessions — carrying the thinking framework wherever decisions need to be made.
