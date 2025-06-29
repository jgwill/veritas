
import React, { useMemo, useState } from 'react';
import { DigitalModel, DigitalElement, AppMode } from '../types';
import ElementCard from './ElementCard';
import { generateAnalysisSummary } from '../services/geminiService';
import { useAppStore } from '../store';

interface AnalyzingViewProps {
  model: DigitalModel;
}

const AnalyzingView: React.FC<AnalyzingViewProps> = ({ model }) => {
  const isDecisionModel = model.DigitalThinkingModelType === 1;
  const updateElement = useAppStore(state => state.updateElement);

  // State for AI summary
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const hasAnalysisData = useMemo(() => model.Model.some(el => el.TwoFlagAnswered), [model]);

  const handleGetSummary = async () => {
      setIsSummaryLoading(true);
      setSummaryError(null);
      setAiSummary(null);
      try {
          const summary = await generateAnalysisSummary(model);
          setAiSummary(summary);
      } catch (error: any) {
          setSummaryError(error.message || "An unknown error occurred.");
      } finally {
          setIsSummaryLoading(false);
      }
  };


  const decision = useMemo(() => {
    if (!isDecisionModel) return null;

    const sortedElements = [...model.Model].sort((a, b) => b.DominanceFactor - a.DominanceFactor);
    for (const element of sortedElements) {
      if (element.TwoFlagAnswered && !element.TwoFlag) {
        return { isYes: false, reason: `Decision is NO because '${element.DisplayName}' (a dominant factor) was evaluated as unacceptable.` };
      }
    }
    return { isYes: true, reason: 'All evaluated dominant criteria are acceptable.' };
  }, [model, isDecisionModel]);

  const AnalysisHeader = () => {
    const AiButton = ({ subtle = false }) => (
      <button
        onClick={handleGetSummary}
        disabled={isSummaryLoading}
        title="Get AI Summary"
        className={`inline-flex items-center justify-center ml-auto px-4 py-2 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait ${hasAnalysisData ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${subtle ? 'bg-white/60 dark:bg-black/20' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'}`}
      >
        {isSummaryLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div> : <SparklesIcon />}
        <span className="ml-2 hidden sm:inline">{isSummaryLoading ? 'Analyzing...' : 'AI Summary'}</span>
      </button>
    );

    if (isDecisionModel && decision) {
      return (
        <div className={`p-4 rounded-lg shadow-md mb-6 flex justify-between items-center ${decision.isYes ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
          <div className="flex-grow text-center">
            <h2 className="text-2xl font-bold">DECISION IS: {decision.isYes ? '->YES<-' : '->NO<-'}</h2>
            <p className="text-sm">{decision.reason}</p>
          </div>
          <div className="w-40 flex-shrink-0 text-right"> {/* Placeholder to prevent shift */}
            <AiButton subtle={true} />
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-tandt-dark dark:text-gray-100">Analysis Summary</h2>
          <p className="text-sm text-tandt-secondary dark:text-gray-400">Evaluate the current state and trend for each performance element.</p>
        </div>
        <div className="w-40 flex-shrink-0 text-right"> {/* Placeholder */}
            <AiButton />
        </div>
      </div>
    );
  };
  
  const AiSummaryCard = () => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-dashed border-purple-400 dark:border-purple-600">
          <div className="flex items-center mb-4">
              <SparklesIcon />
              <h3 className="ml-3 text-lg font-bold text-tandt-dark dark:text-gray-100">AI Analysis Insight</h3>
          </div>
          {isSummaryLoading && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                  <span className="ml-3">The AI is analyzing the data...</span>
              </div>
          )}
          {summaryError && <p className="text-red-600 dark:text-red-400">{summaryError}</p>}
          {aiSummary && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiSummary}</p>}
      </div>
  );

  return (
    <div>
      <AnalysisHeader />

      {(aiSummary || isSummaryLoading || summaryError) && <AiSummaryCard />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {model.Model.map((element) => (
          <ElementCard 
            key={element.Idug} 
            element={element} 
            mode={AppMode.Analyzing} 
            onUpdate={updateElement}
            modelType={model.DigitalThinkingModelType}
          />
        ))}
      </div>
    </div>
  );
};


// Icons needed for the new components
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.707 1.707A1 1 0 003 8v4a1 1 0 00.293.707L5 14.414V16a1 1 0 001 1h1.586l1.707 1.707A1 1 0 0012 17h4a1 1 0 00.707-.293l1.707-1.707H19a1 1 0 001-1v-1.586l1.707-1.707A1 1 0 0017 8V4a1 1 0 00-.293-.707L15 1.586V0a1 1 0 00-1-1h-1.586l-1.707-1.707A1 1 0 008 1H4a1 1 0 00-.707.293L1.586 3H0a1 1 0 00-1 1zm14 11.586l-1.293 1.293A1 1 0 0017 16v1a1 1 0 01-1 1h-1.586l-1.293 1.293A1 1 0 0110 19H6a1 1 0 01-.707-.293L4 17.414V19a1 1 0 01-1 1H1.586l-1.293 1.293A1 1 0 01-2 21H-6a1 1 0 01-.707-.293L-8 19.414V21a1 1 0 01-1 1h-1.586l-1.293 1.293A1 1 0 01-14 21H-18a1 1 0 01-.707-.293L-20 19.414V21" transform="translate(10, -5) rotate(15)" clipRule="evenodd" /></svg>;

export default AnalyzingView;
