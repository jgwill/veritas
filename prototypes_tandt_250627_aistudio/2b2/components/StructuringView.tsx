
import React, { useMemo, useState } from 'react';
import { DigitalModel, DigitalElement } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useAppStore } from '../store';

interface StructuringViewProps {
  model: DigitalModel;
}

// Component for Decision Making Model (Type 1)
const DecisionDashboard: React.FC<{ model: DigitalModel }> = ({ model }) => {
  const theme = useAppStore(state => state.theme);
  
  const chartData = useMemo(() => {
    return [...model.Model]
      .sort((a, b) => a.DominanceFactor - b.DominanceFactor)
      .map(el => ({
        name: el.DisplayName,
        Dominance: el.DominanceFactor,
      }));
  }, [model]);

  const rankedElements = useMemo(() => {
    return [...model.Model].sort((a, b) => b.DominanceFactor - a.DominanceFactor);
  }, [model]);
  
  const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const labelColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4 text-tandt-dark dark:text-gray-100">Element Dominance Chart</h3>
        <ResponsiveContainer width="100%" height={Math.max(400, model.Model.length * 40)}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'} />
            <XAxis type="number" stroke={tickColor} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fill: tickColor }} interval={0} />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                }} 
            />
            <Legend wrapperStyle={{ color: tickColor }}/>
            <Bar dataKey="Dominance" fill="#0D6EFD">
               <LabelList dataKey="Dominance" position="right" style={{ fill: labelColor }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
         <h3 className="font-semibold mb-4 text-tandt-dark dark:text-gray-100">Dominant Mandatory Factors</h3>
         <ol className="space-y-2">
          {rankedElements.map((el, index) => (
              <li key={el.Idug} className="flex items-center justify-between text-sm p-2 rounded-md even:bg-gray-50 dark:even:bg-gray-700/50">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{index + 1}. {el.DisplayName}</span>
                  <span className="font-bold text-tandt-primary bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-full px-2.5 py-0.5">{el.DominanceFactor}</span>
              </li>
          ))}
         </ol>
      </div>
    </div>
  );
};

// Component for Performance Review Model (Type 2)
const PerformanceDashboard: React.FC<{ model: DigitalModel }> = ({ model }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Summary');
  const sortedElements = useMemo(() => {
    return [...model.Model].sort((a, b) => {
        // Primary sort: unacceptable vs acceptable
        const aIsUnacceptable = a.TwoFlagAnswered && !a.TwoFlag;
        const bIsUnacceptable = b.TwoFlagAnswered && !b.TwoFlag;
        if (aIsUnacceptable && !bIsUnacceptable) return -1;
        if (!aIsUnacceptable && bIsUnacceptable) return 1;

        // Secondary sort: trend (getting worse > same > getting better)
        const aTrend = a.ThreeFlagAnswered ? a.ThreeFlag : 0;
        const bTrend = b.ThreeFlagAnswered ? b.ThreeFlag : 0;
        if (aTrend !== bTrend) return aTrend - bTrend; // -1 (worse) comes before 0 and 1

        return 0;
    });
  }, [model]);

  const { tiers, textToCopy } = useMemo(() => {
    const tierConfig: { [key: string]: { label: string; elements: DigitalElement[]; color: string } } = {
        A: { label: 'Critical Focus', elements: [], color: 'text-red-500 dark:text-red-400' },
        B: { label: 'Urgent Focus', elements: [], color: 'text-orange-500 dark:text-orange-400' },
        C: { label: 'Proactive Watch', elements: [], color: 'text-yellow-500 dark:text-yellow-400' },
        D: { label: 'Monitor', elements: [], color: 'text-blue-500 dark:text-blue-400' },
        E: { label: 'Maintain', elements: [], color: 'text-green-500 dark:text-green-400' },
        Uncategorized: { label: 'Not Evaluated', elements: [], color: 'text-gray-500 dark:text-gray-400' }
    };

    let textOutput = `Digital Performance Review: Focus Hierarchy\n${'='.repeat(40)}\n\n`;
    let elementCounter = 1;

    sortedElements.forEach(el => {
        if (!el.TwoFlagAnswered) {
            tierConfig.Uncategorized.elements.push(el);
            return;
        }

        const isUnacceptable = !el.TwoFlag;
        const isAcceptable = el.TwoFlag;
        const isDeclining = el.ThreeFlagAnswered && el.ThreeFlag === -1;
        const isStable = el.ThreeFlagAnswered && el.ThreeFlag === 0;
        const isImproving = el.ThreeFlagAnswered && el.ThreeFlag === 1;

        if (isUnacceptable && isDeclining) tierConfig.A.elements.push(el);
        else if (isUnacceptable) tierConfig.B.elements.push(el);
        else if (isAcceptable && isDeclining) tierConfig.C.elements.push(el);
        else if (isAcceptable && isStable) tierConfig.D.elements.push(el);
        else if (isAcceptable && isImproving) tierConfig.E.elements.push(el);
        else tierConfig.Uncategorized.elements.push(el);
    });
    
    Object.entries(tierConfig).forEach(([key, tierData]) => {
        if (tierData.elements.length > 0) {
            textOutput += `TIER ${key}: ${tierData.label.toUpperCase()}\n`;
            tierData.elements.forEach(el => {
                textOutput += `${elementCounter}::${key}:${el.DisplayName}\n`;
                elementCounter++;
            });
            textOutput += '\n';
        }
    });

    return { tiers: tierConfig, textToCopy: textOutput };
  }, [sortedElements]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy Summary'), 2000);
    });
  };

  const getPerformanceItemStyle = (element: DigitalElement) => {
    const isUnacceptable = element.TwoFlagAnswered && !element.TwoFlag;
    const trend = element.ThreeFlagAnswered ? element.ThreeFlag : 0;

    if (isUnacceptable && trend === -1) return 'bg-red-100 dark:bg-red-900/40 border-l-4 border-red-500 dark:border-red-600'; // Critical
    if (isUnacceptable) return 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 dark:border-orange-600'; // Urgent
    if (trend === -1) return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-600'; // Warning
    if (trend === 1) return 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-700'; // Good
    return 'bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700'; // Neutral
  };

  const TrendIndicator = ({ element }: { element: DigitalElement }) => {
    if (!element.ThreeFlagAnswered) {
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Not Set</span>;
    }
    switch (element.ThreeFlag) {
        case 1:
            return <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><TrendingUpIcon/> Improving</span>;
        case -1:
            return <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><TrendingDownIcon/> Declining</span>;
        default:
            return <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><MinusIcon/> Stable</span>;
    }
  };
  
  return (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Column 1: Focus Hierarchy --- */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm h-fit sticky top-24 border dark:border-gray-700">
          <h3 className="font-semibold mb-2 text-tandt-dark dark:text-gray-100">Focus Hierarchy</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">A tiered priority list based on your analysis.</p>
          <div className="space-y-4">
            {Object.entries(tiers).map(([key, tierData]) => (
                tierData.elements.length > 0 && (
                    <div key={key}>
                        <h4 className={`text-sm font-bold uppercase tracking-wider ${tierData.color}`}>{`Tier ${key}: ${tierData.label}`}</h4>
                        <ul className="mt-1 list-none space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {tierData.elements.map((el, index) => <li key={el.Idug} className="pl-2 border-l-2 border-gray-300 dark:border-gray-600">{el.DisplayName}</li>)}
                        </ul>
                    </div>
                )
            ))}
          </div>
          <hr className="my-6 dark:border-gray-700" />
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            {copyStatus}
          </button>
        </div>

        {/* --- Column 2: Detailed List --- */}
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2 text-tandt-dark dark:text-gray-100">Prioritized Action List</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Items are prioritized by status (Unacceptable first) and trend (Declining first).</p>
                <div className="space-y-3">
                {sortedElements.map(el => (
                <div key={el.Idug} className={`shadow-sm rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors duration-300 ${getPerformanceItemStyle(el)}`}>
                    <div className="flex-grow mb-3 sm:mb-0">
                    <p className="font-semibold dark:text-gray-200">{el.DisplayName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{el.Description}</p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 text-sm flex-shrink-0">
                        {el.TwoFlagAnswered && !el.TwoFlag ? (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Unacceptable</span>
                        ) : (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Acceptable</span>
                        )}
                        <TrendIndicator element={el} />
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
     </div>
  );
};

const StructuringView: React.FC<StructuringViewProps> = ({ model }) => {
  const isDecisionModel = model.DigitalThinkingModelType === 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-tandt-dark dark:text-gray-100">{model.DigitalTopic}</h2>
        <p className="text-sm text-tandt-secondary dark:text-gray-400">
          {isDecisionModel 
            ? "Structuring Mode: Visualize the element dominance and hierarchy."
            : "Structuring Mode: Review the prioritized performance dashboard."
          }
        </p>
      </div>
      
      {isDecisionModel 
        ? <DecisionDashboard model={model} /> 
        : <PerformanceDashboard model={model} />
      }
    </div>
  );
};

// Icons (to avoid passing them as props)
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>;
const TrendingDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;

export default StructuringView;