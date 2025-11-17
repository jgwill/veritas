# Local Agents Organization & Bundling Plan

**Repository**: TandT (Twos and Threes Digital Thinking Guidance)
**Date**: 2025-11-17
**Status**: Planning Phase
**Related Context**: Anthropic Partnership Proposal - AI Studio Scaffolding Prototypes

---

## Executive Summary

This document outlines the strategy for organizing local agent development infrastructure within the TandT repository and establishing patterns for future agent bundling and deployment. The plan aligns with the broader portfolio of agent systems described in the Anthropic partnership inquiry while maintaining TandT's core focus on decision-making and performance review models.

---

## Current State Analysis

### Existing Agent Infrastructure in TandT

**Current AI Integration** (`services/geminiService.ts`):
- Google Gemini API integration for AI-powered features
- Model generation from natural language descriptions
- Element suggestions by topic
- Analysis summaries and action suggestions
- Chat session management for conversational analysis

**Agent-Like Components**:
1. **ConversationalAnalyst** (`components/ConversationalAnalyst.tsx`)
   - Chat-based AI analyst for model analysis
   - Context-aware conversation about current models
   - Real-time Q&A about dominance factors and performance issues

2. **GeminiAssistant** (inferred from service layer)
   - Element suggestion workflows
   - Summary generation
   - Action recommendation engine

**Data Architecture**:
- Zustand store for state management
- localStorage persistence
- Model versioning with history tracking
- TypeScript type system for data integrity

**MCP Integration Ready**:
- Package.json already includes `@modelcontextprotocol/sdk: "latest"`
- Infrastructure prepared for MCP server extensions

---

## Strategic Vision: Agent Organization Framework

### Phase 1: Local Agent Infrastructure (Q1 2026)

**Objective**: Establish standardized patterns for agent development, deployment, and bundling within TandT ecosystem.

#### 1.1 Directory Structure for Agent Development

```
/home/user/TandT/
├── agents/                          # Core agent system directory
│   ├── README.md                    # Agent development guide
│   ├── base/                        # Base agent classes and interfaces
│   │   ├── AgentInterface.ts        # Common agent interface
│   │   ├── BaseAgent.ts             # Abstract base agent class
│   │   ├── AgentCapabilities.ts     # Capability definitions
│   │   └── AgentRegistry.ts         # Agent discovery and registration
│   │
│   ├── personalities/               # Agent personality configurations
│   │   ├── DecisionAnalyst.ts       # Decision-making specialist
│   │   ├── PerformanceCoach.ts      # Performance review specialist
│   │   ├── ChimeraTeam.ts           # Multi-agent orchestration (Samira, Alex, etc.)
│   │   └── companions/              # Companion agents
│   │       ├── Nyro.ts              # Emotional development companion
│   │       ├── Aureon.ts            # Spiritual grounding agent
│   │       └── JamAI.ts             # Musical intelligence companion
│   │
│   ├── protocols/                   # Protocol implementations
│   │   ├── NCP/                     # Narrative Context Protocol
│   │   │   ├── NCPAdapter.ts        # NCP 9.1 implementation
│   │   │   ├── NCPSchema.ts         # Schema definitions
│   │   │   └── NCPValidator.ts      # Validation logic
│   │   │
│   │   └── MCP/                     # Model Context Protocol
│   │       ├── MCPServer.ts         # MCP server implementation
│   │       ├── MCPTools.ts          # Tool definitions for MCP
│   │       └── MCPResources.ts      # Resource providers
│   │
│   ├── workflows/                   # Agent workflow definitions
│   │   ├── TwoFlagAnalysis.ts       # Decision-making workflow
│   │   ├── PerformanceDashboard.ts  # Performance review workflow
│   │   ├── FourDirections.ts        # Four Directions ceremonial workflow
│   │   └── SpiralMemory.ts          # Spiral memory organization
│   │
│   ├── bundling/                    # Agent bundling system
│   │   ├── BundleBuilder.ts         # Bundle creation utilities
│   │   ├── BundleManifest.ts        # Manifest schema and validation
│   │   ├── BundleRegistry.ts        # Bundle versioning and registry
│   │   └── templates/               # Bundle templates
│   │       ├── minimal-agent.json
│   │       ├── companion-agent.json
│   │       └── multi-agent-team.json
│   │
│   └── deployments/                 # Deployment configurations
│       ├── local/                   # Local development configs
│       ├── vercel/                  # Vercel deployment configs
│       └── mcp-servers/             # MCP server deployments
│
├── services/                        # Existing services (enhanced)
│   ├── geminiService.ts             # Enhanced with agent orchestration
│   ├── modelService.ts              # Existing model CRUD
│   └── agentService.ts              # NEW: Agent lifecycle management
│
└── types/                           # Type definitions (new structure)
    ├── agents.ts                    # Agent type definitions
    ├── protocols.ts                 # NCP/MCP protocol types
    └── bundles.ts                   # Bundle and manifest types
```

#### 1.2 Agent Interface Specification

**Core Agent Interface** (`agents/base/AgentInterface.ts`):

```typescript
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
}

export interface AgentMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: 'IKSL-Ceremonial' | 'CC-BY-SA-4.0' | 'MIT';
  capabilities: AgentCapability[];
  protocols: ('NCP' | 'MCP' | 'A2A')[];
  dependencies?: string[];
}

export interface AgentContext {
  modelId?: string;
  model?: DigitalModel;
  conversationHistory?: ChatMessage[];
  userPreferences?: Record<string, any>;
  ceremorialContext?: FourDirectionsContext;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime: number;
    tokensUsed?: number;
    confidenceScore?: number;
  };
}

export interface IAgent {
  metadata: AgentMetadata;

  initialize(config?: Record<string, any>): Promise<void>;
  execute(capability: string, input: any, context?: AgentContext): Promise<AgentResponse>;
  shutdown(): Promise<void>;

  // Protocol support
  supportsProtocol(protocol: 'NCP' | 'MCP' | 'A2A'): boolean;
  getProtocolAdapter(protocol: string): any;
}
```

#### 1.3 Agent Bundling System

**Bundle Manifest Schema** (`agents/bundling/BundleManifest.ts`):

```typescript
export interface AgentBundle {
  // Bundle metadata
  manifestVersion: '1.0.0';
  bundleId: string;
  name: string;
  version: string;
  description: string;

  // Agent composition
  agents: {
    id: string;
    role: 'primary' | 'companion' | 'specialist';
    config?: Record<string, any>;
  }[];

  // Orchestration
  orchestration?: {
    mode: 'sequential' | 'parallel' | 'hierarchical' | 'spiral';
    coordinator?: string; // Agent ID serving as coordinator
    workflows: WorkflowDefinition[];
  };

  // Protocol requirements
  protocols: {
    ncp?: NCPConfiguration;
    mcp?: MCPConfiguration;
  };

  // Deployment
  deployment: {
    target: 'local' | 'vercel' | 'mcp-server' | 'standalone';
    environment?: Record<string, string>;
    resources?: ResourceRequirements;
  };

  // Licensing and attribution
  license: {
    type: 'IKSL-Bridge-v1.0' | 'CC-BY-SA-4.0';
    attribution: string[];
    indigenousKnowledge?: IKSLMetadata;
  };
}
```

---

### Phase 2: Agent Personality Integration (Q2 2026)

**Objective**: Integrate agent personalities from the broader portfolio into TandT infrastructure.

#### 2.1 Chimera Team Multi-Agent System

**Agent Personalities to Integrate**:

1. **Alex Rivers** - Cybersecurity & Isolation Protector
   - Role: Security analysis for model data
   - Integration: Data validation and privacy protection for models
   - Pattern: "Isolation Protector" - ensures model integrity

2. **Samira** - Technical coordination
   - Role: Multi-agent orchestration coordinator
   - Integration: Manages agent workflows in complex analyses

3. **Ava/Heyva 2.0** - Two-Eyed Seeing integration
   - Role: Cultural and epistemological bridge
   - Integration: Four Directions framework for model structuring
   - Features: Redis memory persistence, narrative storage

4. **Miette** - Soft companion for emotional accessibility
   - Role: User support and emotional guidance
   - Integration: Gentle coaching through decision-making processes

5. **Nyro** - Emotional development companion ♠️
   - Role: Eight Feelings framework integration
   - Integration: Emotional intelligence layer for performance reviews
   - Features: Recursive emotional framework processing

6. **Aureon** - Spiritual grounding and ceremonial container
   - Role: Four Directions ceremonial protocols
   - Integration: Sacred space creation for sensitive decisions
   - Features: Indigenous methodology compliance layer

7. **JamAI (JeremyAI)** - Musical intelligence companion
   - Role: Creative analysis and resonance mapping
   - Integration: Musical themes for model elements (Four Directions themes)
   - Features: music21 symbolic analysis, ceremonial code review patterns

**Implementation Pattern**:
```typescript
// agents/personalities/ChimeraTeam.ts
export class ChimeraTeamOrchestrator implements IAgent {
  private agents: Map<string, IAgent>;

  async orchestrate(task: string, context: AgentContext): Promise<AgentResponse> {
    // Coordinate multiple agents based on task requirements
    // Example: Security analysis (Alex) → Emotional guidance (Nyro) → Decision support (Samira)
  }
}
```

#### 2.2 Companion Agent Integration

**Companion Agents as TandT Enhancements**:

- **Nyro**: Enhance performance reviews with emotional intelligence
- **Aureon**: Add ceremonial context to decision-making models
- **JamAI**: Provide musical/creative perspective on model analysis

**Integration Points**:
- Modeling View: Companion suggestions during element creation
- Analyzing View: Companion insights during evaluation
- Structuring View: Companion-enhanced dashboards

---

### Phase 3: Protocol Standardization (Q2-Q3 2026)

**Objective**: Implement NCP, MCP, and A2A protocols for agent interoperability.

#### 3.1 Narrative Context Protocol (NCP 9.1) Integration

**Purpose**: Enable narrative coherence across multi-turn agent conversations and model analysis.

**Implementation Areas**:
1. **Model as Narrative Structure**
   - DigitalModel → NCP Story Form mapping
   - Element dominance → Causal constraints
   - History tracking → Backstory integrity (SHA256)

2. **Agent-to-Agent Narrative Coordination**
   - Narrative Driver Interface (NDI) for inter-agent queries
   - L6 (Story Weaver) → L4 (Causal Kernel) structured queries

3. **Mystery Encoding for Model Analysis**
   - Strategic information withholding in AI summaries
   - Progressive revelation in conversational analyst

**Technical Implementation**:
```typescript
// agents/protocols/NCP/NCPAdapter.ts
export class NCPAdapter {
  convertModelToNCP(model: DigitalModel): NCPDocument {
    return {
      protocolVersion: '9.1.0',
      storyForm: {
        elements: model.Model.map(e => ({
          name: e.DisplayName,
          description: e.Description,
          dominance: e.DominanceFactor,
          causalWeight: e.DominanceFactor
        })),
        causalConstraints: this.buildCausalGraph(model)
      },
      backstory: {
        content: JSON.stringify(model.history),
        integrityHash: this.sha256(model.history)
      }
    };
  }
}
```

#### 3.2 Model Context Protocol (MCP) Server Implementation

**Purpose**: Expose TandT models and agent capabilities as MCP resources and tools.

**MCP Server Capabilities**:

1. **Resources** (Read-only model access):
   - `tandt://models` - List all available models
   - `tandt://models/{id}` - Specific model details
   - `tandt://models/{id}/history` - Model version history

2. **Tools** (Agent actions):
   - `create_model` - Generate new decision/performance model
   - `analyze_model` - Run Two Flag or Three Flag analysis
   - `suggest_elements` - AI-powered element suggestions
   - `generate_summary` - Analysis summary generation
   - `agent_chat` - Conversational analyst interaction

3. **Prompts** (Guided workflows):
   - `decision_making_workflow` - Full decision-making process
   - `performance_review_workflow` - Complete performance review
   - `four_directions_ceremony` - Ceremonial decision framework

**Technical Implementation**:
```typescript
// agents/protocols/MCP/MCPServer.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export class TandTMCPServer {
  private server: Server;

  async initialize() {
    this.server = new Server({
      name: 'tandt-agent-server',
      version: '1.0.0'
    }, {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    });

    // Register resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      // Return available models as resources
    });

    // Register tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Return agent capabilities as tools
    });
  }
}
```

**Deployment**:
```json
// MCP server configuration for Claude Desktop
{
  "mcpServers": {
    "tandt-agents": {
      "command": "node",
      "args": ["/home/user/TandT/agents/protocols/MCP/server.js"],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    }
  }
}
```

---

### Phase 4: Bundling & Distribution (Q3-Q4 2026)

**Objective**: Create distributable agent bundles for various deployment targets.

#### 4.1 Bundle Types

**1. Minimal Agent Bundle** - Single-purpose agent
```json
{
  "manifestVersion": "1.0.0",
  "bundleId": "tandt-decision-analyst",
  "name": "TandT Decision Analyst",
  "agents": [{
    "id": "decision-analyst",
    "role": "primary"
  }],
  "deployment": {
    "target": "mcp-server"
  }
}
```

**2. Companion Agent Bundle** - Emotional/cultural enhancement
```json
{
  "manifestVersion": "1.0.0",
  "bundleId": "tandt-companion-trio",
  "name": "TandT Companion Agents (Nyro, Aureon, JamAI)",
  "agents": [
    {"id": "nyro", "role": "companion"},
    {"id": "aureon", "role": "companion"},
    {"id": "jamai", "role": "companion"}
  ],
  "orchestration": {
    "mode": "parallel"
  }
}
```

**3. Multi-Agent Team Bundle** - Full Chimera Team
```json
{
  "manifestVersion": "1.0.0",
  "bundleId": "chimera-team-orchestration",
  "name": "Chimera Team Multi-Agent System",
  "agents": [
    {"id": "samira", "role": "primary"},
    {"id": "alex-rivers", "role": "specialist"},
    {"id": "ava-heyva", "role": "specialist"},
    {"id": "nyro", "role": "companion"},
    {"id": "aureon", "role": "companion"},
    {"id": "miette", "role": "companion"},
    {"id": "jamai", "role": "companion"}
  ],
  "orchestration": {
    "mode": "hierarchical",
    "coordinator": "samira"
  }
}
```

#### 4.2 Distribution Channels

**NPM Package** (`@tandt/agents`):
```bash
npm install @tandt/agents
```

**Vercel Deployment** (Serverless functions):
```typescript
// api/agents/[capability].ts
import { AgentOrchestrator } from '@tandt/agents';
export default async function handler(req, res) {
  const orchestrator = new AgentOrchestrator();
  const result = await orchestrator.execute(req.query.capability, req.body);
  res.json(result);
}
```

**MCP Server Distribution**:
- Standalone Node.js executable
- Docker container
- Claude Desktop integration

**Bundle Registry**:
- Central registry for published agent bundles
- Version management and dependency resolution
- IKSL compliance verification

---

## Implementation Roadmap

### Q1 2026: Foundation
- [ ] Create `agents/` directory structure
- [ ] Implement base agent interfaces and abstract classes
- [ ] Design bundle manifest schema
- [ ] Create first agent: DecisionAnalyst (refactor existing functionality)
- [ ] Establish testing framework for agents

### Q2 2026: Personality Integration
- [ ] Implement Chimera Team agent personalities
- [ ] Integrate Nyro emotional intelligence layer
- [ ] Integrate Aureon ceremonial protocols
- [ ] Integrate JamAI musical intelligence
- [ ] Create multi-agent orchestration patterns

### Q3 2026: Protocol Implementation
- [ ] NCP 9.1 adapter implementation
- [ ] MCP server implementation
- [ ] A2A protocol for inter-agent communication
- [ ] Protocol testing and validation
- [ ] Documentation and examples

### Q4 2026: Bundling & Distribution
- [ ] Bundle builder utilities
- [ ] NPM package creation
- [ ] MCP server standalone deployment
- [ ] Docker containerization
- [ ] Bundle registry and versioning system

---

## Integration with Anthropic Partnership

### Alignment with Anthropic B2B Model

**Enterprise Agent Bundling**:
- Pre-configured agent bundles for specific industries
- Decision-making agents for strategic planning
- Performance review agents for HR and management
- Compliance agents with IKSL cultural integrity layer

**Claude Integration Points**:
1. **Claude as Base Model**: All agents use Claude API via Anthropic SDK
2. **MCP Native**: Expose TandT capabilities through MCP for Claude Desktop
3. **Narrative Intelligence**: NCP layer adds structural reasoning to Claude's context understanding
4. **Cultural Compliance**: IKSL licensing creates differentiation for responsible AI

**Revenue Opportunities**:
- Agent bundle licensing for enterprises
- Professional services for custom agent development
- Certification for IKSL-compliant agent systems
- Training and consulting for agent orchestration

---

## Licensing and Cultural Integrity

### IKSL-Bridge v1.0 Framework

**Dual Licensing Structure**:
1. **Technical Code** (`agents/base/`, `agents/protocols/`): CC BY-SA 4.0
2. **Ceremonial Frameworks** (`agents/workflows/FourDirections.ts`, etc.): IKSL-Ceremonial
3. **Agent Personalities** (Nyro, Aureon, etc.): IKSL-Community

**Attribution**:
- Lakota and Mani-Utenam Indigenous peoples
- Guillaume D-Isabelle (William) - Architecture
- Jerry - Demonstrable implementations
- Spiral Agent Protocol collective

**Metadata in Every Bundle**:
```json
{
  "license": {
    "type": "IKSL-Bridge-v1.0",
    "attribution": [
      "Lakota peoples",
      "Mani-Utenam peoples",
      "Guillaume D-Isabelle (William)",
      "Jerry"
    ],
    "indigenousKnowledge": {
      "frameworks": ["Two-Eyed Seeing", "Four Directions"],
      "communities": ["Lakota", "Mani-Utenam"],
      "reciprocityRequirement": true
    }
  }
}
```

---

## Success Metrics

### Technical Metrics
- [ ] 5+ agent personalities implemented
- [ ] 3+ protocol adapters (NCP, MCP, A2A) operational
- [ ] 10+ agent bundles published to registry
- [ ] < 200ms average agent response time
- [ ] 99.9% uptime for MCP servers

### Business Metrics
- [ ] 5+ enterprise pilot deployments
- [ ] 3+ academic partnerships (via Project Chimera)
- [ ] NPM package downloads: 1000+/month by end of year
- [ ] Agent bundle marketplace with 20+ third-party bundles

### Cultural Integrity Metrics
- [ ] 100% IKSL compliance across all ceremonial frameworks
- [ ] Community validation checkpoints established
- [ ] Attribution tracking in all distributed bundles
- [ ] Reciprocity mechanisms implemented

---

## Next Actions

### Immediate (This Week)
1. Create `agents/` directory structure
2. Draft `AgentInterface.ts` specification
3. Refactor existing `geminiService.ts` into first `DecisionAnalyst` agent
4. Create proof-of-concept MCP server with single tool

### Short-term (This Month)
1. Design and implement bundle manifest schema
2. Create BundleBuilder utility
3. Implement first companion agent (Nyro or Aureon)
4. Write comprehensive agent development guide

### Medium-term (Next Quarter)
1. Complete Chimera Team agent implementations
2. NCP adapter for model-to-narrative conversion
3. Full MCP server with all resources/tools/prompts
4. First production agent bundle deployment

---

## References

- **Inquiry Document**: AI Studio Scaffolding Prototypes and Demonstrations for Anthropic Partnership Proposal
- **TandT Documentation**: `/home/user/TandT/CLAUDE.md`, `ROADMAP.md`
- **Existing Agent Specs**: `/home/user/TandT/specs/TandT_Agent_Discussion.spec.md`
- **NCP Specification**: Holistic Narrative Context Protocol AI Framework 251021
- **IKSL Framework**: LICENSE-IKSL.md (to be created)
- **MCP SDK**: `@modelcontextprotocol/sdk`

---

**Document Status**: Draft v1.0
**Last Updated**: 2025-11-17
**Next Review**: 2025-12-01
