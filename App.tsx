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

    switch (mode) {
      case AppMode.Modeling:
        return <ModelingView model={model} />;
      case AppMode.Analyzing:
        return <AnalyzingView model={model} />;
      case AppMode.Structuring:
        return <StructuringView model={model} />;
      default:
        return <ModelingView model={model} />;
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
          />
        </>
      )}
    </div>
  );
};

export default App;
