
import React from 'react';
import { DigitalElement, AppMode } from '../types';

interface ElementCardProps {
  element: DigitalElement;
  mode: AppMode;
  modelType: number;
  onUpdate?: (element: DigitalElement, description: string) => void;
  onCompare?: (element: DigitalElement) => void;
  onEdit?: (element: DigitalElement) => void;
  isComparing?: boolean;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, mode, modelType, onUpdate, onCompare, onEdit, isComparing }) => {
  const handleEvaluation = (evaluation: 'accepted' | 'rejected') => {
    if (onUpdate) {
      const description = `Set status of '${element.DisplayName}' to '${evaluation}'`;
      onUpdate({ ...element, TwoFlag: evaluation === 'accepted', TwoFlagAnswered: true }, description);
    }
  };

  const handleTrend = (trend: -1 | 0 | 1) => {
    if (onUpdate) {
      const trendText = trend === 1 ? 'improving' : trend === -1 ? 'declining' : 'stable';
      const description = `Set trend of '${element.DisplayName}' to '${trendText}'`;
      onUpdate({ ...element, ThreeFlag: trend, ThreeFlagAnswered: true }, description);
    }
  };

  const cardBg = element.Question 
    ? 'bg-tandt-card-alt-bg dark:bg-yellow-900/20' 
    : 'bg-tandt-card-bg dark:bg-gray-800';
  const borderColor = isComparing ? 'border-tandt-primary' : 'border-tandt-border dark:border-gray-700';

  return (
    <div className={`border-2 ${borderColor} rounded-lg shadow-sm transition-all duration-200 ${cardBg} flex flex-col`}>
      <div className="bg-tandt-card-header dark:bg-gray-700/50 p-3 border-b border-tandt-border dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-tandt-dark dark:text-gray-200 truncate flex-grow">{element.DisplayName}</h3>
        {mode === AppMode.Modeling && onEdit && (
            <button onClick={() => onEdit(element)} className="ml-2 text-gray-400 dark:text-gray-500 hover:text-tandt-primary dark:hover:text-white transition-colors">
                <PencilIcon />
            </button>
        )}
      </div>
      <div className="p-3 text-xs text-tandt-secondary dark:text-gray-400 flex-grow">
        <p className="h-16 overflow-y-auto">{element.Description || 'No description provided.'}</p>
      </div>
      <div className="p-2 border-t border-tandt-border dark:border-gray-700 bg-tandt-light dark:bg-gray-800/50 rounded-b-lg">
        {mode === AppMode.Modeling && modelType === 1 && ( // Only show for Decision Making Models
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-tandt-secondary dark:text-gray-400">Dominance:</span>
            <span className="text-sm font-bold text-tandt-primary bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-full px-2.5 py-0.5">{element.DominanceFactor}</span>
            <button
                onClick={() => onCompare && onCompare(element)}
                className={`px-3 py-1 text-xs font-semibold rounded-md ${isComparing ? 'bg-tandt-primary text-white' : 'bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 hover:bg-gray-300'}`}
                disabled={isComparing}
            >
                {isComparing ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        )}
        {mode === AppMode.Modeling && modelType !== 1 && (
             <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-1">
                Define elements for review.
             </div>
        )}
        {mode === AppMode.Analyzing && (
          <div className="flex items-center justify-around">
            <IconButton active={element.TwoFlagAnswered && element.TwoFlag} onClick={() => handleEvaluation('accepted')} color="green" icon={<CheckIcon />} />
            <IconButton active={element.TwoFlagAnswered && !element.TwoFlag} onClick={() => handleEvaluation('rejected')} color="red" icon={<XIcon />} />
            
            {modelType === 2 && ( // Performance Review Model
              <>
                <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
                <IconButton active={element.ThreeFlagAnswered && element.ThreeFlag === 1} onClick={() => handleTrend(1)} color="green" icon={<TrendingUpIcon />} />
                <IconButton active={element.ThreeFlagAnswered && element.ThreeFlag === 0} onClick={() => handleTrend(0)} color="yellow" icon={<MinusIcon />} />
                <IconButton active={element.ThreeFlagAnswered && element.ThreeFlag === -1} onClick={() => handleTrend(-1)} color="red" icon={<TrendingDownIcon />} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const IconButton: React.FC<{ active: boolean; onClick: () => void; color: string; icon: React.ReactNode }> = ({ active, onClick, color, icon }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${active 
            ? `bg-${color}-500 text-white shadow-md` 
            : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-${color}-100 dark:hover:bg-gray-600`
        }`}
    >
        {icon}
    </button>
);


// Icons
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>;
const TrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;


export default ElementCard;