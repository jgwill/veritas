# Agent Bundling System

This directory contains the agent bundling infrastructure for creating, packaging, and distributing TandT agent bundles.

## Overview

The bundling system allows you to:
- Package multiple agents into distributable bundles
- Define orchestration patterns for multi-agent systems
- Configure deployment targets (local, Vercel, MCP server, standalone)
- Manage versioning and dependencies
- Ensure IKSL licensing compliance

## Bundle Manifest Schema

Every agent bundle requires a `manifest.json` file following the `AgentBundle` schema.

### Minimal Example

```json
{
  "manifestVersion": "1.0.0",
  "bundleId": "tandt-decision-analyst",
  "name": "TandT Decision Analyst",
  "version": "1.0.0",
  "description": "AI-powered decision-making analyst for TandT models",
  "agents": [
    {
      "id": "decision-analyst",
      "role": "primary"
    }
  ],
  "deployment": {
    "target": "mcp-server"
  },
  "license": {
    "type": "CC-BY-SA-4.0",
    "attribution": ["TandT Team"]
  }
}
```

### Multi-Agent Team Example

```json
{
  "manifestVersion": "1.0.0",
  "bundleId": "chimera-team-full",
  "name": "Chimera Team Multi-Agent System",
  "version": "1.0.0",
  "description": "Complete Chimera Team with orchestration",
  "agents": [
    {
      "id": "samira",
      "role": "primary",
      "config": {
        "coordinationMode": "hierarchical"
      }
    },
    {
      "id": "alex-rivers",
      "role": "specialist"
    },
    {
      "id": "nyro",
      "role": "companion"
    },
    {
      "id": "aureon",
      "role": "companion"
    }
  ],
  "orchestration": {
    "mode": "hierarchical",
    "coordinator": "samira",
    "workflows": [
      {
        "id": "security-analysis",
        "agents": ["alex-rivers", "samira"],
        "type": "sequential"
      },
      {
        "id": "emotional-support",
        "agents": ["nyro", "aureon"],
        "type": "parallel"
      }
    ]
  },
  "protocols": {
    "ncp": {
      "version": "9.1.0",
      "features": ["narrative-coherence", "mystery-encoding"]
    },
    "mcp": {
      "version": "1.0.0",
      "expose": ["tools", "resources", "prompts"]
    }
  },
  "deployment": {
    "target": "vercel",
    "environment": {
      "NODE_ENV": "production"
    }
  },
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

## Bundle Templates

The `templates/` directory contains pre-configured bundle templates:

- **minimal-agent.json**: Single-purpose agent
- **companion-agent.json**: Companion agent with emotional/cultural enhancement
- **multi-agent-team.json**: Coordinated team of agents
- **ceremonial-agent.json**: Agent with Four Directions ceremonial protocols

## Creating a Bundle

```typescript
import { BundleBuilder } from './BundleBuilder';

const builder = new BundleBuilder();

const bundle = builder
  .setMetadata({
    bundleId: 'my-custom-bundle',
    name: 'My Custom Bundle',
    version: '1.0.0'
  })
  .addAgent('decision-analyst', 'primary')
  .addAgent('nyro', 'companion')
  .setOrchestration({
    mode: 'sequential',
    coordinator: 'decision-analyst'
  })
  .setDeployment({ target: 'mcp-server' })
  .build();

// Save bundle
builder.save('./my-bundle');
```

## Bundling CLI

```bash
# Create new bundle from template
npm run bundle:create -- --template minimal-agent --id my-agent

# Build bundle
npm run bundle:build -- --manifest ./bundles/my-agent/manifest.json

# Validate bundle
npm run bundle:validate -- --bundle ./dist/my-agent.bundle

# Publish to registry
npm run bundle:publish -- --bundle ./dist/my-agent.bundle
```

## Files (To Be Implemented)

### `BundleBuilder.ts`
Fluent API for building agent bundles programmatically.

### `BundleManifest.ts`
TypeScript schema and validation for bundle manifests.

### `BundleRegistry.ts`
Bundle versioning, dependency resolution, and registry management.

### `BundleValidator.ts`
Validation logic for bundle structure, IKSL compliance, and dependencies.

## Development Status

- [x] Directory structure created
- [x] README and templates planned
- [ ] `BundleBuilder.ts` - To be implemented
- [ ] `BundleManifest.ts` - To be implemented
- [ ] `BundleRegistry.ts` - To be implemented
- [ ] `BundleValidator.ts` - To be implemented
- [ ] CLI tools - To be implemented

## License

CC BY-SA 4.0 for bundling infrastructure

Individual bundles may use IKSL-Bridge-v1.0 or other licenses as specified in their manifests.
