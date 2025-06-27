
import React, { useState, useMemo } from 'react';
import { DigitalElement } from '../types';

interface HierarchyBuilderModalProps {
  otherElements: DigitalElement[];
  comparingElement: DigitalElement;
  onClose: () => void;
  onComplete: (baseElement: DigitalElement, results: { [key: string]: number }) => void;
}

const HierarchyBuilderModal: React.FC<HierarchyBuilderModalProps> = ({ otherElements, comparingElement, onClose, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ [key: string]: number }>({});
  
  const otherElement = useMemo(() => otherElements[currentIndex], [otherElements, currentIndex]);

  const handleDecision = (decision: 'yes' | 'no') => {
    if (!otherElement) return;

    // YES means comparingElement dominates otherElement
    // NO means otherElement dominates comparingElement
    const newResults = { ...results, [otherElement.Idug]: decision === 'yes' ? 1 : -1 };
    setResults(newResults);

    if (currentIndex + 1 >= otherElements.length) {
      onComplete(comparingElement, newResults);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const progress = ((currentIndex + 1) / otherElements.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl transform transition-all flex flex-col">
        <div className="p-5 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold text-tandt-dark dark:text-gray-100">Hierarchy Builder</h2>
          <p className="text-sm text-tandt-secondary dark:text-gray-400 mt-1">
            Building hierarchy for: <span className="font-semibold text-tandt-primary">{comparingElement.DisplayName}</span>
          </p>
        </div>
        
        {otherElement && (
            <div className="p-6 flex-grow">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Comparing {currentIndex + 1} of {otherElements.length}
                </p>

                <div className="text-center mb-8">
                    <p className="text-xl font-medium text-gray-800 dark:text-gray-200">
                        If you have <strong className="text-blue-600">"{comparingElement.DisplayName}"</strong>
                    </p>
                    <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-1">
                        but you don't have <strong className="text-green-600">"{otherElement.DisplayName}"</strong>...
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                        Is the decision still <span className="underline">YES</span>?
                    </p>
                </div>
            
                <div className="flex justify-center space-x-8">
                    <button
                    onClick={() => handleDecision('yes')}
                    className="px-10 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
                    >
                    YES
                    </button>
                    <button
                    onClick={() => handleDecision('no')}
                    className="px-10 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
                    >
                    NO
                    </button>
                </div>
            </div>
        )}
        

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HierarchyBuilderModal;
