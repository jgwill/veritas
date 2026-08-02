// STC chart-store reader — the read half of the live MMOT surface.
//
// Truth is the coaia-narrative JSONL store written by the seat's configured MCP
// (structural tension charts + MMOT evaluations). Veritas RENDERS it; it never
// writes it. Store path arrives by env (VERITAS_STC_STORE) — one canonical
// document id injected into every process, per the stateloom imitation
// blueprint (E8). No stateloom package is consumed; the shape is modeled.
//
// WHERE THE SHAPE COMES FROM
//
// It is imported, not re-derived. `coaia-narrative/contract` is exported by the
// package that performs the writes: entity kinds, the `${chartId}_...` naming
// scheme, which metadata key holds the MMOT trail, and a torn-tail-tolerant
// parser that classifies records using the writer's own predicates.
//
// This file used to carry its own copy of all of it as string literals. That is
// the failure the import removes: when two copies drift, a renderer does not
// break, it quietly renders LESS — a chart holding real work looks identical to
// an empty one. Now a shape change arrives as a version bump we can see.
//
// Import ONLY the `/contract` subpath. The package root is the MCP server
// bootstrap and starts a stdio server on import.
//
// What stays veritas's own: the env var, file I/O, and the VIEW below — how a
// chart is presented on this surface is a rendering decision, not a store fact.

import { promises as fs } from 'fs'
import {
  parseStore,
  storeRevision as contractStoreRevision,
  getChartEntity,
  getDesiredOutcome,
  getCurrentReality,
  getWork,
  getMmotBeats,
  getMmotEvaluations,
  metaString,
  type MmotEvaluation,
} from 'coaia-narrative/contract'

export interface StcActionStep {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  telescoped: boolean
  updatedAt?: string
}

/** Re-exported from the contract so this surface has one vocabulary. */
export type StcMmotEvaluation = MmotEvaluation

export interface StcMmotBeat {
  name: string
  observations: string[]
  createdAt?: string
}

export interface StcChartView {
  chartId: string
  desiredOutcome: string
  currentReality: string[]
  dueDate?: string
  parentChart?: string
  actionSteps: StcActionStep[]
  mmotEvaluations: StcMmotEvaluation[]
  mmotBeats: StcMmotBeat[]
  /** Revision token derived from truth content — never a file mtime (E1). */
  revision: string
}

export function storePath(): string | null {
  const p = process.env.VERITAS_STC_STORE
  return p && p.length > 0 ? p : null
}

export async function parseChartStore(
  chartId: string,
): Promise<StcChartView | null> {
  const path = storePath()
  if (!path) {
    throw new Error(
      'VERITAS_STC_STORE is not set — the STC surface has no store to read. ' +
        'Point it at a coaia-narrative JSONL file.',
    )
  }

  const store = parseStore(await fs.readFile(path, 'utf8'))

  const chart = getChartEntity(store, chartId)
  if (!chart) return null

  const desired = getDesiredOutcome(store, chartId)
  const reality = getCurrentReality(store, chartId)

  // getWork joins flat action steps with telescoped child charts. Collecting only
  // action_step entities — which this file used to do — shows an empty chart that
  // is in fact holding real work, because add_action_step creates a child chart
  // rather than an action_step entity. Most work in this store is telescoped.
  const actionSteps: StcActionStep[] = getWork(store, chartId).map((w) => ({
    id: w.id,
    title: w.title,
    completed: w.completed,
    dueDate: w.dueDate,
    telescoped: w.telescoped,
    updatedAt: w.updatedAt,
  }))
  actionSteps.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  const mmotBeats: StcMmotBeat[] = getMmotBeats(store, chartId).map((e) => ({
    name: e.name,
    observations: e.observations ?? [],
    createdAt: metaString(e, 'createdAt'),
  }))
  mmotBeats.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))

  return {
    chartId,
    desiredOutcome: desired?.observations?.[0] ?? '',
    currentReality: reality?.observations ?? [],
    dueDate: metaString(chart, 'dueDate'),
    parentChart: metaString(chart, 'parentChart'),
    actionSteps,
    mmotEvaluations: getMmotEvaluations(chart),
    mmotBeats,
    // Store-wide rather than chart-scoped, and deliberately so: two of the
    // writer's mutations move no timestamp on the chart at all — a progress
    // update stamps only the step, and a removal stamps nothing. The contract's
    // token folds in record counts so a deletion still moves it. Coarser means
    // at most one redundant refetch; the chart-scoped alternative means serving
    // a deleted action step forever.
    revision: contractStoreRevision(store),
  }
}

/** Revision for the watch route. Reads the same token the view carries, so the
 *  SSE change signal and the rendered payload can never disagree about whether
 *  something moved. Called on fs.watch events, not in a tight poll, so a full
 *  parse is the right trade for correctness — the previous regex scan looked
 *  only at "updatedAt" and was blind to deletions in exactly the same way. */
export async function storeRevision(path: string): Promise<string> {
  return contractStoreRevision(parseStore(await fs.readFile(path, 'utf8')))
}
