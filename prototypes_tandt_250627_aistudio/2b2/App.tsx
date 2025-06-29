
import React, { useState, useCallback, useEffect } from 'react';
import { AppMode, DigitalModel, DigitalElement, ModelId, ModelSummary } from './types';
import Header from './components/Header';
import ModelingView from './components/ModelingView';
import AnalyzingView from './components/AnalyzingView';
import StructuringView from './components/StructuringView';
import { getAvailableModels, getModel, saveModel, createModel, deleteModel } from './services/modelService';
import { generateModelFromDescription } from './services/geminiService';
import ModelListView from './components/ModelListView';
import CreateNewModelModal from './components/CreateNewModelModal';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Modeling);
  const [model, setModel] = useState<DigitalModel | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelSummary[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  // Runs once on mount
  useEffect(() => {
    // Set theme based on system preference, but default to dark
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    setTheme('dark'); // Overriding to dark as per original logic
  }, []);

  const fetchAvailableModels = useCallback(async () => {
    setIsLoading(true);
    try {
        const models = await getAvailableModels();
        setAvailableModels(models);
    } catch (error) {
        console.error("Failed to fetch available models:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
      fetchAvailableModels();
  }, [fetchAvailableModels]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLoadModel = async (modelId: ModelId) => {
    setIsLoading(true);
    try {
        const newModel = await getModel(modelId);
        setModel(newModel);
        setMode(AppMode.Modeling); // Reset to modeling view
    } catch (error) {
        console.error("Failed to load model:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseModel = () => {
    setModel(null);
    fetchAvailableModels(); // Refresh list in case something changed while model was open
  };

  const handleSaveModel = async (updatedModel: DigitalModel) => {
    setModel(updatedModel); // Optimistic UI update
    try {
      await saveModel(updatedModel);
    } catch (error) {
      console.error("Failed to save model:", error);
      // Optionally: show an error message to the user or roll back the state
    }
  };
  
  const handleUpdateElement = (updatedElement: DigitalElement) => {
    if (!model) return;
    const newElements = model.Model.map(el => 
      el.Idug === updatedElement.Idug ? updatedElement : el
    );
    handleSaveModel({ ...model, Model: newElements });
  };
  
  const handleCreateModel = async (config: { name?: string; description?: string; type: number; useAi: boolean }) => {
      setIsCreatingModel(false);
      setIsLoading(true);
      try {
          if (config.useAi && config.description) {
              const generatedData = await generateModelFromDescription(config.description, config.type);
              await createModel({
                  topic: generatedData.DigitalTopic,
                  type: config.type,
                  elements: generatedData.Model
              });
          } else if (config.name) {
              await createModel({ topic: config.name, type: config.type, elements: [] });
          }
          await fetchAvailableModels();
      } catch (error) {
          console.error("Failed to create model:", error);
          // You could add user-facing error handling here
      } finally {
          setIsLoading(false);
      }
  };


  const handleDeleteModel = async (modelId: ModelId) => {
      setIsLoading(true);
      try {
          await deleteModel(modelId);
          await fetchAvailableModels();
      } catch (error) {
          console.error("Failed to delete model:", error);
      } finally {
          setIsLoading(false);
      }
  };


  const renderModelContent = () => {
    if (!model) {
      return null;
    }

    switch (mode) {
      case AppMode.Modeling:
        return <ModelingView model={model} onSaveModel={handleSaveModel} />;
      case AppMode.Analyzing:
        return <AnalyzingView model={model} onUpdateElement={handleUpdateElement} />;
      case AppMode.Structuring:
        return <StructuringView model={model} theme={theme} />;
      default:
        return <ModelingView model={model} onSaveModel={handleSaveModel} />;
    }
  };

  // Show full-screen loader only on initial application load
  if (isLoading && availableModels.length === 0 && !model) {
      return (
        <div className="flex justify-center items-center h-screen bg-tandt-bg dark:bg-gray-900">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-tandt-primary"></div>
          <span className="ml-4 text-lg text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      );
  }

  return (
    <div className="min-h-screen font-sans text-tandt-dark dark:text-gray-200">
      {!model ? (
        <>
            <ModelListView 
                models={availableModels}
                isLoading={isLoading}
                onLoadModel={handleLoadModel} 
                onDeleteModel={handleDeleteModel}
                onNewModel={() => setIsCreatingModel(true)}
                onToggleTheme={toggleTheme} 
                theme={theme}
            />
            {isCreatingModel && (
                <CreateNewModelModal 
                    onClose={() => setIsCreatingModel(false)}
                    onCreate={handleCreateModel}
                />
            )}
        </>
      ) : (
        <>
          <Header 
            currentMode={mode} 
            onSetMode={setMode} 
            onGoBack={handleCloseModel}
            theme={theme}
            onToggleTheme={toggleTheme}
            modelName={model.DigitalTopic}
          />
          <main className="p-4 sm:p-6 lg:p-8">
            {renderModelContent()}
          </main>
        </>
      )}
    </div>
  );
};

export default App;