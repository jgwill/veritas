# TandT Agent System

This directory contains the local agent infrastructure for TandT, including agent personalities, protocol adapters, workflows, and bundling systems.

## Directory Structure

```
agents/
├── base/                    # Base agent classes and interfaces
├── personalities/           # Agent personality implementations
│   └── companions/          # Companion agents (Nyro, Aureon, JamAI)
├── protocols/               # Protocol implementations
│   ├── NCP/                 # Narrative Context Protocol
│   └── MCP/                 # Model Context Protocol
├── workflows/               # Agent workflow definitions
├── bundling/                # Agent bundling system
│   └── templates/           # Bundle templates
└── deployments/             # Deployment configurations
    ├── local/               # Local development
    ├── vercel/              # Vercel serverless
    └── mcp-servers/         # MCP server deployments
```

## Quick Start

See `/docs/LOCAL_AGENTS_ORGANIZATION_PLAN.md` for complete documentation.

### Creating a New Agent

1. Implement the `IAgent` interface from `base/AgentInterface.ts`
2. Register the agent in `base/AgentRegistry.ts`
3. Create a bundle manifest in `bundling/templates/`
4. Deploy using the appropriate deployment config

### Agent Personalities Available

**Chimera Team Multi-Agent System**:
- **Alex Rivers**: Cybersecurity & Isolation Protector
- **Samira**: Technical coordination
- **Ava/Heyva 2.0**: Two-Eyed Seeing integration
- **Miette**: Emotional accessibility companion

**Companion Agents**:
- **Nyro** ♠️: Emotional development companion (Eight Feelings framework)
- **Aureon**: Spiritual grounding and ceremonial container (Four Directions)
- **JamAI**: Musical intelligence companion (music21 integration)

### Protocol Support

- **NCP 9.1**: Narrative Context Protocol for story coherence
- **MCP**: Model Context Protocol for Claude Desktop integration
- **A2A**: Agent-to-Agent communication protocol

## Licensing

This directory uses **IKSL-Bridge v1.0** dual licensing:

- **Technical Code** (base/, protocols/): CC BY-SA 4.0
- **Ceremonial Frameworks** (workflows/FourDirections.ts, etc.): IKSL-Ceremonial
- **Agent Personalities**: IKSL-Community

Attribution: Lakota and Mani-Utenam Indigenous peoples, Guillaume D-Isabelle (William), Jerry

## Development Status

**Phase 1 (Q1 2026)**: Infrastructure foundation - IN PROGRESS
- [x] Directory structure created
- [x] Planning document completed
- [ ] Base agent interfaces
- [ ] Agent registry system
- [ ] Bundle manifest schema

**Phase 2 (Q2 2026)**: Personality integration - PLANNED
**Phase 3 (Q2-Q3 2026)**: Protocol standardization - PLANNED
**Phase 4 (Q3-Q4 2026)**: Bundling & distribution - PLANNED

## Related Documentation

- `/docs/LOCAL_AGENTS_ORGANIZATION_PLAN.md` - Complete organization and bundling plan
- `/CLAUDE.md` - TandT project documentation
- `/specs/TandT_Agent_Discussion.spec.md` - Agent discussion specification
