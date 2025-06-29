import { create } from 'zustand';
import { AppMode, DigitalModel, ModelId, ModelSummary, DigitalElement } from './types';
import { getAvailableModels, getModel, saveModel as saveModelService, createModel as createModelService, deleteModel as deleteModelService } from './services/modelService';
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
    // Default to dark theme as per original logic, but check preference first.
    let initialTheme: 'light' | 'dark' = 'dark';
    if (window.matchMedia && !window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // initialTheme = 'light';
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
}));