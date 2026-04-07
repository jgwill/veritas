#!/usr/bin/env node
/**
 * veritas — CLI for TandT Performance Review & Decision Making models.
 *
 * Creative orientation: every model is a lens; every evaluation, a moment of truth.
 * This tool gives you terminal-native access to the same capabilities the veritas
 * web application offers — model CRUD, AI generation, and MMOT evaluation — so that
 * the thinking framework travels with you wherever a shell prompt lives.
 */

import { loadVeritasEnv } from './env.js';

// Load .env files before anything else reads process.env
loadVeritasEnv();

import { Command } from 'commander';
import chalk from 'chalk';
import { registerModelsCommands } from './commands/models.js';
import { registerGenerateCommand } from './commands/generate.js';
import { registerMmotCommands } from './commands/mmot.js';
import { getSchema } from './api-client.js';

const program = new Command();

program
  .name('veritas')
  .version('0.1.0')
  .description(
    'CLI for veritas TandT — Digital Thinking Guidance for Performance Review & Decision Making models.\n\n' +
    'Configure with environment variables:\n' +
    '  VERITAS_API_KEY   Bearer token (required)\n' +
    '  VERITAS_API_URL   API base URL (default: https://api.example.com)',
  );

// Register sub-commands
registerModelsCommands(program);
registerGenerateCommand(program);
registerMmotCommands(program);

// Schema command (top-level)
program
  .command('schema')
  .description('Show API schema and connection info')
  .option('--json', 'Machine-readable JSON output')
  .action(async (opts) => {
    try {
      const schema = await getSchema();
      if (opts.json) {
        console.log(JSON.stringify(schema, null, 2));
      } else {
        console.log(chalk.bold.cyan('\nveritas API Schema\n'));
        console.log(chalk.bold('Base URL: ') + (schema.api_url as string));
        console.log(chalk.bold('Models:   ') + `${schema.current_model_count} available\n`);

        console.log(chalk.bold('Endpoints:'));
        const endpoints = schema.endpoints as Record<string, string>;
        for (const [route, desc] of Object.entries(endpoints)) {
          console.log(`  ${chalk.cyan(route.padEnd(32))} ${desc}`);
        }

        console.log(chalk.bold('\nModel Types:'));
        const types = schema.model_types as Record<string, string>;
        for (const [id, name] of Object.entries(types)) {
          console.log(`  ${chalk.cyan(id)} — ${name}`);
        }
        console.log('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (opts.json) {
        process.stderr.write(JSON.stringify({ error: message }) + '\n');
      } else {
        console.error(chalk.red('Error:'), message);
      }
      process.exitCode = 1;
    }
  });

program.parse();
