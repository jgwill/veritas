import { create } from "zustand"
import {
  AppMode,
  type DigitalModel,
  type ModelId,
  type ModelSummary,
  type DigitalElement,
  type HistoryEntry,
  type ActionSuggestion,
  type AnalysisSnapshot,
} from "./types"
import {
  getAvailableModels,
  getModel,
  saveModel as saveModelService,
  createModel as createModelService,
  deleteModel as deleteModelService,
  importModel as importModelService,
  exportModel as exportModelService,
} from "./services/modelService"
import {
  generateModelFromDescription,
  createChatSession as createChatSessionService,
  generateActionSuggestions as generateActionSuggestionsService,
} from "./services/geminiService"

const MAX_HISTORY_LENGTH = 50

interface AppState {
  // State
  mode: AppMode
  model: DigitalModel | null
  availableModels: ModelSummary[]
  theme: "light" | "dark"
  isLoading: boolean
  isCreatingModel: boolean
  isHistoryPanelOpen: boolean
  isChatAnalystOpen: boolean
  chatSession: { sendMessage: (params: { message: string }) => Promise<{ text: string }> } | null
  actionSuggestions: ActionSuggestion[] | null
  isGeneratingSuggestions: boolean
  suggestionError: string | null
  
  // Snapshot state
  snapshots: AnalysisSnapshot[]
  isSnapshotPanelOpen: boolean
  viewingSnapshot: AnalysisSnapshot | null
  comparingSnapshots: [AnalysisSnapshot | null, AnalysisSnapshot | null]
  isCompareMode: boolean

  // Actions
  initializeTheme: () => void
  toggleTheme: () => void
  setMode: (mode: AppMode) => void
  setIsCreatingModel: (isCreating: boolean) => void
  toggleHistoryPanel: () => void
  toggleChatAnalyst: () => void

  fetchAvailableModels: () => Promise<void>
  loadModel: (modelId: ModelId) => Promise<void>
  closeModel: () => void
  saveModel: (updatedModel: DigitalModel, description: string) => Promise<void>
  updateElement: (updatedElement: DigitalElement, description: string) => void
  revertToVersion: (historyId: string) => Promise<void>
  createModel: (config: { name?: string; description?: string; type: number; useAi: boolean }) => Promise<void>
  deleteModel: (modelId: ModelId) => Promise<void>
  importModel: (modelJson: DigitalModel) => Promise<void>
  exportModel: (modelId: ModelId) => Promise<void>
  generateActionSuggestions: () => Promise<void>
  
  // Snapshot actions
  fetchSnapshots: () => Promise<void>
  toggleSnapshotPanel: () => void
  viewSnapshot: (snapshot: AnalysisSnapshot) => void
  clearViewingSnapshot: () => void
  enterCompareMode: (snapshot1: AnalysisSnapshot, snapshot2: AnalysisSnapshot) => void
  exitCompareMode: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  mode: AppMode.Modeling,
  model: null,
  availableModels: [],
  theme: "dark",
  isLoading: true,
  isCreatingModel: false,
  isHistoryPanelOpen: false,
  isChatAnalystOpen: false,
  chatSession: null,
  actionSuggestions: null,
  isGeneratingSuggestions: false,
  suggestionError: null,
  
  // Snapshot state
  snapshots: [],
  isSnapshotPanelOpen: false,
  viewingSnapshot: null,
  comparingSnapshots: [null, null],
  isCompareMode: false,

  // Actions
  initializeTheme: () => {
    const root = window.document.documentElement
    // Default to dark theme, but check user's system preference first.
    let initialTheme: "light" | "dark" = "dark"
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      initialTheme = "light"
    }

    set({ theme: initialTheme })
    root.classList.toggle("dark", initialTheme === "dark")
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light"
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
      return { theme: newTheme }
    })
  },

  setMode: (mode) => set({ mode }),
  setIsCreatingModel: (isCreating) => set({ isCreatingModel: isCreating }),
  toggleHistoryPanel: () => set((state) => ({ isHistoryPanelOpen: !state.isHistoryPanelOpen })),

  toggleChatAnalyst: () => {
    const { isChatAnalystOpen, chatSession, model } = get()
    const newIsOpen = !isChatAnalystOpen

    // If opening panel and no session exists for the current model, create one.
    if (newIsOpen && !chatSession && model) {
      const session = createChatSessionService(model)
      if (session) {
        set({ chatSession: session, isChatAnalystOpen: newIsOpen })
        return
      }
      // If session creation fails (e.g., no API key), still open panel but session remains null.
      console.warn("Could not create chat session, AI features may be disabled.")
    }

    set({ isChatAnalystOpen: newIsOpen })
  },

  fetchAvailableModels: async () => {
    set({ isLoading: true })
    try {
      const models = await getAvailableModels()
      set({ availableModels: models })
    } catch (error) {
      console.error("Failed to fetch available models:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  loadModel: async (modelId) => {
    console.log(`[v0] Loading model with ID: ${modelId}`)
    set({
      isLoading: true,
      isHistoryPanelOpen: false,
      isChatAnalystOpen: false,
      chatSession: null,
      actionSuggestions: null,
      suggestionError: null,
      isGeneratingSuggestions: false,
    })
    try {
      const newModel = await getModel(modelId)
      console.log(`[v0] Model loaded successfully: ${newModel.DigitalTopic}`)
      set({ model: newModel, mode: AppMode.Modeling, isLoading: false })
    } catch (error) {
      console.error("[v0] Failed to load model:", error)
      alert(
        `Failed to load model: ${error instanceof Error ? error.message : "Unknown error"}. The model list will be refreshed.`,
      )
      await get().fetchAvailableModels()
      set({ isLoading: false })
    }
  },

  closeModel: () => {
    set({
      model: null,
      isHistoryPanelOpen: false,
      isChatAnalystOpen: false,
      chatSession: null,
      actionSuggestions: null,
      suggestionError: null,
      isGeneratingSuggestions: false,
    })
    get().fetchAvailableModels() // Refresh list in case of changes
  },

  saveModel: async (updatedModel, description) => {
    console.log("[v0] saveModel called:", {
      description,
      elementCount: updatedModel.Model.length,
      evaluatedElements: updatedModel.Model.filter((el) => el.TwoFlagAnswered).map((el) => ({
        name: el.DisplayName,
        id: el.Idug,
        TwoFlag: el.TwoFlag,
        TwoFlagAnswered: el.TwoFlagAnswered,
      })),
    })

    const newHistoryEntry: HistoryEntry = {
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: description,
      modelState: JSON.parse(JSON.stringify(updatedModel.Model)), // Deep copy
    }

    const currentHistory = updatedModel.history || []
    const newHistory = [newHistoryEntry, ...currentHistory].slice(0, MAX_HISTORY_LENGTH)

    const modelWithHistory = { ...updatedModel, history: newHistory }

    console.log("[v0] Setting model state optimistically")
    set({ model: modelWithHistory })

    try {
      await saveModelService(modelWithHistory)
      console.log("[v0] Model saved to localStorage successfully")
    } catch (error) {
      console.error("[v0] Failed to save model to localStorage:", error)
    }
  },

  updateElement: (updatedElement, description) => {
    const { model, saveModel } = get()
    if (!model) {
      console.error("[v0] Cannot update element: no model loaded")
      return
    }

    console.log("[v0] updateElement called:", {
      elementName: updatedElement.DisplayName,
      elementId: updatedElement.Idug,
      description,
      TwoFlag: updatedElement.TwoFlag,
      TwoFlagAnswered: updatedElement.TwoFlagAnswered,
      ThreeFlag: updatedElement.ThreeFlag,
      ThreeFlagAnswered: updatedElement.ThreeFlagAnswered,
    })

    const newElements = model.Model.map((el) => {
      if (el.Idug === updatedElement.Idug) {
        console.log("[v0] Updating element:", {
          oldTwoFlag: el.TwoFlag,
          newTwoFlag: updatedElement.TwoFlag,
          oldTwoFlagAnswered: el.TwoFlagAnswered,
          newTwoFlagAnswered: updatedElement.TwoFlagAnswered,
        })
        return updatedElement
      }
      return el
    })

    console.log(
      "[v0] All elements after update:",
      newElements.map((el) => ({
        name: el.DisplayName,
        id: el.Idug,
        TwoFlag: el.TwoFlag,
        TwoFlagAnswered: el.TwoFlagAnswered,
      })),
    )

    saveModel({ ...model, Model: newElements }, description)
  },

  revertToVersion: async (historyId: string) => {
    const { model, saveModel } = get()
    if (!model || !model.history) return

    const historyEntry = model.history.find((h) => h.id === historyId)
    if (!historyEntry) {
      console.error("History entry not found")
      return
    }

    // Create a new model state based on the historical data
    const revertedModel: DigitalModel = {
      ...model,
      Model: JSON.parse(JSON.stringify(historyEntry.modelState)), // Deep copy
    }

    const revertDescription = `Reverted to version from ${new Date(historyEntry.timestamp).toLocaleString()}`
    await saveModel(revertedModel, revertDescription)
    set({ isHistoryPanelOpen: false })
  },

  createModel: async (config) => {
    set({ isCreatingModel: false, isLoading: true })
    try {
      if (config.useAi && config.description) {
        const generatedData = await generateModelFromDescription(config.description, config.type)
        const elements = generatedData.Model.map((el) => ({
          name: el.DisplayName,
          description: el.Description || "",
        }))
        await createModelService({
          topic: generatedData.DigitalTopic,
          type: config.type,
          elements: elements,
        })
      } else if (config.name) {
        await createModelService({ topic: config.name, type: config.type, elements: [] })
      }
      await get().fetchAvailableModels()
    } catch (error) {
      console.error("Failed to create model:", error)
      // Future: user-facing error handling
    } finally {
      set({ isLoading: false })
    }
  },

  deleteModel: async (modelId) => {
    set({ isLoading: true })
    try {
      await deleteModelService(modelId)
      await get().fetchAvailableModels()
    } catch (error) {
      console.error("Failed to delete model:", error)
    } finally {
      // isLoading will be set to false by fetchAvailableModels
    }
  },

  importModel: async (modelJson: DigitalModel) => {
    set({ isLoading: true })
    try {
      await importModelService(modelJson)
      await get().fetchAvailableModels()
    } catch (error) {
      console.error("Error importing model:", error)
      throw error // Re-throw so component can catch it and show an alert
    } finally {
      set({ isLoading: false })
    }
  },

  exportModel: async (modelId: ModelId) => {
    try {
      const { modelData, fileName } = await exportModelService(modelId)
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(modelData, null, 2))}`
      const link = document.createElement("a")
      link.href = jsonString
      link.download = fileName
      link.click()
      link.remove()
    } catch (error) {
      console.error("Failed to export model:", error)
      // In a real app, you'd show a user-facing error here.
      alert("Could not export model. See console for details.")
    }
  },

  generateActionSuggestions: async () => {
    const { model } = get()
    if (!model) return
    set({ isGeneratingSuggestions: true, suggestionError: null, actionSuggestions: null }) // Reset
    try {
      const suggestions = await generateActionSuggestionsService(model)
      const formattedSuggestions: ActionSuggestion[] = suggestions.map((suggestion, index) => ({
        area: `Action ${index + 1}`,
        suggestion: suggestion,
      }))
      set({ actionSuggestions: formattedSuggestions })
    } catch (error: any) {
      set({ suggestionError: error.message || "An unknown error occurred." })
    } finally {
      set({ isGeneratingSuggestions: false })
    }
  },

  // Snapshot actions
  fetchSnapshots: async () => {
    const { model } = get()
    if (!model) return
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/models/${model.Idug}/snapshots`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        set({ snapshots: data.snapshots || [] })
      }
    } catch (error) {
      console.error('Failed to fetch snapshots:', error)
    }
  },

  toggleSnapshotPanel: () => {
    const { isSnapshotPanelOpen, model } = get()
    const newIsOpen = !isSnapshotPanelOpen
    
    if (newIsOpen && model) {
      get().fetchSnapshots()
    }
    
    set({ 
      isSnapshotPanelOpen: newIsOpen,
      viewingSnapshot: null,
      isCompareMode: false,
      comparingSnapshots: [null, null]
    })
  },

  viewSnapshot: (snapshot: AnalysisSnapshot) => {
    set({ 
      viewingSnapshot: snapshot,
      isCompareMode: false,
      comparingSnapshots: [null, null]
    })
  },

  clearViewingSnapshot: () => {
    set({ viewingSnapshot: null })
  },

  enterCompareMode: (snapshot1: AnalysisSnapshot, snapshot2: AnalysisSnapshot) => {
    set({
      isCompareMode: true,
      comparingSnapshots: [snapshot1, snapshot2],
      viewingSnapshot: null
    })
  },

  exitCompareMode: () => {
    set({
      isCompareMode: false,
      comparingSnapshots: [null, null]
    })
  },
}))
