import React, { useState, useCallback, useEffect } from 'react';
import { AppMode, DigitalModel, DigitalElement } from './types';
import Header from './components/Header';
import ModelingView from './components/ModelingView';
import AnalyzingView from './components/AnalyzingView';
import StructuringView from './components/StructuringView';
import { performanceReviewModelData, habitatModelData } from './constants';

const resetModelAnalysisState = (model: DigitalModel): DigitalModel => {
    const resetElements = model.Model.map(el => ({
        ...el,
        TwoFlag: false,
        TwoFlagAnswered: false,
        ThreeFlag: 0,
        ThreeFlagAnswered: false,
    }));
    return { ...model, Model: resetElements };
};


const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Modeling);
  const [model, setModel] = useState<DigitalModel>(performanceReviewModelData);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSetModel = (newModel: DigitalModel) => {
    // Reset evaluation flags for a clean analysis session
    const modelWithResetState = resetModelAnalysisState(newModel);
    
    // Recalculate dominance factors for Decision Making models
    if (modelWithResetState.DigitalThinkingModelType === 1) {
        const updatedElements = modelWithResetState.Model.map(element => {
            const dominanceFactor = Object.values(element.ComparationTableData).filter(v => v === 1).length;
            return { ...element, DominanceFactor: dominanceFactor };
        });
        setModel({ ...modelWithResetState, Model: updatedElements });
    } else {
        setModel(modelWithResetState);
    }
  };

  useEffect(() => {
    // Load initial model and set theme
    handleSetModel(performanceReviewModelData);
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    // Set default theme to dark if no preference
    setTheme('dark');
  }, []);


  const handleUpdateElement = (updatedElement: DigitalElement) => {
    const newElements = model.Model.map(el => 
      el.Idug === updatedElement.Idug ? updatedElement : el
    );
    setModel(prevModel => ({ ...prevModel, Model: newElements }));
  };
  
  const handleUpdateModel = (updatedModel: DigitalModel) => {
    setModel(updatedModel);
  };

  const handleLoadModel = (modelName: 'performance' | 'habitat') => {
    const newModel = modelName === 'performance' ? performanceReviewModelData : habitatModelData;
    handleSetModel(newModel);
    setMode(AppMode.Modeling); // Reset to modeling view
  }

  const renderContent = () => {
    switch (mode) {
      case AppMode.Modeling:
        return <ModelingView model={model} onUpdateModel={handleUpdateModel} />;
      case AppMode.Analyzing:
        return <AnalyzingView model={model} onUpdateElement={handleUpdateElement} />;
      case AppMode.Structuring:
        return <StructuringView model={model} theme={theme} />;
      default:
        return <ModelingView model={model} onUpdateModel={handleUpdateModel} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-tandt-dark dark:text-gray-200">
      <Header 
        currentMode={mode} 
        onSetMode={setMode} 
        onLoadModel={handleLoadModel} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
