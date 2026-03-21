/**
 * veritas generate — AI-powered model generation via the /api/llm/generate-model endpoint.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { generateModel, getModel, type GenerateModelParams } from '../api-client.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseElements(raw: string): GenerateModelParams['elements'] {
  return raw.split(',').map((s) => {
    const trimmed = s.trim();
    if (!trimmed) return null;
    return { name: trimmed };
  }).filter(Boolean) as GenerateModelParams['elements'];
}

function modelTypeName(t: number): string {
  return t === 1 ? 'Decision Making' : 'Performance Review';
}

// ---------------------------------------------------------------------------
// Command registration
// ---------------------------------------------------------------------------

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate <topic>')
    .description('Generate a new model using AI')
    .option('--type <number>', 'Model type: 1=Decision, 2=Performance Review', '2')
    .option('--description <text>', 'Optional model description')
    .option('--elements <list>', 'Comma-separated element names (e.g. "Quality,Speed,Cost")')
    .option('--json', 'Machine-readable JSON output')
    .action(async (topic: string, opts) => {
      const modelType = parseInt(opts.type, 10);
      if (![1, 2].includes(modelType)) {
        const msg = 'Invalid --type: must be 1 (Decision) or 2 (Performance Review)';
        if (opts.json) {
          process.stderr.write(JSON.stringify({ error: msg }) + '\n');
        } else {
          console.error(chalk.red(msg));
        }
        process.exitCode = 1;
        return;
      }

      const elements = opts.elements ? parseElements(opts.elements) : [];
      if (elements.length === 0) {
        const msg = 'At least one element is required. Use --elements "Name1,Name2,..."';
        if (opts.json) {
          process.stderr.write(JSON.stringify({ error: msg }) + '\n');
        } else {
          console.error(chalk.red(msg));
        }
        process.exitCode = 1;
        return;
      }

      const params: GenerateModelParams = {
        topic,
        model_type: modelType,
        description: opts.description,
        elements,
      };

      try {
        if (!opts.json) {
          console.log(chalk.dim(`Generating ${modelTypeName(modelType)} model for "${topic}"...`));
        }

        const result = await generateModel(params);

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(chalk.green('\n✓ Model generated successfully\n'));
        console.log(chalk.bold('Name:    ') + chalk.cyan(result.model.name));
        console.log(chalk.bold('ID:      ') + result.model.id);
        console.log(chalk.bold('Type:    ') + modelTypeName(result.model.model_type));
        if (result.model.description) {
          console.log(chalk.bold('Desc:    ') + result.model.description);
        }
        console.log(chalk.bold('Created: ') + result.model.created_at);
        if (result.message) {
          console.log(chalk.dim(`\n${result.message}`));
        }

        // Fetch and display elements
        try {
          const full = await getModel(result.model.id);
          const els = full.model_data?.Model ?? [];
          if (els.length > 0) {
            console.log(chalk.bold(`\nElements (${els.length}):`));
            for (const el of els) {
              const state = modelType === 2
                ? chalk.dim(` [acceptance:${el.TwoFlag ? 'acceptable ✓' : 'unacceptable ✗'} trend:${el.ThreeFlag > 0 ? '↑' : el.ThreeFlag < 0 ? '↓' : '→'}]`)
                : '';
              console.log(`  ${chalk.green('•')} ${el.DisplayName || el.NameElement}${state}`);
            }
          }
        } catch {
          // Non-fatal — model was created but detail fetch failed
        }

        console.log(chalk.dim(`\nView details: veritas models get ${result.model.id}`));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (opts.json) {
          process.stderr.write(JSON.stringify({ error: message }) + '\n');
        } else {
          console.error(chalk.red('Generation failed:'), message);
        }
        process.exitCode = 1;
      }
    });
}
