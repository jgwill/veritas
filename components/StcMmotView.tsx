'use client'

// Live STC / MMOT surface — the veritas window onto the seat's chart store.
//
// Modeled on the stateloom live-canvas shape (owned here, no package consumed):
// - cold load and live change flow through the SAME loader (blueprint E5),
//   which is also the resync on SSE reconnect — the rejoin stateloom lacks
// - the store is truth; this surface is read-only over it (E1/E9 by structure)
// - the demo path refetches the whole chart per change; granular ops are the
//   named follow-up (E3), not silently pretended.

import { useCallback, useEffect, useRef, useState } from 'react'

interface StcActionStep {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  telescoped: boolean
}
interface StcMmotEvaluation {
  phase: string
  assessment: string
  direction?: string
  timestamp?: string
}
interface StcMmotBeat {
  name: string
  observations: string[]
  createdAt?: string
}
interface StcChartView {
  chartId: string
  desiredOutcome: string
  currentReality: string[]
  dueDate?: string
  parentChart?: string
  actionSteps: StcActionStep[]
  mmotEvaluations: StcMmotEvaluation[]
  mmotBeats: StcMmotBeat[]
  revision: string
}

const PHASE_LABEL: Record<string, string> = {
  acknowledge: 'Acknowledge the Truth',
  analyze: 'Analyze How It Got Here',
  update: 'Update the Chart',
  recommit: 'Recommit or Redirect',
  full: 'Full Evaluation',
}

function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString()
}

export function StcMmotView({ chartId }: { chartId: string }) {
  const [chart, setChart] = useState<StcChartView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [lastEvent, setLastEvent] = useState<string>('')
  const revisionRef = useRef('')

  // ONE loader for cold load, live change, and reconnect resync (E5).
  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/stc/${chartId}`, { cache: 'no-store' })
      const body = await res.json()
      if (!res.ok) {
        setError(body?.error ?? `HTTP ${res.status}`)
        return
      }
      setError(null)
      revisionRef.current = body.chart.revision ?? ''
      setChart(body.chart)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'fetch failed')
    }
  }, [chartId])

  useEffect(() => {
    load()
    const es = new EventSource('/api/stc/watch')
    es.addEventListener('open', () => {
      setLive(true)
      // Reconnect = resync through the same path as cold load; missed
      // change events cannot leave the surface quietly stale.
      load()
    })
    es.addEventListener('change', (ev) => {
      setLastEvent(new Date().toLocaleTimeString())
      try {
        const data = JSON.parse((ev as MessageEvent).data)
        if (data.revision && data.revision === revisionRef.current) return
      } catch {
        // unparseable event data — refetch anyway
      }
      load()
    })
    es.addEventListener('error', () => setLive(false))
    return () => es.close()
  }, [chartId, load])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="max-w-xl border border-red-800 bg-red-950/40 rounded-lg p-6">
          <div className="text-red-300 font-semibold mb-2">
            The surface cannot read its store
          </div>
          <div className="text-sm text-red-200/80 font-mono break-all">{error}</div>
        </div>
      </div>
    )
  }

  if (!chart) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
        <span className="animate-pulse">reading the chart store…</span>
      </div>
    )
  }

  const done = chart.actionSteps.filter((s) => s.completed).length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center gap-4">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            live ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
          }`}
          title={live ? 'live — store watched' : 'not connected'}
        />
        <h1 className="text-sm font-mono text-slate-300">{chart.chartId}</h1>
        {chart.dueDate && (
          <span className="text-xs text-slate-500">due {chart.dueDate.slice(0, 10)}</span>
        )}
        {chart.parentChart && (
          <span className="text-xs text-slate-500">↑ telescoped from {chart.parentChart}</span>
        )}
        <span className="ml-auto text-xs text-slate-600">
          {lastEvent ? `last change ${lastEvent}` : 'no changes yet this session'}
        </span>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* the tension, held visibly: DO above, CR below */}
        <section className="lg:col-span-2 space-y-4">
          <div className="border border-emerald-900/60 bg-emerald-950/20 rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-widest text-emerald-500 mb-2">
              Desired Outcome
            </div>
            <p className="text-lg leading-relaxed text-emerald-50">{chart.desiredOutcome}</p>
          </div>

          <div className="flex items-center gap-3 px-2 text-slate-600">
            <div className="flex-1 border-t border-dashed border-slate-700" />
            <span className="text-[11px] uppercase tracking-widest">structural tension</span>
            <div className="flex-1 border-t border-dashed border-slate-700" />
          </div>

          <div className="border border-sky-900/60 bg-sky-950/20 rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-widest text-sky-500 mb-2">
              Current Reality · {chart.currentReality.length} observation
              {chart.currentReality.length === 1 ? '' : 's'}
            </div>
            <ul className="space-y-3">
              {chart.currentReality.map((obs, i) => {
                const isMmot = obs.startsWith('[MMOT')
                return (
                  <li
                    key={i}
                    className={`text-sm leading-relaxed rounded-md p-3 ${
                      isMmot
                        ? 'bg-amber-950/40 border border-amber-800/60 text-amber-100'
                        : 'bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {obs}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* action steps */}
          <div className="border border-slate-800 rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-3">
              Action Steps · {done}/{chart.actionSteps.length} complete
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {chart.actionSteps.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg border p-3 text-sm leading-snug ${
                    s.completed
                      ? 'border-emerald-900 bg-emerald-950/30 text-emerald-200/80'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{s.completed ? '✅' : '🎯'}</span>
                    <span>{s.title}</span>
                  </div>
                  <div className="mt-2 flex gap-3 text-[11px] text-slate-500 font-mono">
                    {s.telescoped && <span>telescoped</span>}
                    {s.dueDate && <span>due {s.dueDate.slice(0, 10)}</span>}
                  </div>
                </div>
              ))}
              {chart.actionSteps.length === 0 && (
                <div className="text-sm text-slate-600">no action steps yet</div>
              )}
            </div>
          </div>
        </section>

        {/* MMOT rail */}
        <aside className="space-y-4">
          <div className="border border-amber-900/60 bg-amber-950/10 rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-widest text-amber-500 mb-3">
              Moment of Truth · {chart.mmotEvaluations.length} phase
              {chart.mmotEvaluations.length === 1 ? '' : 's'}
            </div>
            {chart.mmotEvaluations.length === 0 && (
              <p className="text-sm text-slate-500">
                No evaluation yet. When the seat runs{' '}
                <code className="text-amber-400/80">perform_mmot_evaluation</code> against
                this chart, its phases appear here as they happen.
              </p>
            )}
            <ol className="space-y-3">
              {chart.mmotEvaluations.map((ev, i) => (
                <li key={i} className="border-l-2 border-amber-700 pl-3">
                  <div className="text-xs font-semibold text-amber-300">
                    {PHASE_LABEL[ev.phase] ?? ev.phase}
                    {ev.direction && (
                      <span className="ml-2 text-amber-500/80">→ {ev.direction}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{ev.assessment}</p>
                  <div className="text-[11px] text-slate-600 mt-1">{fmtDate(ev.timestamp)}</div>
                </li>
              ))}
            </ol>
          </div>

          {chart.mmotBeats.length > 0 && (
            <div className="border border-slate-800 rounded-xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-3">
                Evaluation Beats
              </div>
              <ul className="space-y-3">
                {chart.mmotBeats.map((b) => (
                  <li key={b.name} className="text-sm text-slate-400 leading-relaxed">
                    {b.observations.map((o, i) => (
                      <p key={i}>{o}</p>
                    ))}
                    <div className="text-[11px] text-slate-600 mt-1">{fmtDate(b.createdAt)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
