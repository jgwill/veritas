import React, { useState } from 'react';
import { DigitalModel, DigitalElement, AppMode } from '../types';
import ElementCard from './ElementCard';
import HierarchyBuilderModal from './ComparisonModal';
import EditElementModal from './EditElementModal';
import GeminiAssistant from './GeminiAssistant';

interface ModelingViewProps {
  model: DigitalModel;
  onSaveModel: (model: DigitalModel) => void;
}

const ModelingView: React.FC<ModelingViewProps> = ({ model, onSaveModel }) => {
  const [comparingElement, setComparingElement] = useState<DigitalElement | null>(null);
  const [editingElement, setEditingElement] = useState<DigitalElement | null>(null);

  const isDecisionModel = model.DigitalThinkingModelType === 1;

  const handleStartCompare = (element: DigitalElement) => {
    if (!isDecisionModel) return;
    setComparingElement(element);
  };

  const handleHierarchyBuildComplete = (baseElement: DigitalElement, results: { [key: string]: number }) => {
    if (!isDecisionModel) return;
    
    let newElements = [...model.Model];

    // Update the comparison table for all involved elements
    Object.keys(results).forEach(otherElementIdug => {
      const comparisonValue = results[otherElementIdug]; // 1 if base dominates, -1 if other dominates

      // Find indexes
      const baseElementIndex = newElements.findIndex(el => el.Idug === baseElement.Idug);
      const otherElementIndex = newElements.findIndex(el => el.Idug === otherElementIdug);

      if (baseElementIndex > -1 && otherElementIndex > -1) {
        // Update base element's table
        newElements[baseElementIndex] = {
            ...newElements[baseElementIndex],
            ComparationTableData: {
                ...newElements[baseElementIndex].ComparationTableData,
                [otherElementIdug]: comparisonValue
            }
        };
        // Update other element's table (inverse relationship)
        newElements[otherElementIndex] = {
            ...newElements[otherElementIndex],
            ComparationTableData: {
                ...newElements[otherElementIndex].ComparationTableData,
                [baseElement.Idug]: -comparisonValue 
            }
        };
      }
    });
    
    // Recalculate all dominance factors after the batch update
    const finalElements = newElements.map(el => {
        const newDominanceFactor = Object.values(el.ComparationTableData).filter(v => v === 1).length;
        return { ...el, DominanceFactor: newDominanceFactor };
    });

    onSaveModel({ ...model, Model: finalElements });
    setComparingElement(null);
  };

  const handleStartEdit = (element: DigitalElement) => {
    setEditingElement(element);
  };

  const handleSaveEdit = (updatedElement: DigitalElement) => {
    const newElements = model.Model.map(el =>
      el.Idug === updatedElement.Idug ? updatedElement : el
    );
    onSaveModel({ ...model, Model: newElements });
    setEditingElement(null);
  };
  
  const handleDeleteElement = (elementIdToDelete: string) => {
    let newModelElements = model.Model.filter(el => el.Idug !== elementIdToDelete);

    if (model.DigitalThinkingModelType === 1) {
      // For decision models, also remove the deleted element from all comparison tables
      newModelElements = newModelElements.map(el => {
        const newComparationTableData = { ...el.ComparationTableData };
        delete newComparationTableData[elementIdToDelete];
        const newDominanceFactor = Object.values(newComparationTableData).filter(v => v === 1).length;
        return { ...el, ComparationTableData: newComparationTableData, DominanceFactor: newDominanceFactor };
      });
    }
    
    onSaveModel({ ...model, Model: newModelElements });
    setEditingElement(null);
  };

  const handleAddElements = (newElements: { name: string; description: string }[]) => {
      const newDigitalElements: DigitalElement[] = newElements.map((el, index) => {
        const idug = `new-${Date.now()}-${index}`;
        return {
            Idug: idug,
            DisplayName: el.name,
            Description: el.description,
            NameElement: el.name.replace(/\s/g, ''),
            ComparationTableData: {},
            DominanceFactor: 0,
            SortNo: model.Model.length + index,
            ComparationCompleted: false,
            DominantElementItIS: false,
            Meta: {},
            DtModified: new Date().toISOString(),
            DtCreated: new Date().toISOString(),
            Tlid: Date.now().toString(),
            TwoOnly: model.TwoOnly,
            TwoFlag: false,
            TwoFlagAnswered: false,
            ThreeFlag: 0,
            ThreeFlagAnswered: false,
            Status: 1,
            Question: false,
            TelescopedModel: null,
        }
      });
      
      let updatedModelElements = [...model.Model];

      if (isDecisionModel) {
          // Initialize comparison data for new elements against all existing elements
          const allElementIdugs = [...model.Model.map(e => e.Idug), ...newDigitalElements.map(e => e.Idug)];

          updatedModelElements = model.Model.map(exEl => {
              const newComps = { ...exEl.ComparationTableData };
              newDigitalElements.forEach(newEl => {
                  newComps[newEl.Idug] = 0; // Initialize as equal
              });
              return { ...exEl, ComparationTableData: newComps };
          });

          const updatedNewElements = newDigitalElements.map(newEl => {
              const newComps = { ...newEl.ComparationTableData };
              allElementIdugs.forEach(idug => {
                  if (idug !== newEl.Idug) {
                      newComps[idug] = 0; // Initialize as equal
                  }
              });
              return { ...newEl, ComparationTableData: newComps };
          });
          updatedModelElements.push(...updatedNewElements);
      } else {
        updatedModelElements.push(...newDigitalElements);
      }
      
      onSaveModel({ ...model, Model: updatedModelElements });
  };


  return (
    <div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-tandt-dark dark:text-gray-100">{model.DigitalTopic}</h2>
                <p className="text-sm text-tandt-secondary dark:text-gray-400">
                    {isDecisionModel
                        ? "Modeling Mode: Build your dominance hierarchy. Click 'Compare' on an element to begin."
                        : "Modeling Mode: Define the elements you want to evaluate in your performance review."
                    }
                </p>
            </div>
            <GeminiAssistant onAddElements={handleAddElements} modelType={model.DigitalThinkingModelType} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {model.Model.map((element) => (
                <ElementCard 
                    key={element.Idug} 
                    element={element} 
                    mode={AppMode.Modeling}
                    modelType={model.DigitalThinkingModelType}
                    onCompare={isDecisionModel ? handleStartCompare : undefined}
                    onEdit={handleStartEdit}
                    isComparing={isDecisionModel && comparingElement?.Idug === element.Idug}
                />
            ))}
        </div>

        {isDecisionModel && comparingElement && (
            <HierarchyBuilderModal
                otherElements={model.Model.filter(el => el.Idug !== comparingElement.Idug)}
                comparingElement={comparingElement}
                onClose={() => setComparingElement(null)}
                onComplete={handleHierarchyBuildComplete}
            />
        )}
        
        {editingElement && (
            <EditElementModal
                element={editingElement}
                onClose={() => setEditingElement(null)}
                onSave={handleSaveEdit}
                onDelete={handleDeleteElement}
            />
        )}
    </div>
  );
};

export default ModelingView;