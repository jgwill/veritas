/**
 * Tool definitions and handlers for the veritas MCP server.
 *
 * Nine tools total:
 *   NETWORK_TOOLS  — veritas_list_models, veritas_get_model, veritas_generate_model,
 *                    veritas_update_model, veritas_delete_model, veritas_export_model,
 *                    veritas_import_model, veritas_get_schema
 *   LOCAL_TOOLS    — veritas_mmot_evaluate
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type {
  ToolDefinition,
  ToolGroup,
  DigitalModel,
  MmotEvaluateParams,
} from "./types.js";
import { VeritasApiClient } from "./api-client.js";

const execFileAsync = promisify(execFile);

// ── Tool catalog ─────────────────────────────────────────────────────

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // ── Network Tools ────────────────────────────────────────────────
  {
    name: "veritas_list_models",
    description:
      "List all TandT models for the authenticated user. Returns an array of {id, name, type, description}.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "veritas_get_model",
    description:
      "Fetch a complete DigitalModel by ID, including all elements, flags, comparison data, and history.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        modelId: {
          type: "string",
          description: "The unique model ID.",
        },
      },
      required: ["modelId"],
    },
  },
  {
    name: "veritas_generate_model",
    description:
      "Generate a new TandT model via server-side Gemini AI. Provide a topic, optional model_type (1=Decision, 2=Performance Review, default 2), an optional description, and an array of elements with name (required), description, state (-1/0/1), and trend (-1/0/1). The server's Gemini generates the full model structure.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The model title / subject.",
        },
        model_type: {
          type: "number",
          description:
            "1 = Decision Making, 2 = Performance Review. Defaults to 2.",
        },
        description: {
          type: "string",
          description: "Optional notes about the model.",
        },
        elements: {
          type: "array",
          description: "2-20 elements for the model.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Element name." },
              description: {
                type: "string",
                description: "What this element measures.",
              },
              state: {
                type: "number",
                description:
                  "Performance Review only: -1 declining, 0 stable, 1 improving.",
              },
              trend: {
                type: "number",
                description:
                  "Performance Review only: -1 concern, 0 neutral, 1 strength.",
              },
            },
            required: ["name"],
          },
        },
      },
      required: ["topic", "elements"],
    },
  },
  {
    name: "veritas_update_model",
    description:
      "Update an existing model. Supply the model ID and any combination of name, description, or modelData (containing Model array and optional history).",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        modelId: {
          type: "string",
          description: "The model ID to update.",
        },
        name: { type: "string", description: "New model name." },
        description: { type: "string", description: "New description." },
        modelData: {
          type: "object",
          description:
            "Updated model data containing Model (DigitalElement[]) and optional history.",
          properties: {
            Model: { type: "array", description: "Array of DigitalElement objects." },
            history: { type: "array", description: "Array of HistoryEntry objects." },
          },
        },
      },
      required: ["modelId"],
    },
  },
  {
    name: "veritas_delete_model",
    description: "Permanently delete a model by ID.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        modelId: {
          type: "string",
          description: "The model ID to delete.",
        },
      },
      required: ["modelId"],
    },
  },
  {
    name: "veritas_export_model",
    description:
      "Export a model to a local JSON file. Fetches the model from the API and writes it to the specified path.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        modelId: {
          type: "string",
          description: "The model ID to export.",
        },
        outputPath: {
          type: "string",
          description:
            "Local file path to write the JSON. Defaults to ./{ModelName}.json",
        },
      },
      required: ["modelId"],
    },
  },
  {
    name: "veritas_import_model",
    description:
      "Import a model from a local JSON file into the veritas API. Reads the file and creates the model via POST /api/models.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Local path to a veritas model JSON file.",
        },
      },
      required: ["filePath"],
    },
  },
  {
    name: "veritas_get_schema",
    description:
      "Retrieve the OpenAPI schema for the veritas LLM API endpoints. Useful for discovering available parameters and data shapes.",
    group: "NETWORK_TOOLS",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ── Local Tools ──────────────────────────────────────────────────
  {
    name: "veritas_mmot_evaluate",
    description:
      "Perform a Managerial Moment of Truth (MMOT) 4-step evaluation on a TandT model. Steps: (1) Acknowledge — summarize each element's state/trend, identify unmet expectations. (2) Analyze — trace root causes for each concern. (3) Plan — create advancing action plans. (4) Document — structured report with recommendations. Can load model from API (modelId) or local file (filePath). Outputs evaluation to .mw/north/ by default.",
    group: "LOCAL_TOOLS",
    inputSchema: {
      type: "object",
      properties: {
        modelId: {
          type: "string",
          description: "Model ID to fetch from the veritas API.",
        },
        filePath: {
          type: "string",
          description:
            "Local path to a model JSON file (alternative to modelId).",
        },
        outputDir: {
          type: "string",
          description:
            "Directory for evaluation output. Defaults to .mw/north/",
        },
        llmBinary: {
          type: "string",
          description:
            "LLM CLI binary to use for evaluation (gemini, claude, copilot). Defaults to 'gemini'.",
        },
      },
    },
  },
];

// ── Tool filtering ───────────────────────────────────────────────────

export function getEnabledTools(): ToolDefinition[] {
  const enabledGroups = parseToolGroups();
  const disabledTools = parseDisabledTools();

  return TOOL_DEFINITIONS.filter(
    (t) => enabledGroups.has(t.group) && !disabledTools.has(t.name)
  );
}

function parseToolGroups(): Set<ToolGroup> {
  const env = process.env.VERITAS_TOOLS;
  if (!env) return new Set<ToolGroup>(["NETWORK_TOOLS", "LOCAL_TOOLS"]);
  return new Set(
    env.split(",").map((s) => s.trim()) as ToolGroup[]
  );
}

function parseDisabledTools(): Set<string> {
  const env = process.env.VERITAS_DISABLED_TOOLS;
  if (!env) return new Set();
  return new Set(env.split(",").map((s) => s.trim()));
}

// ── Tool dispatch ────────────────────────────────────────────────────

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  client: VeritasApiClient
): Promise<unknown> {
  switch (name) {
    case "veritas_list_models":
      return handleListModels(client);

    case "veritas_get_model":
      return handleGetModel(client, args.modelId as string);

    case "veritas_generate_model":
      return handleGenerateModel(client, args);

    case "veritas_update_model":
      return handleUpdateModel(client, args);

    case "veritas_delete_model":
      return handleDeleteModel(client, args.modelId as string);

    case "veritas_export_model":
      return handleExportModel(
        client,
        args.modelId as string,
        args.outputPath as string | undefined
      );

    case "veritas_import_model":
      return handleImportModel(client, args.filePath as string);

    case "veritas_get_schema":
      return handleGetSchema(client);

    case "veritas_mmot_evaluate":
      return handleMmotEvaluate(client, args as unknown as MmotEvaluateParams);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Handler implementations ──────────────────────────────────────────

async function handleListModels(client: VeritasApiClient) {
  const models = await client.listModels();
  return {
    count: models.length,
    models,
  };
}

async function handleGetModel(client: VeritasApiClient, modelId: string) {
  if (!modelId) throw new Error("modelId is required");
  const record = await client.getModel(modelId);
  const model = VeritasApiClient.toDigitalModel(record);

  const elementSummary = model.Model.map((el) => ({
    name: el.NameElement,
    displayName: el.DisplayName,
    twoFlag: el.TwoFlag,
    threeFlag: el.ThreeFlag,
    dominanceFactor: el.DominanceFactor,
    description: el.Description,
  }));

  return {
    id: record.id,
    name: model.ModelName,
    topic: model.DigitalTopic,
    type: model.DigitalThinkingModelType,
    typeName:
      model.DigitalThinkingModelType === 1
        ? "Decision Making"
        : "Performance Review",
    elementCount: model.Model.length,
    elements: elementSummary,
    historyCount: model.history?.length ?? 0,
    raw: model,
  };
}

async function handleGenerateModel(
  client: VeritasApiClient,
  args: Record<string, unknown>
) {
  const topic = args.topic as string;
  const elements = args.elements as Array<{
    name: string;
    description?: string;
    state?: number;
    trend?: number;
  }>;

  if (!topic) throw new Error("topic is required");
  if (!elements || !Array.isArray(elements) || elements.length < 2) {
    throw new Error("elements array is required (minimum 2 items)");
  }
  if (elements.length > 20) {
    throw new Error("Maximum 20 elements allowed");
  }

  const result = await client.generateModel({
    topic,
    model_type: (args.model_type as 1 | 2) ?? 2,
    description: args.description as string | undefined,
    elements: elements.map((el) => ({
      name: el.name,
      description: el.description,
      state: el.state as -1 | 0 | 1 | undefined,
      trend: el.trend as -1 | 0 | 1 | undefined,
    })),
  });

  return {
    message: result.message,
    model: result.model,
  };
}

async function handleUpdateModel(
  client: VeritasApiClient,
  args: Record<string, unknown>
) {
  const modelId = args.modelId as string;
  if (!modelId) throw new Error("modelId is required");

  const updateData: Record<string, unknown> = {};
  if (args.name !== undefined) updateData.name = args.name;
  if (args.description !== undefined) updateData.description = args.description;
  if (args.modelData !== undefined) updateData.modelData = args.modelData;

  if (Object.keys(updateData).length === 0) {
    throw new Error(
      "At least one field to update is required (name, description, or modelData)"
    );
  }

  await client.updateModel(modelId, updateData);
  return { success: true, modelId, updatedFields: Object.keys(updateData) };
}

async function handleDeleteModel(client: VeritasApiClient, modelId: string) {
  if (!modelId) throw new Error("modelId is required");
  await client.deleteModel(modelId);
  return { success: true, modelId, message: `Model ${modelId} deleted.` };
}

async function handleExportModel(
  client: VeritasApiClient,
  modelId: string,
  outputPath?: string
) {
  if (!modelId) throw new Error("modelId is required");

  const record = await client.getModel(modelId);
  const model = VeritasApiClient.toDigitalModel(record);

  const filePath =
    outputPath ||
    `./${model.ModelName.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
  const absPath = resolve(filePath);

  await mkdir(dirname(absPath), { recursive: true });
  await writeFile(absPath, JSON.stringify(model, null, 2), "utf-8");

  return {
    success: true,
    modelId,
    modelName: model.ModelName,
    exportedTo: absPath,
    elementCount: model.Model.length,
  };
}

async function handleImportModel(
  client: VeritasApiClient,
  filePath: string
) {
  if (!filePath) throw new Error("filePath is required");

  const absPath = resolve(filePath);
  const raw = await readFile(absPath, "utf-8");
  let model: DigitalModel;

  try {
    model = JSON.parse(raw) as DigitalModel;
  } catch {
    throw new Error(`Failed to parse JSON from ${absPath}`);
  }

  if (!model.ModelName || !Array.isArray(model.Model)) {
    throw new Error(
      "Invalid model file: must contain ModelName and Model array"
    );
  }

  const created = await client.createModel({
    name: model.ModelName,
    description: model.Note ?? undefined,
    modelType: model.DigitalThinkingModelType || 2,
    modelData: {
      Model: model.Model,
      history: model.history ?? [],
    },
  });

  return {
    success: true,
    importedFrom: absPath,
    modelName: model.ModelName,
    newModelId: created.id,
    elementCount: model.Model.length,
  };
}

async function handleGetSchema(client: VeritasApiClient) {
  return client.getSchema();
}

// ── MMOT Evaluate (Local Tool) ───────────────────────────────────────

const MMOT_PROMPT_TEMPLATE = `You are performing a Managerial Moment of Truth (MMOT) 4-step evaluation on a TandT Digital Thinking model.

MODEL: {{MODEL_NAME}}
TOPIC: {{MODEL_TOPIC}}
TYPE: {{MODEL_TYPE}}

ELEMENTS:
{{ELEMENTS}}

Perform the MMOT evaluation following these 4 steps precisely:

## Step 1: ACKNOWLEDGE
For each element, summarize its current state and trend. Identify where expectations are NOT being met. Be honest and direct — the value of MMOT is in facing truth, not softening it.

## Step 2: ANALYZE
For each element where expectations aren't met (declining, flagged as concern, or underperforming), trace how it got to this state. Identify root causes and contributing factors. Look at the system, not just symptoms.

## Step 3: PLAN
For each acknowledged truth, create an action plan that is ADVANCING (moving toward desired state), not merely reactive. Include:
- Specific actions
- Priority (high/medium/low)
- Orientation: advancing (building toward excellence) or corrective (fixing a problem)

## Step 4: DOCUMENT
Produce a structured report that a manager can act on. Include:
- Executive summary (2-3 sentences)
- Element-by-element assessment
- Top 3 priorities
- Recommended next review date

Output the evaluation as structured markdown.`;

function buildMmotPrompt(model: DigitalModel): string {
  const typeName =
    model.DigitalThinkingModelType === 1
      ? "Decision Making"
      : "Performance Review";

  const elements = model.Model.map((el, i) => {
    const stateLabel =
      el.ThreeFlag === 1
        ? "Improving"
        : el.ThreeFlag === -1
          ? "Declining"
          : "Stable";
    const flagLabel = el.TwoFlag ? "Strength" : "Concern";
    return `  ${i + 1}. ${el.DisplayName || el.NameElement}${el.Description ? ` — ${el.Description}` : ""}
     State: ${stateLabel} | Flag: ${flagLabel} | Dominance: ${(el.DominanceFactor * 100).toFixed(1)}%`;
  }).join("\n");

  return MMOT_PROMPT_TEMPLATE.replace("{{MODEL_NAME}}", model.ModelName)
    .replace("{{MODEL_TOPIC}}", model.DigitalTopic)
    .replace("{{MODEL_TYPE}}", typeName)
    .replace("{{ELEMENTS}}", elements);
}

async function handleMmotEvaluate(
  client: VeritasApiClient,
  params: MmotEvaluateParams
): Promise<unknown> {
  // 1. Load model
  let model: DigitalModel;

  if (params.modelId) {
    const record = await client.getModel(params.modelId);
    model = VeritasApiClient.toDigitalModel(record);
  } else if (params.filePath) {
    const absPath = resolve(params.filePath);
    const raw = await readFile(absPath, "utf-8");
    model = JSON.parse(raw) as DigitalModel;
  } else {
    throw new Error("Either modelId or filePath is required");
  }

  if (!model.Model || model.Model.length === 0) {
    throw new Error("Model has no elements to evaluate");
  }

  // 2. Build MMOT prompt
  const prompt = buildMmotPrompt(model);

  // 3. Determine output directory
  const outputDir = resolve(params.outputDir || ".mw/north");
  await mkdir(outputDir, { recursive: true });

  // 4. Run LLM evaluation
  const llmBinary = params.llmBinary || "gemini";
  let evaluation: string;

  try {
    const { stdout } = await execFileAsync(llmBinary, [], {
      encoding: "utf-8",
      timeout: 120_000,
      env: { ...process.env },
      // Pass prompt via stdin
      maxBuffer: 1024 * 1024,
    });
    // If the binary reads stdin, we need a different approach
    // Try spawning with stdin pipe
    evaluation = stdout;
  } catch {
    // Fallback: try passing prompt as argument
    try {
      const { stdout } = await execFileAsync(
        llmBinary,
        ["-p", prompt],
        {
          encoding: "utf-8",
          timeout: 120_000,
          maxBuffer: 1024 * 1024,
        }
      );
      evaluation = stdout;
    } catch (innerErr) {
      // If no LLM binary available, return the prompt itself for manual evaluation
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const promptFile = resolve(
        outputDir,
        `mmot-prompt-${timestamp}.md`
      );
      await writeFile(promptFile, prompt, "utf-8");

      return {
        success: false,
        mode: "prompt-only",
        message: `LLM binary '${llmBinary}' not available. MMOT prompt saved for manual evaluation.`,
        promptFile,
        prompt,
        error: innerErr instanceof Error ? innerErr.message : String(innerErr),
      };
    }
  }

  // 5. Write output
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeModelName = model.ModelName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const outputFile = resolve(
    outputDir,
    `mmot-${safeModelName}-${timestamp}.md`
  );
  await writeFile(outputFile, evaluation, "utf-8");

  return {
    success: true,
    modelName: model.ModelName,
    outputFile,
    evaluationLength: evaluation.length,
    summary: evaluation.slice(0, 500) + (evaluation.length > 500 ? "..." : ""),
  };
}
