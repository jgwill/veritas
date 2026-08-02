// STC chart-store reader — the read half of the live MMOT surface.
//
// Truth is the coaia-narrative JSONL store written by the seat's configured MCP
// (structural tension charts + MMOT evaluations). Veritas RENDERS it; it never
// writes it. Store path arrives by env (VERITAS_STC_STORE) — one canonical
// document id injected into every process, per the stateloom imitation
// blueprint (E8). No stateloom package is consumed; the shape is modeled.
//
// The parser tolerates a torn tail line: the store is rewritten whole by
// saveGraph, so a mid-write read may end on a partial JSON line. Every line is
// parsed independently and bad lines are skipped, never fatal.

import { promises as fs } from 'fs'

export interface StcActionStep {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  telescoped: boolean
  updatedAt?: string
}

export interface StcMmotEvaluation {
  phase: string
  assessment: string
  direction?: string
  timestamp?: string
}

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
  /** Revision token derived from truth content (max metadata.updatedAt across
   *  the chart's own entities) — never a file mtime (E1). */
  revision: string
}

interface StoreEntity {
  name: string
  entityType: string
  observations?: string[]
  metadata?: Record<string, unknown>
  type: string
}

export function storePath(): string | null {
  const p = process.env.VERITAS_STC_STORE
  return p && p.length > 0 ? p : null
}

/** Parse the JSONL store; last line wins per entity name. */
async function readEntities(path: string): Promise<Map<string, StoreEntity>> {
  const raw = await fs.readFile(path, 'utf8')
  const entities = new Map<string, StoreEntity>()
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue
    try {
      const obj = JSON.parse(line)
      if (obj && obj.type === 'entity' && typeof obj.name === 'string') {
        entities.set(obj.name, obj as StoreEntity)
      }
    } catch {
      // torn tail or foreign line — skip, never fatal
    }
  }
  return entities
}

function meta(e: StoreEntity | undefined): Record<string, unknown> {
  return (e && e.metadata) || {}
}

function metaStr(e: StoreEntity | undefined, key: string): string | undefined {
  const v = meta(e)[key]
  return typeof v === 'string' ? v : undefined
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
  const entities = await readEntities(path)

  const chart = entities.get(`${chartId}_chart`)
  if (!chart) return null

  const involved: (StoreEntity | undefined)[] = [chart]

  const desired = entities.get(`${chartId}_desired_outcome`)
  const reality = entities.get(`${chartId}_current_reality`)
  involved.push(desired, reality)

  const actionSteps: StcActionStep[] = []
  for (const e of entities.values()) {
    if (e.entityType === 'action_step' && meta(e)['chartId'] === chartId) {
      involved.push(e)
      actionSteps.push({
        id: e.name,
        title: e.observations?.[0] ?? e.name,
        completed: meta(e)['completionStatus'] === true,
        dueDate: metaStr(e, 'dueDate'),
        telescoped: false,
        updatedAt: metaStr(e, 'updatedAt'),
      })
    }
    // Telescoped children are full charts pointing back at this one.
    if (
      e.entityType === 'structural_tension_chart' &&
      meta(e)['parentChart'] === chartId
    ) {
      involved.push(e)
      const childId = metaStr(e, 'chartId') ?? e.name.replace(/_chart$/, '')
      const childOutcome = entities.get(`${childId}_desired_outcome`)
      actionSteps.push({
        id: childId,
        title: childOutcome?.observations?.[0] ?? childId,
        completed: meta(e)['completionStatus'] === true,
        dueDate: metaStr(e, 'dueDate'),
        telescoped: true,
        updatedAt: metaStr(e, 'updatedAt'),
      })
    }
  }
  actionSteps.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  const mmotBeats: StcMmotBeat[] = []
  for (const e of entities.values()) {
    if (
      e.entityType === 'narrative_beat' &&
      e.name.startsWith(`${chartId}_mmot_`)
    ) {
      involved.push(e)
      mmotBeats.push({
        name: e.name,
        observations: e.observations ?? [],
        createdAt: metaStr(e, 'createdAt'),
      })
    }
  }
  mmotBeats.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))

  const rawEvals = meta(chart)['mmotEvaluations']
  const mmotEvaluations: StcMmotEvaluation[] = Array.isArray(rawEvals)
    ? rawEvals.map((ev) => ({
        phase: String((ev as Record<string, unknown>)?.['phase'] ?? ''),
        assessment: String((ev as Record<string, unknown>)?.['assessment'] ?? ''),
        direction:
          typeof (ev as Record<string, unknown>)?.['direction'] === 'string'
            ? String((ev as Record<string, unknown>)['direction'])
            : undefined,
        timestamp:
          typeof (ev as Record<string, unknown>)?.['timestamp'] === 'string'
            ? String((ev as Record<string, unknown>)['timestamp'])
            : undefined,
      }))
    : []

  let revision = ''
  for (const e of involved) {
    const u = metaStr(e, 'updatedAt') ?? metaStr(e, 'createdAt') ?? ''
    if (u > revision) revision = u
  }

  return {
    chartId,
    desiredOutcome: desired?.observations?.[0] ?? '',
    currentReality: reality?.observations ?? [],
    dueDate: metaStr(chart, 'dueDate'),
    parentChart: metaStr(chart, 'parentChart'),
    actionSteps,
    mmotEvaluations,
    mmotBeats,
    revision,
  }
}

/** Cheap revision scan for the watch route: max updatedAt across the whole
 *  store. Coarser than per-chart (an unrelated chart bumps it), which costs at
 *  most one redundant client refetch — honest and simple. */
export async function storeRevision(path: string): Promise<string> {
  const raw = await fs.readFile(path, 'utf8')
  let revision = ''
  for (const line of raw.split('\n')) {
    // fast scan without full JSON parse
    const m = line.match(/"updatedAt":"([^"]+)"/g)
    if (!m) continue
    for (const hit of m) {
      const v = hit.slice(13, -1)
      if (v > revision) revision = v
    }
  }
  return revision
}
