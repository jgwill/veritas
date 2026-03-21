#!/usr/bin/env node
/**
 * Veritas MCP Server
 *
 * Enables LLMs to create, evaluate, and manage TandT
 * (Twos and Threes) Digital Thinking models for
 * decision-making and performance review.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { VeritasApiClient, VeritasApiError } from "./api-client.js";
import { getEnabledTools, handleToolCall } from "./tools.js";

// ── Server setup ─────────────────────────────────────────────────────

const server = new Server(
  {
    name: "veritas",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const apiClient = new VeritasApiClient();

// ── tools/list handler ───────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = getEnabledTools();
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
});

// ── tools/call handler ───────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Verify the tool is enabled
  const enabledTools = getEnabledTools();
  const tool = enabledTools.find((t) => t.name === name);
  if (!tool) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: `Tool '${name}' is not available. It may be disabled via VERITAS_TOOLS or VERITAS_DISABLED_TOOLS environment variables.`,
          }),
        },
      ],
      isError: true,
    };
  }

  try {
    const result = await handleToolCall(
      name,
      (args ?? {}) as Record<string, unknown>,
      apiClient
    );

    const text =
      typeof result === "string" ? result : JSON.stringify(result, null, 2);

    return {
      content: [{ type: "text" as const, text }],
    };
  } catch (err) {
    const errorMessage = formatError(err);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ error: errorMessage }),
        },
      ],
      isError: true,
    };
  }
});

// ── Error formatting ─────────────────────────────────────────────────

function formatError(err: unknown): string {
  if (err instanceof VeritasApiError) {
    return `API Error ${err.status}: ${err.body || err.statusText}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

// ── Start server ─────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Veritas MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting veritas MCP server:", err);
  process.exit(1);
});
