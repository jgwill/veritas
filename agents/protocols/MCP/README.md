# Model Context Protocol (MCP) Implementation

This directory contains the MCP server implementation for TandT agents.

## Overview

The TandT MCP Server exposes TandT models and agent capabilities through the Model Context Protocol, enabling integration with Claude Desktop and other MCP clients.

## MCP Server Capabilities

### Resources (Read-only)

- `tandt://models` - List all available models
- `tandt://models/{id}` - Specific model details
- `tandt://models/{id}/history` - Model version history
- `tandt://models/{id}/elements` - Model elements

### Tools (Actions)

1. **create_model**
   - Generate new decision-making or performance review model
   - Input: `{ description: string, type: 1 | 2, useAi: boolean }`

2. **analyze_model**
   - Run Two Flag or Three Flag analysis
   - Input: `{ modelId: string, evaluations: ElementEvaluation[] }`

3. **suggest_elements**
   - AI-powered element suggestions
   - Input: `{ topic: string, modelType: 1 | 2, count?: number }`

4. **generate_summary**
   - Analysis summary generation
   - Input: `{ modelId: string }`

5. **agent_chat**
   - Conversational analyst interaction
   - Input: `{ modelId: string, message: string }`

### Prompts (Guided Workflows)

1. **decision_making_workflow**
   - Complete decision-making process
   - Arguments: `{ topic: string }`

2. **performance_review_workflow**
   - Complete performance review process
   - Arguments: `{ topic: string }`

3. **four_directions_ceremony**
   - Ceremonial decision framework
   - Arguments: `{ topic: string, direction?: 'east' | 'south' | 'west' | 'north' }`

## Installation

### Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "tandt-agents": {
      "command": "node",
      "args": ["/path/to/TandT/agents/protocols/MCP/server.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Standalone Server

```bash
# Install dependencies
npm install

# Build the server
npm run build:mcp-server

# Run the server
node agents/protocols/MCP/server.js
```

## Files (To Be Implemented)

### `MCPServer.ts`
Main MCP server implementation using `@modelcontextprotocol/sdk`.

### `MCPTools.ts`
Tool definitions and handlers for MCP tools.

### `MCPResources.ts`
Resource providers for TandT models.

### `MCPPrompts.ts`
Prompt templates for guided workflows.

### `server.js`
Standalone server entry point.

## Development Status

- [ ] `MCPServer.ts` - Core server implementation
- [ ] `MCPTools.ts` - Tool handlers
- [ ] `MCPResources.ts` - Resource providers
- [ ] `MCPPrompts.ts` - Prompt templates
- [ ] `server.js` - Entry point
- [ ] Build configuration
- [ ] Integration tests

## Testing

```bash
# Test MCP server locally
npx @modelcontextprotocol/inspector node agents/protocols/MCP/server.js
```

## License

CC BY-SA 4.0

## References

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- TandT Planning: `/docs/LOCAL_AGENTS_ORGANIZATION_PLAN.md`
