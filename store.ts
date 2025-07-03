import { create } from 'zustand';
import type { Chat } from '@google/genai';
import { AppMode, DigitalModel, ModelId, ModelSummary, DigitalElement, HistoryEntry, ChatMessage, ActionSuggestion } from './types';
import { 
    getAvailableModels, 
    getModel, 
    saveModel as saveModelService, 
    createModel as createModelService, 
    deleteModel as deleteModelService,
    importModel as importModelService,
    exportModel as exportModelService,
} from './services/modelService';
import { generateModelFromDescription, createChatSession as createChatSessionService, generateActionSuggestions as generateActionSuggestionsService } from './services/geminiService';

const MAX_HISTORY_LENGTH = 50;

interface AppState {
  // State
  mode: AppMode;
  model: DigitalModel | null;
  availableModels: ModelSummary[];
  theme: 'light' | 'dark';
  isLoading: boolean;
  isCreatingModel: boolean;
  isHistoryPanelOpen: boolean;
  isChatAnalystOpen: boolean;
  chatSession: Chat | null;
  actionSuggestions: ActionSuggestion[] | null;
  isGeneratingSuggestions: boolean;
  suggestionError: string | null;

  // Actions
  initializeTheme: () => void;
  toggleTheme: () => void;
  setMode: (mode: AppMode) => void;
  setIsCreatingModel: (isCreating: boolean) => void;
  toggleHistoryPanel: () => void;
  toggleChatAnalyst: () => void;

  fetchAvailableModels: () => Promise<void>;
  loadModel: (modelId: ModelId) => Promise<void>;
  closeModel: () => void;
  saveModel: (updatedModel: DigitalModel, description: string) => Promise<void>;
  updateElement: (updatedElement: DigitalElement, description: string) => void;
  revertToVersion: (historyId: string) => Promise<void>;
  createModel: (config: { name?: string; description?: string; type: number; useAi: boolean }) => Promise<void>;
  deleteModel: (modelId: ModelId) => Promise<void>;
  importModel: (modelJson: DigitalModel) => Promise<void>;
  exportModel: (modelId: ModelId) => Promise<void>;
  generateActionSuggestions: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  mode: AppMode.Modeling,
  model: null,
  availableModels: [],
  theme: 'dark',
  isLoading: true,
  isCreatingModel: false,
  isHistoryPanelOpen: false,
  isChatAnalystOpen: false,
  chatSession: null,
  actionSuggestions: null,
  isGeneratingSuggestions: false,
  suggestionError: null,

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
  toggleHistoryPanel: () => set(state => ({ isHistoryPanelOpen: !state.isHistoryPanelOpen })),
  
  toggleChatAnalyst: () => {
    set(state => {
      const newIsOpen = !state.isChatAnalystOpen;
      // If opening panel and no session exists for the current model, create one.
      if (newIsOpen && !state.chatSession && state.model) {
        const session = createChatSessionService(state.model);
        if (session) {
          return { chatSession: session, isChatAnalystOpen: newIsOpen };
        }
        // If session creation fails (e.g., no API key), still open panel but session remains null.
        console.warn("Could not create chat session, AI features may be disabled.");
      }
      return { isChatAnalystOpen: newIsOpen };
    });
  },

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
    set({ isLoading: true, isHistoryPanelOpen: false, isChatAnalystOpen: false, chatSession: null, actionSuggestions: null, suggestionError: null, isGeneratingSuggestions: false });
    try {
      const newModel = await getModel(modelId);
      set({ model: newModel, mode: AppMode.Modeling, isLoading: false });
    } catch (error) {
      console.error("Failed to load model:", error);
      set({ isLoading: false });
    }
  },

  closeModel: () => {
    set({ model: null, isHistoryPanelOpen: false, isChatAnalystOpen: false, chatSession: null, actionSuggestions: null, suggestionError: null, isGeneratingSuggestions: false });
    get().fetchAvailableModels(); // Refresh list in case of changes
  },
  
  saveModel: async (updatedModel, description) => {
    const newHistoryEntry: HistoryEntry = {
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: description,
      modelState: JSON.parse(JSON.stringify(updatedModel.Model)), // Deep copy
    };

    const currentHistory = updatedModel.history || [];
    const newHistory = [newHistoryEntry, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);

    const modelWithHistory = { ...updatedModel, history: newHistory };

    set({ model: modelWithHistory }); // Optimistic update
    try {
      await saveModelService(modelWithHistory);
    } catch (error) {
      console.error("Failed to save model:", error);
      // Future: implement rollback logic or user-facing error
    }
  },
  
  revertToVersion: async (historyId: string) => {
    const { model, saveModel } = get();
    if (!model || !model.history) return;

    const historyEntry = model.history.find(h => h.id === historyId);
    if (!historyEntry) {
        console.error("History entry not found");
        return;
    }

    // Create a new model state based on the historical data
    const revertedModel: DigitalModel = {
        ...model,
        Model: JSON.parse(JSON.stringify(historyEntry.modelState)), // Deep copy
    };
    
    const revertDescription = `Reverted to version from ${new Date(historyEntry.timestamp).toLocaleString()}`;
    await saveModel(revertedModel, revertDescription);
    set({ isHistoryPanelOpen: false });
  },

  updateElement: (updatedElement, description) => {
    const { model, saveModel } = get();
    if (!model) return;
    const newElements = model.Model.map(el => 
      el.Idug === updatedElement.Idug ? updatedElement : el
    );
    saveModel({ ...model, Model: newElements }, description);
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

  generateActionSuggestions: async () => {
    const { model } = get();
    if (!model) return;
    set({ isGeneratingSuggestions: true, suggestionError: null, actionSuggestions: null }); // Reset
    try {
        const suggestions = await generateActionSuggestionsService(model);
        set({ actionSuggestions: suggestions });
    } catch (error: any) {
        set({ suggestionError: error.message || "An unknown error occurred." });
    } finally {
        set({ isGeneratingSuggestions: false });
    }
  },
}));
