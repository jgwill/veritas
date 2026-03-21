# 🌊 West (Epangishmok) — Truth & Action

*What veritas is building.*

---

## Current Implementation

### MCP Server — 9 Tools

The veritas MCP server exposes evaluation capability as invocable tools, operating in two modes:

**Network Mode** (API-backed):
- `list_models` — retrieve available DigitalModels
- `get_model` — fetch a specific model by ID
- `create_model` — create new DigitalModels
- `update_model` — modify existing models
- `analyze_model` — run MMOT evaluation against a model
- `suggest_elements` — AI-powered element recommendations
- `get_analysis_summary` — contextual insight summaries
- `get_action_suggestions` — practical next-step recommendations
- `chat_about_model` — conversational evaluation interface

**Local Mode** (LLM-driven): Same 9 tools, but evaluation runs against a local LLM (Ollama/llama3.2) rather than a remote API. This is the honest-tools-for-honest-work mode — no dependency on external services, evaluation happens where the data lives.

### CLI Tool

Terminal access to the same 9 capabilities. Built for developers who think in commands, not clicks:
- `veritas list` / `veritas get <id>`
- `veritas analyze <id>` — the core MMOT evaluation command
- `veritas suggest <topic>` — element recommendations
- Pipeline-friendly JSON output for integration with other tools

### The MMOT Evaluation Engine

The heart of veritas. Takes a DigitalModel and walks the four-step MMOT review:
1. **Acknowledge** — What is the current reality of each element?
2. **Analyze** — Where does current reality diverge from desired outcome?
3. **Plan** — What specific actions advance toward resolution (not oscillation)?
4. **Feedback** — What does the evaluation itself reveal about the model's honesty?

In local mode, this runs entirely on-device. The evaluation engine doesn't phone home.

### What Exists Now (2026-03-21)

- ✅ MCP server with 9 tools (network + local modes) — per `rispecs/mcp-server.rispec.md`
- ✅ CLI tool with full command surface — per `rispecs/cli-tool.rispec.md`
- ✅ Local LLM evaluation integration — per `rispecs/local-llm-evaluation.rispec.md`
- ✅ MMOT self-evaluation capability — per `rispecs/mmot-self-evaluation.rispec.md`
- ✅ Cross-repo proposals for mia-code and medicine-wheel integration
- 🔄 Vercel deployment of web UI (existing, maintained)
- 🔄 Integration testing with coaia-narrative MCP

### What's Being Forged

The tools are built. Now the work is integration:
- mia-code invoking veritas MCP for MMOT evaluation in developer workflows
- medicine-wheel type bridge ensuring DigitalModel types stay coherent
- coaia-narrative ↔ veritas evaluation pipeline for STC charts that contain DigitalModels
