
import React, { useMemo } from 'react';
import { DigitalModel, DigitalElement } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

interface StructuringViewProps {
  model: DigitalModel;
  theme: 'light' | 'dark';
}

// Component for Decision Making Model (Type 1)
const DecisionDashboard: React.FC<{ model: DigitalModel, theme: 'light' | 'dark' }> = ({ model, theme }) => {
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

  const TrendIndicator = ({ element }: { element: DigitalElement }) => {
    if (!element.ThreeFlagAnswered) return <span className="text-gray-400 dark:text-gray-500">-</span>;
    if (element.ThreeFlag === 1) return <span className="text-green-500 flex items-center"><TrendingUpIcon/> Improving</span>;
    if (element.ThreeFlag === -1) return <span className="text-red-500 flex items-center"><TrendingDownIcon/> Declining</span>;
    return <span className="text-yellow-500 flex items-center"><MinusIcon/> Stable</span>;
  };
  
  return (
     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
       <h3 className="font-semibold mb-4 text-tandt-dark dark:text-gray-100">Prioritized Action List</h3>
       <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Items are prioritized by their status (Unacceptable first) and then by their performance trend (Declining first).</p>
       <div className="space-y-3">
        {sortedElements.map(el => (
          <div key={el.Idug} className="border dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold dark:text-gray-200">{el.DisplayName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{el.Description}</p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
                {el.TwoFlagAnswered && !el.TwoFlag ? (
                    <span className="font-bold text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-full">Unacceptable</span>
                ) : (
                    <span className="font-bold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full">Acceptable</span>
                )}
                <TrendIndicator element={el} />
            </div>
          </div>
        ))}
       </div>
     </div>
  );
};

const StructuringView: React.FC<StructuringViewProps> = ({ model, theme }) => {
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
        ? <DecisionDashboard model={model} theme={theme} /> 
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
