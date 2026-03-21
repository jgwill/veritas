/**
 * veritas models — CRUD commands for DigitalModel management.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  listModels,
  getModel,
  deleteModel,
  createModel,
  type ModelSummary,
  type ApiModelRecord,
} from '../api-client.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function modelTypeName(t: number): string {
  return t === 1 ? 'Decision Making' : 'Performance Review';
}

function printModelTable(models: ModelSummary[]): void {
  if (models.length === 0) {
    console.log(chalk.yellow('No models found.'));
    return;
  }

  const idW = 8;
  const typeW = 22;
  const nameW = 40;
  const header = `${'ID'.padEnd(idW)} ${'Type'.padEnd(typeW)} ${'Name'.padEnd(nameW)}`;
  console.log(chalk.bold(header));
  console.log(chalk.dim('─'.repeat(header.length)));

  for (const m of models) {
    const id = (m.id ?? '').slice(0, idW).padEnd(idW);
    const type = modelTypeName(m.model_type ?? m.type).padEnd(typeW);
    const name = (m.name || '(untitled)').slice(0, nameW).padEnd(nameW);
    console.log(`${chalk.cyan(id)} ${type} ${name}`);
  }

  console.log(chalk.dim(`\n${models.length} model(s)`));
}

function printModelDetail(rec: ApiModelRecord): void {
  const sep = chalk.dim('─'.repeat(60));
  console.log(sep);
  console.log(chalk.bold('Model: ') + chalk.cyan(rec.name));
  console.log(chalk.bold('ID:    ') + rec.id);
  console.log(chalk.bold('Type:  ') + modelTypeName(rec.model_type));
  console.log(chalk.bold('Desc:  ') + (rec.description || chalk.dim('(none)')));
  if (rec.created_at) console.log(chalk.bold('Created: ') + rec.created_at);
  if (rec.updated_at) console.log(chalk.bold('Updated: ') + rec.updated_at);
  console.log(sep);

  const elements = rec.model_data?.Model ?? [];
  if (elements.length > 0) {
    console.log(chalk.bold(`\nElements (${elements.length}):`));
    for (const el of elements) {
      const state = rec.model_type === 2
        ? ` [state:${el.ThreeFlag ?? '?'} trend:${el.TwoFlag ? '↑' : '↓'}]`
        : '';
      console.log(`  ${chalk.green('•')} ${el.DisplayName || el.NameElement}${chalk.dim(state)}`);
      if (el.Description) console.log(`    ${chalk.dim(el.Description)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Command registration
// ---------------------------------------------------------------------------

export function registerModelsCommands(program: Command): void {
  const models = program
    .command('models')
    .description('Manage veritas DigitalModels (list, get, delete, import, export)');

  // ---- list ---------------------------------------------------------------
  models
    .command('list')
    .description('List all models')
    .option('--json', 'Machine-readable JSON output')
    .action(async (opts) => {
      try {
        const data = await listModels();
        if (opts.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          printModelTable(data);
        }
      } catch (err: unknown) {
        handleError(err, opts.json);
      }
    });

  // ---- get ----------------------------------------------------------------
  models
    .command('get <id>')
    .description('Get model details')
    .option('--json', 'Machine-readable JSON output')
    .action(async (id: string, opts) => {
      try {
        const rec = await getModel(id);
        if (opts.json) {
          console.log(JSON.stringify(rec, null, 2));
        } else {
          printModelDetail(rec);
        }
      } catch (err: unknown) {
        handleError(err, opts.json);
      }
    });

  // ---- delete -------------------------------------------------------------
  models
    .command('delete <id>')
    .description('Delete a model')
    .option('--json', 'Machine-readable JSON output')
    .action(async (id: string, opts) => {
      try {
        await deleteModel(id);
        if (opts.json) {
          console.log(JSON.stringify({ deleted: id }));
        } else {
          console.log(chalk.green(`✓ Model ${id} deleted.`));
        }
      } catch (err: unknown) {
        handleError(err, opts.json);
      }
    });

  // ---- export -------------------------------------------------------------
  models
    .command('export <id>')
    .description('Export a model to a JSON file')
    .option('--output <file>', 'Output file path')
    .option('--json', 'Machine-readable JSON output')
    .action(async (id: string, opts) => {
      try {
        const rec = await getModel(id);
        const outPath = resolve(
          opts.output || `veritas-model-${id.slice(0, 8)}.json`,
        );
        await writeFile(outPath, JSON.stringify(rec, null, 2), 'utf-8');
        if (opts.json) {
          console.log(JSON.stringify({ exported: outPath }));
        } else {
          console.log(chalk.green(`✓ Model exported to ${outPath}`));
        }
      } catch (err: unknown) {
        handleError(err, opts.json);
      }
    });

  // ---- import -------------------------------------------------------------
  models
    .command('import <file>')
    .description('Import a model from a JSON file')
    .option('--json', 'Machine-readable JSON output')
    .action(async (file: string, opts) => {
      try {
        const raw = await readFile(resolve(file), 'utf-8');
        const data = JSON.parse(raw);

        // Accept either a raw ApiModelRecord or a DigitalModel wrapper
        const modelData = data.model_data ?? { Model: data.Model ?? [], history: data.history ?? [] };
        const name = data.name || data.ModelName || data.DigitalTopic || 'Imported Model';
        const description = data.description || data.Note || '';
        const modelType = data.model_type ?? data.DigitalThinkingModelType ?? 2;

        const created = await createModel({
          name,
          description,
          modelType,
          modelData,
        });

        if (opts.json) {
          console.log(JSON.stringify(created, null, 2));
        } else {
          console.log(chalk.green(`✓ Model imported: ${name}`));
          console.log(`  ID: ${chalk.cyan(created.id ?? '(see API)')}`);
        }
      } catch (err: unknown) {
        handleError(err, opts.json);
      }
    });
}

// ---------------------------------------------------------------------------
// Shared error handler
// ---------------------------------------------------------------------------

function handleError(err: unknown, json?: boolean): void {
  const message = err instanceof Error ? err.message : String(err);
  if (json) {
    process.stderr.write(JSON.stringify({ error: message }) + '\n');
  } else {
    console.error(chalk.red('Error:'), message);
  }
  process.exitCode = 1;
}
