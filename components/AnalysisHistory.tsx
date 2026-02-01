'use client';

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getAuthToken } from '../services/authService'
import { History, Save, Calendar, ChevronRight, Loader2, X, Eye } from 'lucide-react'

interface Snapshot {
  id: string
  model_id: string
  snapshot_name: string | null
  snapshot_date: string
  elements_data: any
  summary_notes: string | null
  created_at: string
}

interface AnalysisHistoryProps {
  modelId: string
  currentElementsData: any
  isOpen: boolean
  onClose: () => void
  onRestoreSnapshot?: (elementsData: any) => void
}

export function AnalysisHistory({ 
  modelId, 
  currentElementsData, 
  isOpen, 
  onClose,
  onRestoreSnapshot 
}: AnalysisHistoryProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newSnapshotName, setNewSnapshotName] = useState('')
  const [newSnapshotNotes, setNewSnapshotNotes] = useState('')
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null)

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
        setSnapshots(data.snapshots)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-card border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Analysis History</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Save current state */}
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
              return (
                <div
                  key={snapshot.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSnapshot?.id === snapshot.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSnapshot(
                    selectedSnapshot?.id === snapshot.id ? null : snapshot
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-foreground">
                      {snapshot.snapshot_name || 'Unnamed Snapshot'}
                    </h4>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                      selectedSnapshot?.id === snapshot.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(snapshot.snapshot_date)}</span>
                  </div>
                  
                  <div className="mt-2 text-xs">
                    <span className="text-primary font-medium">{summary.evaluated}</span>
                    <span className="text-muted-foreground">/{summary.total} elements evaluated</span>
                  </div>
                  
                  {selectedSnapshot?.id === snapshot.id && (
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
                            onRestoreSnapshot(snapshot.elements_data)
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
