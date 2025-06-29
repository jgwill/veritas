import { create } from 'zustand';
import { AppMode, DigitalModel, ModelId, ModelSummary, DigitalElement } from './types';
import { 
    getAvailableModels, 
    getModel, 
    saveModel as saveModelService, 
    createModel as createModelService, 
    deleteModel as deleteModelService,
    importModel as importModelService,
    exportModel as exportModelService,
} from './services/modelService';
import { generateModelFromDescription } from './services/geminiService';

interface AppState {
  // State
  mode: AppMode;
  model: DigitalModel | null;
  availableModels: ModelSummary[];
  theme: 'light' | 'dark';
  isLoading: boolean;
  isCreatingModel: boolean;

  // Actions
  initializeTheme: () => void;
  toggleTheme: () => void;
  setMode: (mode: AppMode) => void;
  setIsCreatingModel: (isCreating: boolean) => void;

  fetchAvailableModels: () => Promise<void>;
  loadModel: (modelId: ModelId) => Promise<void>;
  closeModel: () => void;
  saveModel: (updatedModel: DigitalModel) => Promise<void>;
  updateElement: (updatedElement: DigitalElement) => void;
  createModel: (config: { name?: string; description?: string; type: number; useAi: boolean }) => Promise<void>;
  deleteModel: (modelId: ModelId) => Promise<void>;
  importModel: (modelJson: DigitalModel) => Promise<void>;
  exportModel: (modelId: ModelId) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  mode: AppMode.Modeling,
  model: null,
  availableModels: [],
  theme: 'dark',
  isLoading: true,
  isCreatingModel: false,

  // Actions
  initializeTheme: () => {
    const root = window.document.documentElement;
    // Default to dark theme, but check user's system preference first.
    let initialTheme: 'light' | 'dark' = 'dark';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        initialTheme = 'light';
    }
    
    set({ theme: initialTheme });
    root.classList.toggle('dark', initialTheme === 'dark');
  },

  toggleTheme: () => {
    set(state => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      return { theme: newTheme };
    });
  },

  setMode: (mode) => set({ mode }),

  setIsCreatingModel: (isCreating) => set({ isCreatingModel: isCreating }),

  fetchAvailableModels: async () => {
    set({ isLoading: true });
    try {
      const models = await getAvailableModels();
      set({ availableModels: models });
    } catch (error) {
      console.error("Failed to fetch available models:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadModel: async (modelId) => {
    set({ isLoading: true });
    try {
      const newModel = await getModel(modelId);
      set({ model: newModel, mode: AppMode.Modeling, isLoading: false });
    } catch (error) {
      console.error("Failed to load model:", error);
      set({ isLoading: false });
    }
  },

  closeModel: () => {
    set({ model: null });
    get().fetchAvailableModels(); // Refresh list in case of changes
  },
  
  saveModel: async (updatedModel) => {
    set({ model: updatedModel }); // Optimistic update
    try {
      await saveModelService(updatedModel);
    } catch (error) {
      console.error("Failed to save model:", error);
      // Future: implement rollback logic or user-facing error
    }
  },

  updateElement: (updatedElement) => {
    const { model, saveModel } = get();
    if (!model) return;
    const newElements = model.Model.map(el => 
      el.Idug === updatedElement.Idug ? updatedElement : el
    );
    saveModel({ ...model, Model: newElements });
  },
  
  createModel: async (config) => {
      set({ isCreatingModel: false, isLoading: true });
      try {
          if (config.useAi && config.description) {
              const generatedData = await generateModelFromDescription(config.description, config.type);
              await createModelService({
                  topic: generatedData.DigitalTopic,
                  type: config.type,
                  elements: generatedData.Model
              });
          } else if (config.name) {
              await createModelService({ topic: config.name, type: config.type, elements: [] });
          }
          await get().fetchAvailableModels();
      } catch (error) {
          console.error("Failed to create model:", error);
          // Future: user-facing error handling
      } finally {
          set({ isLoading: false });
      }
  },

  deleteModel: async (modelId) => {
    set({ isLoading: true });
    try {
      await deleteModelService(modelId);
      await get().fetchAvailableModels();
    } catch (error) {
      console.error("Failed to delete model:", error);
    } finally {
      // isLoading will be set to false by fetchAvailableModels
    }
  },

  importModel: async (modelJson: DigitalModel) => {
    set({ isLoading: true });
    try {
        await importModelService(modelJson);
        await get().fetchAvailableModels();
    } catch (error) {
        console.error("Error importing model:", error);
        throw error; // Re-throw so component can catch it and show an alert
    } finally {
        set({ isLoading: false });
    }
  },

  exportModel: async (modelId: ModelId) => {
      try {
          const { modelData, fileName } = await exportModelService(modelId);
          const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(modelData, null, 2)
          )}`;
          const link = document.createElement("a");
          link.href = jsonString;
          link.download = fileName;
          link.click();
          link.remove();
      } catch (error) {
          console.error("Failed to export model:", error);
          // In a real app, you'd show a user-facing error here.
          alert("Could not export model. See console for details.");
      }
  },
}));
