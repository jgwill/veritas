# Agent Base Classes and Interfaces

This directory contains the foundational interfaces and abstract classes for the TandT agent system.

## Core Files (To Be Implemented)

### `AgentInterface.ts`
Defines the core `IAgent` interface that all agents must implement.

**Key Interfaces**:
- `IAgent` - Base agent interface
- `AgentCapability` - Capability definition
- `AgentMetadata` - Agent metadata and versioning
- `AgentContext` - Execution context
- `AgentResponse<T>` - Standardized response format

### `BaseAgent.ts`
Abstract base class providing common functionality for all agents.

**Features**:
- Lifecycle management (initialize, execute, shutdown)
- Protocol adapter registry
- Error handling and logging
- Metadata management

### `AgentCapabilities.ts`
Standard capability definitions and schemas.

**Standard Capabilities**:
- `analyze_model` - Model analysis
- `suggest_elements` - Element suggestions
- `generate_summary` - Summary generation
- `chat` - Conversational interaction

### `AgentRegistry.ts`
Agent discovery and registration system.

**Features**:
- Dynamic agent registration
- Capability-based discovery
- Version management
- Dependency resolution

## Usage Example

```typescript
import { IAgent, AgentMetadata, AgentContext, AgentResponse } from './AgentInterface';
import { BaseAgent } from './BaseAgent';

export class MyCustomAgent extends BaseAgent implements IAgent {
  metadata: AgentMetadata = {
    id: 'my-custom-agent',
    name: 'My Custom Agent',
    version: '1.0.0',
    description: 'A custom agent implementation',
    author: 'Your Name',
    license: 'CC-BY-SA-4.0',
    capabilities: [
      {
        id: 'custom_action',
        name: 'Custom Action',
        description: 'Performs a custom action',
        inputSchema: { /* JSON Schema */ },
        outputSchema: { /* JSON Schema */ }
      }
    ],
    protocols: ['MCP']
  };

  async initialize(config?: Record<string, any>): Promise<void> {
    await super.initialize(config);
    // Custom initialization logic
  }

  async execute(
    capability: string,
    input: any,
    context?: AgentContext
  ): Promise<AgentResponse> {
    if (capability === 'custom_action') {
      // Implement custom action
      return {
        success: true,
        data: { result: 'Custom action completed' },
        metadata: { processingTime: Date.now() }
      };
    }

    return await super.execute(capability, input, context);
  }
}
```

## Development Status

- [ ] `AgentInterface.ts` - To be implemented
- [ ] `BaseAgent.ts` - To be implemented
- [ ] `AgentCapabilities.ts` - To be implemented
- [ ] `AgentRegistry.ts` - To be implemented

## License

CC BY-SA 4.0
