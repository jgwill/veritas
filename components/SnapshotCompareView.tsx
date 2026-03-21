"use client"

import React, { useMemo } from 'react'
import { useAppStore } from '../store'
import type { AnalysisSnapshot, DigitalElement } from '../types'

interface ElementComparison {
  name: string
  description: string | null
  snapshot1: {
    state: 'acceptable' | 'unacceptable' | 'not-set'
    trend: 'improving' | 'stable' | 'declining' | 'not-set'
  }
  snapshot2: {
    state: 'acceptable' | 'unacceptable' | 'not-set'
    trend: 'improving' | 'stable' | 'declining' | 'not-set'
  }
  stateChange: 'improved' | 'declined' | 'unchanged' | 'unknown'
  trendChange: 'improved' | 'declined' | 'unchanged' | 'unknown'
}

const SnapshotCompareView: React.FC = () => {
  const comparingSnapshots = useAppStore(state => state.comparingSnapshots)
  const exitCompareMode = useAppStore(state => state.exitCompareMode)
  const model = useAppStore(state => state.model)

  const [snapshot1, snapshot2] = comparingSnapshots

  const comparisons = useMemo<ElementComparison[]>(() => {
    if (!snapshot1 || !snapshot2) return []

    const elements1 = snapshot1.elements_data || []
    const elements2 = snapshot2.elements_data || []

    // Build a map by element name for comparison
    const map1 = new Map<string, DigitalElement>()
    const map2 = new Map<string, DigitalElement>()
    
    elements1.forEach(el => map1.set(el.DisplayName, el))
    elements2.forEach(el => map2.set(el.DisplayName, el))

    const allNames = new Set([...map1.keys(), ...map2.keys()])

    const getState = (el: DigitalElement | undefined) => {
      if (!el || !el.TwoFlagAnswered) return 'not-set' as const
      return el.TwoFlag ? 'acceptable' as const : 'unacceptable' as const
    }

    const getTrend = (el: DigitalElement | undefined) => {
      if (!el || !el.ThreeFlagAnswered) return 'not-set' as const
      if (el.ThreeFlag === 1) return 'improving' as const
      if (el.ThreeFlag === -1) return 'declining' as const
      return 'stable' as const
    }

    const getStateChange = (s1: string, s2: string) => {
      if (s1 === 'not-set' || s2 === 'not-set') return 'unknown' as const
      if (s1 === 'unacceptable' && s2 === 'acceptable') return 'improved' as const
      if (s1 === 'acceptable' && s2 === 'unacceptable') return 'declined' as const
      return 'unchanged' as const
    }

    const getTrendChange = (t1: string, t2: string) => {
      if (t1 === 'not-set' || t2 === 'not-set') return 'unknown' as const
      const trendValue = { declining: -1, stable: 0, improving: 1 } as const
      const v1 = trendValue[t1 as keyof typeof trendValue] ?? 0
      const v2 = trendValue[t2 as keyof typeof trendValue] ?? 0
      if (v2 > v1) return 'improved' as const
      if (v2 < v1) return 'declined' as const
      return 'unchanged' as const
    }

    return Array.from(allNames).map(name => {
      const el1 = map1.get(name)
      const el2 = map2.get(name)
      
      const state1 = getState(el1)
      const state2 = getState(el2)
      const trend1 = getTrend(el1)
      const trend2 = getTrend(el2)

      return {
        name,
        description: el1?.Description || el2?.Description || null,
        snapshot1: { state: state1, trend: trend1 },
        snapshot2: { state: state2, trend: trend2 },
        stateChange: getStateChange(state1, state2),
        trendChange: getTrendChange(trend1, trend2),
      }
    })
  }, [snapshot1, snapshot2])

  const summary = useMemo(() => {
    let improved = 0
    let declined = 0
    let unchanged = 0

    comparisons.forEach(c => {
      if (c.stateChange === 'improved' || c.trendChange === 'improved') improved++
      else if (c.stateChange === 'declined' || c.trendChange === 'declined') declined++
      else if (c.stateChange === 'unchanged' && c.trendChange === 'unchanged') unchanged++
    })

    return { improved, declined, unchanged }
  }, [comparisons])

  if (!snapshot1 || !snapshot2) {
    return null
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const StateIndicator = ({ state }: { state: string }) => {
    if (state === 'not-set') return <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Not Set</span>
    if (state === 'acceptable') return <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">Acceptable</span>
    return <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Unacceptable</span>
  }

  const TrendIndicator = ({ trend }: { trend: string }) => {
    if (trend === 'not-set') return <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Not Set</span>
    if (trend === 'improving') return <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">Improving</span>
    if (trend === 'declining') return <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Declining</span>
    return <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">Stable</span>
  }

  const ChangeIndicator = ({ change }: { change: string }) => {
    if (change === 'unknown') return null
    if (change === 'improved') return <span className="text-green-600 dark:text-green-400"><ArrowUpIcon /></span>
    if (change === 'declined') return <span className="text-red-600 dark:text-red-400"><ArrowDownIcon /></span>
    return <span className="text-gray-400"><MinusIcon /></span>
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Snapshot Comparison</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comparing progression between two analysis points
          </p>
        </div>
        <button
          onClick={exitCompareMode}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Exit Compare
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.improved}</p>
          <p className="text-sm text-green-700 dark:text-green-300">Improved</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{summary.unchanged}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Unchanged</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{summary.declined}</p>
          <p className="text-sm text-red-700 dark:text-red-300">Declined</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">Element</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white" colSpan={2}>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  {snapshot1.snapshot_name || 'Earlier'}
                </div>
                <div>{formatDate(snapshot1.snapshot_date)}</div>
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">Change</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white" colSpan={2}>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  {snapshot2.snapshot_name || 'Later'}
                </div>
                <div>{formatDate(snapshot2.snapshot_date)}</div>
              </th>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
              <th></th>
              <th className="py-1 px-2 font-normal">State</th>
              <th className="py-1 px-2 font-normal">Trend</th>
              <th></th>
              <th className="py-1 px-2 font-normal">State</th>
              <th className="py-1 px-2 font-normal">Trend</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp, idx) => (
              <tr 
                key={comp.name} 
                className={`border-b border-gray-100 dark:border-gray-700/50 ${
                  comp.stateChange === 'improved' || comp.trendChange === 'improved'
                    ? 'bg-green-50/50 dark:bg-green-900/10'
                    : comp.stateChange === 'declined' || comp.trendChange === 'declined'
                      ? 'bg-red-50/50 dark:bg-red-900/10'
                      : ''
                }`}
              >
                <td className="py-3 px-2">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{comp.name}</p>
                  {comp.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{comp.description}</p>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  <StateIndicator state={comp.snapshot1.state} />
                </td>
                <td className="py-3 px-2 text-center">
                  <TrendIndicator trend={comp.snapshot1.trend} />
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ChangeIndicator change={comp.stateChange} />
                    <ChangeIndicator change={comp.trendChange} />
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <StateIndicator state={comp.snapshot2.state} />
                </td>
                <td className="py-3 px-2 text-center">
                  <TrendIndicator trend={comp.snapshot2.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
)

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
)

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
)

export default SnapshotCompareView
