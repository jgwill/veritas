"use client"

import React, { useState } from 'react'
import { useAppStore } from '../store'
import type { AnalysisSnapshot } from '../types'

const SnapshotPanel: React.FC = () => {
  const model = useAppStore(state => state.model)
  const snapshots = useAppStore(state => state.snapshots)
  const isSnapshotPanelOpen = useAppStore(state => state.isSnapshotPanelOpen)
  const toggleSnapshotPanel = useAppStore(state => state.toggleSnapshotPanel)
  const viewSnapshot = useAppStore(state => state.viewSnapshot)
  const viewingSnapshot = useAppStore(state => state.viewingSnapshot)
  const enterCompareMode = useAppStore(state => state.enterCompareMode)
  const isCompareMode = useAppStore(state => state.isCompareMode)
  
  const [selectedForCompare, setSelectedForCompare] = useState<AnalysisSnapshot[]>([])

  if (!isSnapshotPanelOpen || !model) {
    return null
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString)
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"
    return Math.floor(seconds) + " seconds ago"
  }

  const handleSelectForCompare = (snapshot: AnalysisSnapshot) => {
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

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      enterCompareMode(selectedForCompare[0], selectedForCompare[1])
      setSelectedForCompare([])
    }
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isSnapshotPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleSnapshotPanel}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isSnapshotPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Analysis History</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Saved analysis snapshots over time</p>
            </div>
            <button 
              onClick={toggleSnapshotPanel}
              className="p-2 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <CloseIcon />
            </button>
          </div>

          {selectedForCompare.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedForCompare.length} selected for comparison
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedForCompare([])}
                    className="px-3 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Clear
                  </button>
                  {selectedForCompare.length === 2 && (
                    <button
                      onClick={handleCompare}
                      className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Compare
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-grow overflow-y-auto p-4">
            {snapshots.length > 0 ? (
              <ul className="space-y-3">
                {snapshots.map(snapshot => {
                  const isViewing = viewingSnapshot?.id === snapshot.id
                  const isSelectedForCompare = selectedForCompare.some(s => s.id === snapshot.id)
                  
                  return (
                    <li 
                      key={snapshot.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        isViewing 
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
                          : isSelectedForCompare
                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                            {snapshot.snapshot_name || 'Unnamed Snapshot'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={formatDate(snapshot.snapshot_date)}>
                            {formatTimeAgo(snapshot.snapshot_date)}
                          </p>
                          {snapshot.summary_notes && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {snapshot.summary_notes}
                            </p>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelectedForCompare}
                          onChange={() => handleSelectForCompare(snapshot)}
                          className="ml-3 mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          title="Select for comparison"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <button 
                          onClick={() => viewSnapshot(snapshot)}
                          className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            isViewing 
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {isViewing ? 'Viewing' : 'View Analysis'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                <HistoryIcon />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No snapshots yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Save snapshots from the Analyzing view to track your progress over time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default SnapshotPanel
