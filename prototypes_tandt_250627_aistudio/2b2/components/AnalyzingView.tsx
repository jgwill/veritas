
import React, { useMemo } from 'react';
import { DigitalModel, DigitalElement, AppMode } from '../types';
import ElementCard from './ElementCard';

interface AnalyzingViewProps {
  model: DigitalModel;
  onUpdateElement: (element: DigitalElement) => void;
}

const AnalyzingView: React.FC<AnalyzingViewProps> = ({ model, onUpdateElement }) => {
  const isDecisionModel = model.DigitalThinkingModelType === 1;

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
    if (isDecisionModel && decision) {
      return (
        <div className={`p-4 rounded-lg shadow-md mb-6 text-center ${decision.isYes ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
          <h2 className="text-2xl font-bold">DECISION IS: {decision.isYes ? '->YES<-' : '->NO<-'}</h2>
          <p className="text-sm">{decision.reason}</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold text-tandt-dark dark:text-gray-100">Analysis Summary</h2>
        <p className="text-sm text-tandt-secondary dark:text-gray-400">Evaluate the current state and trend for each performance element.</p>
      </div>
    );
  };

  return (
    <div>
      <AnalysisHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {model.Model.map((element) => (
          <ElementCard 
            key={element.Idug} 
            element={element} 
            mode={AppMode.Analyzing} 
            onUpdate={onUpdateElement}
            modelType={model.DigitalThinkingModelType}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalyzingView;
