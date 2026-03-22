/**
 * veritas mmot — Managerial Moment of Truth evaluation commands.
 *
 * MMOT is a 4-phase performance evaluation framework:
 *   1. Acknowledge — Truth statement: "Expected X, delivered Y"
 *   2. Analyze    — Blow-by-blow causal analysis + structural dynamics
 *   3. Plan       — Corrective actions + reality observations
 *   4. Feedback   — Decision: recommit / redirect / pause + rationale
 *
 * Operates on Performance Review models (type 2) only.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { getModel, type ApiModelRecord, type DigitalElement } from '../api-client.js';

// ---------------------------------------------------------------------------
// MMOT evaluation types
// ---------------------------------------------------------------------------

interface MmotPhaseResult {
  phase: string;
  content: string;
}

interface MmotEvaluation {
  model_id: string;
  model_name: string;
  timestamp: string;
  phases: MmotPhaseResult[];
  summary: string;
  recommendation: 'recommit' | 'redirect' | 'pause';
}

type Phase = 'acknowledge' | 'analyze' | 'plan' | 'feedback' | 'full';

// ---------------------------------------------------------------------------
// Evaluation logic (local — runs against model data without LLM call)
// ---------------------------------------------------------------------------

// TwoFlag = binary acceptance (acceptable/unacceptable) — MMOT domain semantics
function acceptanceLabel(flag: boolean): string {
  return flag ? 'acceptable ✓' : 'unacceptable ✗';
}

// ThreeFlag = directional trend (-1 declining, 0 stable, 1 improving)
function trendLabel(flag: number): string {
  if (flag > 0) return 'improving ↑';
  if (flag < 0) return 'declining ↓';
  return 'stable →';
}

function runAcknowledge(rec: ApiModelRecord): MmotPhaseResult {
  const elements = rec.model_data?.Model ?? [];
  const strengths = elements.filter((e) => e.TwoFlag);
  const weaknesses = elements.filter((e) => !e.TwoFlag);
  const improving = elements.filter((e) => e.ThreeFlag > 0);
  const declining = elements.filter((e) => e.ThreeFlag < 0);

  const lines = [
    `Model: "${rec.name}" — Performance Review with ${elements.length} elements.`,
    '',
    `Strengths:  ${strengths.length}/${elements.length} elements trending positive.`,
    `Weaknesses: ${weaknesses.length}/${elements.length} elements trending negative.`,
    `Improving:  ${improving.length} element(s) show forward momentum.`,
    `Declining:  ${declining.length} element(s) require attention.`,
    '',
    'Truth statement:',
    strengths.length >= weaknesses.length
      ? `  Performance is broadly on track — ${strengths.length} strengths vs ${weaknesses.length} weaknesses.`
      : `  Performance requires corrective action — weaknesses (${weaknesses.length}) outnumber strengths (${strengths.length}).`,
  ];

  return { phase: 'acknowledge', content: lines.join('\n') };
}

function runAnalyze(rec: ApiModelRecord): MmotPhaseResult {
  const elements = rec.model_data?.Model ?? [];
  const lines = ['Element-by-element analysis:', ''];

  for (const el of elements) {
    const name = el.DisplayName || el.NameElement;
    const acceptance = acceptanceLabel(el.TwoFlag);
    const trend = trendLabel(el.ThreeFlag ?? 0);
    lines.push(`  ${name}`);
    lines.push(`    Acceptance: ${acceptance} | Trend: ${trend}`);
    if (el.Description) lines.push(`    Context: ${el.Description}`);
    lines.push('');
  }

  // Structural dynamics
  const declining = elements.filter((e) => e.ThreeFlag < 0);
  if (declining.length > 0) {
    lines.push('Structural risk factors:');
    for (const el of declining) {
      lines.push(`  ⚠ ${el.DisplayName || el.NameElement} — declining state may cascade.`);
    }
  }

  return { phase: 'analyze', content: lines.join('\n') };
}

function runPlan(rec: ApiModelRecord): MmotPhaseResult {
  const elements = rec.model_data?.Model ?? [];
  const weakDeclining = elements.filter((e) => !e.TwoFlag && e.ThreeFlag < 0);
  const weakNeutral = elements.filter((e) => !e.TwoFlag && e.ThreeFlag === 0);
  const strongDeclining = elements.filter((e) => e.TwoFlag && e.ThreeFlag < 0);

  const lines = ['Corrective action plan:', ''];

  if (weakDeclining.length > 0) {
    lines.push('  URGENT — Weak & Declining:');
    for (const el of weakDeclining) {
      lines.push(`    • ${el.DisplayName || el.NameElement}: Immediate intervention needed.`);
    }
    lines.push('');
  }

  if (strongDeclining.length > 0) {
    lines.push('  MONITOR — Strong but Declining:');
    for (const el of strongDeclining) {
      lines.push(`    • ${el.DisplayName || el.NameElement}: Investigate root cause of decline.`);
    }
    lines.push('');
  }

  if (weakNeutral.length > 0) {
    lines.push('  IMPROVE — Weak & Neutral:');
    for (const el of weakNeutral) {
      lines.push(`    • ${el.DisplayName || el.NameElement}: Develop improvement strategy.`);
    }
    lines.push('');
  }

  if (weakDeclining.length === 0 && weakNeutral.length === 0 && strongDeclining.length === 0) {
    lines.push('  All elements are in healthy state. Continue current trajectory.');
  }

  return { phase: 'plan', content: lines.join('\n') };
}

function runFeedback(rec: ApiModelRecord): MmotPhaseResult {
  const elements = rec.model_data?.Model ?? [];
  const strengths = elements.filter((e) => e.TwoFlag).length;
  const total = elements.length;
  const declining = elements.filter((e) => e.ThreeFlag < 0).length;
  const ratio = total > 0 ? strengths / total : 0;

  let recommendation: 'recommit' | 'redirect' | 'pause';
  let rationale: string;

  if (ratio >= 0.7 && declining <= 1) {
    recommendation = 'recommit';
    rationale = `Strong performance (${strengths}/${total} strengths). Continue current course with minor adjustments.`;
  } else if (ratio >= 0.4) {
    recommendation = 'redirect';
    rationale = `Mixed results (${strengths}/${total} strengths, ${declining} declining). Redirect focus to weak areas.`;
  } else {
    recommendation = 'pause';
    rationale = `Performance concern (${strengths}/${total} strengths, ${declining} declining). Pause and reassess strategy.`;
  }

  const lines = [
    'MMOT Recommendation:',
    '',
    `  Decision: ${recommendation.toUpperCase()}`,
    `  Rationale: ${rationale}`,
  ];

  return { phase: 'feedback', content: lines.join('\n') };
}

function evaluateModel(rec: ApiModelRecord, phase: Phase): MmotEvaluation {
  const phases: MmotPhaseResult[] = [];

  if (phase === 'full' || phase === 'acknowledge') phases.push(runAcknowledge(rec));
  if (phase === 'full' || phase === 'analyze') phases.push(runAnalyze(rec));
  if (phase === 'full' || phase === 'plan') phases.push(runPlan(rec));
  if (phase === 'full' || phase === 'feedback') phases.push(runFeedback(rec));

  const fbPhase = phases.find((p) => p.phase === 'feedback');
  let recommendation: 'recommit' | 'redirect' | 'pause' = 'redirect';
  if (fbPhase) {
    if (fbPhase.content.includes('RECOMMIT')) recommendation = 'recommit';
    else if (fbPhase.content.includes('PAUSE')) recommendation = 'pause';
  }

  return {
    model_id: rec.id,
    model_name: rec.name,
    timestamp: new Date().toISOString(),
    phases,
    summary: phases.map((p) => p.content).join('\n\n'),
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// Command registration
// ---------------------------------------------------------------------------

export function registerMmotCommands(program: Command): void {
  const mmot = program
    .command('mmot')
    .description('Managerial Moment of Truth evaluation for Performance Review models');

  mmot
    .command('evaluate <modelId>')
    .description('Run MMOT evaluation on a Performance Review model')
    .option('--engine <engine>', 'LLM engine for enhanced eval: gemini | claude | copilot | local (not yet implemented, heuristic used)', 'heuristic')
    .option('--model <name>', 'LLM model name override (used when --engine is set; reserved for future use)')
    .option('--output-dir <path>', 'Output directory', '.mw/north/')
    .option('--phase <phase>', 'Specific phase: acknowledge | analyze | plan | feedback | full', 'full')
    .option('--json', 'Machine-readable JSON output')
    .action(async (modelId: string, opts) => {
      try {
        // Validate phase
        const validPhases: Phase[] = ['acknowledge', 'analyze', 'plan', 'feedback', 'full'];
        const phase = opts.phase as Phase;
        if (!validPhases.includes(phase)) {
          throw new Error(`Invalid phase "${phase}". Must be one of: ${validPhases.join(', ')}`);
        }

        // Warn when a non-heuristic engine is requested (LLM-backed evaluation is not yet implemented)
        if (opts.engine && opts.engine !== 'heuristic' && !opts.json) {
          console.warn(
            chalk.yellow(
              `⚠ LLM-backed evaluation (--engine ${opts.engine}) is not yet implemented. ` +
              `Falling back to heuristic evaluation.`,
            ),
          );
        }

        if (!opts.json) {
          console.log(chalk.dim(`Loading model ${modelId}...`));
        }

        // Fetch model
        const rec = await getModel(modelId);

        // Validate model type
        if (rec.model_type !== 2) {
          throw new Error(
            `MMOT evaluation requires a Performance Review model (type 2). ` +
            `Model "${rec.name}" is type ${rec.model_type} (Decision Making).`,
          );
        }

        if (!opts.json) {
          console.log(chalk.dim(`Running MMOT evaluation (phase: ${phase})...\n`));
        }

        const evaluation = evaluateModel(rec, phase);

        // Write output file
        const outDir = resolve(opts.outputDir);
        await mkdir(outDir, { recursive: true });
        const outFile = join(outDir, `mmot-${modelId.slice(0, 8)}-${Date.now()}.json`);
        await writeFile(outFile, JSON.stringify(evaluation, null, 2), 'utf-8');

        if (opts.json) {
          console.log(JSON.stringify(evaluation, null, 2));
          return;
        }

        // Human-readable output
        const sep = chalk.dim('═'.repeat(60));
        console.log(sep);
        console.log(chalk.bold.cyan('  MMOT Evaluation Report'));
        console.log(chalk.bold(`  Model: ${rec.name}`));
        console.log(chalk.dim(`  ID:    ${rec.id}`));
        console.log(chalk.dim(`  Time:  ${evaluation.timestamp}`));
        console.log(sep);

        for (const p of evaluation.phases) {
          console.log('');
          console.log(chalk.bold.underline(`Phase: ${p.phase.toUpperCase()}`));
          console.log('');
          console.log(p.content);
        }

        console.log('');
        console.log(sep);

        const recColor = evaluation.recommendation === 'recommit'
          ? chalk.green
          : evaluation.recommendation === 'redirect'
            ? chalk.yellow
            : chalk.red;
        console.log(recColor(`  Overall: ${evaluation.recommendation.toUpperCase()}`));
        console.log(sep);
        console.log(chalk.dim(`\nReport saved to: ${outFile}`));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (opts.json) {
          process.stderr.write(JSON.stringify({ error: message }) + '\n');
        } else {
          console.error(chalk.red('MMOT evaluation failed:'), message);
        }
        process.exitCode = 1;
      }
    });
}
