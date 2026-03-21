'use client';

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getAuthToken } from '../services/authService'
import { History, Save, Calendar, ChevronRight, Loader2, X, Eye, GitCompare, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { AnalysisSnapshot, DigitalElement } from '../types'

interface AnalysisHistoryProps {
  modelId: string
  currentElementsData: any
  isOpen: boolean
  onClose: () => void
  onRestoreSnapshot?: (elementsData: any, snapshot?: AnalysisSnapshot) => void
}

export function AnalysisHistory({ 
  modelId, 
  currentElementsData, 
  isOpen, 
  onClose,
  onRestoreSnapshot 
}: AnalysisHistoryProps) {
  const [snapshots, setSnapshots] = useState<AnalysisSnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newSnapshotName, setNewSnapshotName] = useState('')
  const [newSnapshotNotes, setNewSnapshotNotes] = useState('')
  const [selectedSnapshot, setSelectedSnapshot] = useState<AnalysisSnapshot | null>(null)
  
  // Comparison state
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<AnalysisSnapshot[]>([])
  const [showCompareView, setShowCompareView] = useState(false)

  useEffect(() => {
    if (isOpen && modelId) {
      fetchSnapshots()
    }
  }, [isOpen, modelId])

  const fetchSnapshots = async () => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`/api/models/${modelId}/snapshots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSnapshots(data.snapshots || [])
      }
    } catch (error) {
      console.error('Error fetching snapshots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSnapshot = async () => {
    const token = getAuthToken()
    if (!token) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/models/${modelId}/snapshots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snapshotName: newSnapshotName || `Analysis ${new Date().toLocaleDateString()}`,
          elementsData: currentElementsData,
          summaryNotes: newSnapshotNotes || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSnapshots([data.snapshot, ...snapshots])
        setNewSnapshotName('')
        setNewSnapshotNotes('')
      }
    } catch (error) {
      console.error('Error saving snapshot:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEvaluationSummary = (elementsData: any[]) => {
    if (!Array.isArray(elementsData)) return { evaluated: 0, total: 0 }
    const evaluated = elementsData.filter(el => el.TwoFlagAnswered || el.ThreeFlagAnswered).length
    return { evaluated, total: elementsData.length }
  }

  const handleSelectForCompare = (snapshot: AnalysisSnapshot, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedForCompare(prev => {
      const isSelected = prev.some(s => s.id === snapshot.id)
      if (isSelected) {
        return prev.filter(s => s.id !== snapshot.id)
      }
      if (prev.length >= 2) {
        return [prev[1], snapshot]
      }
      return [...prev, snapshot]
    })
  }

  const handleStartCompare = () => {
    if (selectedForCompare.length === 2) {
      setShowCompareView(true)
    }
  }

  if (!isOpen) return null

  // Comparison View
  if (showCompareView && selectedForCompare.length === 2) {
    return (
      <CompareView 
        snapshot1={selectedForCompare[0]} 
        snapshot2={selectedForCompare[1]}
        onBack={() => {
          setShowCompareView(false)
          setSelectedForCompare([])
          setCompareMode(false)
        }}
        formatDate={formatDate}
      />
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-card border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Analysis History</h2>
        </div>
        <div className="flex items-center gap-2">
          {snapshots.length >= 2 && (
            <Button 
              variant={compareMode ? "default" : "outline"} 
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode)
                if (compareMode) {
                  setSelectedForCompare([])
                }
              }}
            >
              <GitCompare className="h-4 w-4 mr-1" />
              Compare
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Compare mode selection bar */}
      {compareMode && (
        <div className="p-3 bg-primary/10 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedForCompare.length === 0 && "Select 2 snapshots to compare"}
              {selectedForCompare.length === 1 && "Select 1 more snapshot"}
              {selectedForCompare.length === 2 && "Ready to compare"}
            </span>
            <div className="flex gap-2">
              {selectedForCompare.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedForCompare([])}
                >
                  Clear
                </Button>
              )}
              {selectedForCompare.length === 2 && (
                <Button
                  size="sm"
                  onClick={handleStartCompare}
                >
                  View Comparison
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save current state */}
      {!compareMode && (
        <div className="p-4 border-b border-border space-y-2">
          <h3 className="text-sm font-medium text-foreground mb-2">Save Current Analysis</h3>
          <Input
            placeholder="Snapshot name (optional)"
            value={newSnapshotName}
            onChange={(e) => setNewSnapshotName(e.target.value)}
            className="bg-background"
          />
          <textarea
            placeholder="Add notes about this analysis..."
            value={newSnapshotNotes}
            onChange={(e) => setNewSnapshotNotes(e.target.value)}
            className="w-full h-16 p-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="sm"
            onClick={saveSnapshot}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Snapshot
          </Button>
        </div>
      )}

      {/* Snapshots list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground text-sm">
            No snapshots yet. Save your first analysis snapshot above to track your progress over time.
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {snapshots.map((snapshot) => {
              const summary = getEvaluationSummary(snapshot.elements_data)
              const isSelectedForCompare = selectedForCompare.some(s => s.id === snapshot.id)
              
              return (
                <div
                  key={snapshot.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelectedForCompare
                      ? 'border-primary bg-primary/10'
                      : selectedSnapshot?.id === snapshot.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-background hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (compareMode) {
                      handleSelectForCompare(snapshot, { stopPropagation: () => {} } as React.MouseEvent)
                    } else {
                      setSelectedSnapshot(
                        selectedSnapshot?.id === snapshot.id ? null : snapshot
                      )
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={isSelectedForCompare}
                          onChange={(e) => handleSelectForCompare(snapshot, e as any)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      )}
                      <h4 className="font-medium text-sm text-foreground">
                        {snapshot.snapshot_name || 'Unnamed Snapshot'}
                      </h4>
                    </div>
                    {!compareMode && (
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                        selectedSnapshot?.id === snapshot.id ? 'rotate-90' : ''
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground ml-6">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(snapshot.snapshot_date)}</span>
                  </div>
                  
                  <div className="mt-2 text-xs ml-6">
                    <span className="text-primary font-medium">{summary.evaluated}</span>
                    <span className="text-muted-foreground">/{summary.total} elements evaluated</span>
                  </div>
                  
                  {!compareMode && selectedSnapshot?.id === snapshot.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {snapshot.summary_notes && (
                        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                          {snapshot.summary_notes}
                        </p>
                      )}
                      
                      {onRestoreSnapshot && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRestoreSnapshot(snapshot.elements_data, snapshot)
                          }}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View This Analysis
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Comparison View Component
function CompareView({ 
  snapshot1, 
  snapshot2, 
  onBack,
  formatDate 
}: { 
  snapshot1: AnalysisSnapshot
  snapshot2: AnalysisSnapshot
  onBack: () => void
  formatDate: (date: string) => string
}) {
  // Sort by date to show older first
  const [older, newer] = new Date(snapshot1.snapshot_date) < new Date(snapshot2.snapshot_date) 
    ? [snapshot1, snapshot2] 
    : [snapshot2, snapshot1]

  const getStateLabel = (element: DigitalElement) => {
    if (!element.TwoFlagAnswered) return 'Not evaluated'
    return element.TwoFlag ? 'Acceptable' : 'Unacceptable'
  }

  const getTrendLabel = (element: DigitalElement) => {
    if (!element.ThreeFlagAnswered) return 'Not evaluated'
    if (element.ThreeFlag === 1) return 'Improving'
    if (element.ThreeFlag === -1) return 'Declining'
    return 'Stable'
  }

  const getStateChange = (oldEl: DigitalElement | undefined, newEl: DigitalElement | undefined) => {
    if (!oldEl || !newEl) return null
    if (!oldEl.TwoFlagAnswered || !newEl.TwoFlagAnswered) return null
    
    if (oldEl.TwoFlag === newEl.TwoFlag) return 'same'
    if (!oldEl.TwoFlag && newEl.TwoFlag) return 'improved'
    if (oldEl.TwoFlag && !newEl.TwoFlag) return 'declined'
    return 'same'
  }

  // Build element comparison
  const olderElements = older.elements_data || []
  const newerElements = newer.elements_data || []
  
  const allElementIds = new Set([
    ...olderElements.map((e: DigitalElement) => e.Idug),
    ...newerElements.map((e: DigitalElement) => e.Idug)
  ])

  const comparisons = Array.from(allElementIds).map(id => {
    const oldEl = olderElements.find((e: DigitalElement) => e.Idug === id)
    const newEl = newerElements.find((e: DigitalElement) => e.Idug === id)
    return {
      id,
      name: oldEl?.DisplayName || newEl?.DisplayName || 'Unknown',
      oldEl,
      newEl,
      stateChange: getStateChange(oldEl, newEl)
    }
  })

  const improved = comparisons.filter(c => c.stateChange === 'improved').length
  const declined = comparisons.filter(c => c.stateChange === 'declined').length
  const unchanged = comparisons.filter(c => c.stateChange === 'same').length

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-card border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Snapshot Comparison</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-background rounded-lg border">
            <p className="text-xs text-muted-foreground">Older</p>
            <p className="font-medium text-sm">{older.snapshot_name || 'Unnamed'}</p>
            <p className="text-xs text-muted-foreground">{formatDate(older.snapshot_date)}</p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border">
            <p className="text-xs text-muted-foreground">Newer</p>
            <p className="font-medium text-sm">{newer.snapshot_name || 'Unnamed'}</p>
            <p className="text-xs text-muted-foreground">{formatDate(newer.snapshot_date)}</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">{improved} improved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-sm">{unchanged} unchanged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">{declined} declined</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">Element</th>
              <th className="text-center py-2 font-medium">Before</th>
              <th className="text-center py-2 font-medium">After</th>
              <th className="text-center py-2 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map(comp => (
              <tr key={comp.id} className="border-b border-border/50">
                <td className="py-3 font-medium">{comp.name}</td>
                <td className="py-3 text-center">
                  {comp.oldEl ? (
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        !comp.oldEl.TwoFlagAnswered 
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          : comp.oldEl.TwoFlag 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {getStateLabel(comp.oldEl)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  {comp.newEl ? (
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        !comp.newEl.TwoFlagAnswered 
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          : comp.newEl.TwoFlag 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {getStateLabel(comp.newEl)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  {comp.stateChange === 'improved' && (
                    <ArrowUp className="h-4 w-4 text-green-500 mx-auto" />
                  )}
                  {comp.stateChange === 'declined' && (
                    <ArrowDown className="h-4 w-4 text-red-500 mx-auto" />
                  )}
                  {comp.stateChange === 'same' && (
                    <Minus className="h-4 w-4 text-gray-400 mx-auto" />
                  )}
                  {!comp.stateChange && (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
