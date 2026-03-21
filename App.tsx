'use client';

import React, { useEffect, useState } from 'react';
import { AppMode } from './types';
import { useAppStore } from './store';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import ModelingView from './components/ModelingView';
import AnalyzingView from './components/AnalyzingView';
import StructuringView from './components/StructuringView';
import ModelListView from './components/ModelListView';
import CreateNewModelModal from './components/CreateNewModelModal';
import HistoryPanel from './components/HistoryPanel';
import ConversationalAnalyst from './components/ConversationalAnalyst';
import { AuthPage } from './components/auth/AuthPage';
import { Scratchpad } from './components/Scratchpad';
import { AnalysisHistory } from './components/AnalysisHistory';

const App: React.FC = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const {
    model,
    mode,
    isLoading,
    isCreatingModel,
    availableModels,
    isChatAnalystOpen,
    initializeTheme,
    fetchAvailableModels,
    viewingSnapshot,
    clearViewingSnapshot,
  } = useAppStore();

  // Runs once on mount
  useEffect(() => {
    initializeTheme();
  }, []);
  
  // Fetch models when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableModels();
    }
  }, [isAuthenticated]);

  const renderModelContent = () => {
    if (!model) {
      return null;
    }

    // If viewing a snapshot, create a temporary model with snapshot data.
    // In Modeling mode, always use the live model (snapshots are read-only).
    const isModelingMode = mode === AppMode.Modeling;
    const displayModel = viewingSnapshot && !isModelingMode
      ? { ...model, Model: viewingSnapshot.elements_data }
      : model;

    switch (mode) {
      case AppMode.Modeling:
        // Entering Modeling mode while viewing a snapshot clears the snapshot view
        // to prevent unintentionally overwriting the live model with snapshot data.
        if (viewingSnapshot) {
          clearViewingSnapshot();
        }
        return <ModelingView model={displayModel} />;
      case AppMode.Analyzing:
        return (
          <div>
            {viewingSnapshot && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Viewing snapshot: {viewingSnapshot.snapshot_name || 'Unnamed'}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                    ({new Date(viewingSnapshot.snapshot_date).toLocaleDateString()})
                  </span>
                </div>
                <button
                  onClick={clearViewingSnapshot}
                  className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Back to Current
                </button>
              </div>
            )}
            <AnalyzingView model={displayModel} />
          </div>
        );
      case AppMode.Structuring:
        return (
          <div>
            {viewingSnapshot && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Viewing snapshot: {viewingSnapshot.snapshot_name || 'Unnamed'}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                    ({new Date(viewingSnapshot.snapshot_date).toLocaleDateString()})
                  </span>
                </div>
                <button
                  onClick={clearViewingSnapshot}
                  className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Back to Current
                </button>
              </div>
            )}
            <StructuringView model={displayModel} />
          </div>
        );
      default:
        return <ModelingView model={displayModel} />;
    }
  };

  // Show auth loading state
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-tandt-bg dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-tandt-primary"></div>
        <span className="ml-4 text-lg text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }
  
  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Show full-screen loader only on initial application load
  if (isLoading && availableModels.length === 0 && !model) {
      return (
        <div className="flex justify-center items-center h-screen bg-tandt-bg dark:bg-gray-900">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-tandt-primary"></div>
          <span className="ml-4 text-lg text-gray-500 dark:text-gray-400">Loading models...</span>
        </div>
      );
  }

  return (
    <div className="min-h-screen font-sans text-tandt-dark dark:text-gray-200">
      {!model ? (
        <>
            <ModelListView />
            {isCreatingModel && <CreateNewModelModal />}
        </>
      ) : (
        <>
          <Header 
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
          <main className="p-4 sm:p-6 lg:p-8">
            {renderModelContent()}
          </main>
          <HistoryPanel />
          {isChatAnalystOpen && <ConversationalAnalyst />}
          
          {/* Scratchpad panel */}
          <Scratchpad
            modelId={model.Idug}
            isOpen={isScratchpadOpen}
            onClose={() => setIsScratchpadOpen(false)}
          />
          
          {/* Analysis History panel */}
          <AnalysisHistory
            modelId={model.Idug}
            currentElementsData={model.Model}
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onRestoreSnapshot={(elementsData, snapshot) => {
              // Use the full snapshot object if provided, otherwise create minimal one
              const snapshotObj = snapshot || {
                id: 'temp',
                model_id: model.Idug,
                snapshot_name: 'Selected Snapshot',
                snapshot_date: new Date().toISOString(),
                elements_data: elementsData,
                summary_notes: null,
                created_at: new Date().toISOString(),
              };
              useAppStore.getState().viewSnapshot(snapshotObj);
              setIsHistoryOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default App;
