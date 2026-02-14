import type { DigitalModel, ModelSummary, ModelId, DigitalElement } from "../types"
import { getAuthToken } from "./authService"

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Utility to reset analysis state, preparing it for a new session
const resetModelAnalysisState = (model: DigitalModel): DigitalModel => {
  const resetElements = model.Model.map((el) => ({
    ...el,
    TwoFlag: false,
    TwoFlagAnswered: false,
    ThreeFlag: 0,
    ThreeFlagAnswered: false,
  }))
  return { ...model, Model: resetElements }
}

// Utility to process a model after loading
const processModel = (model: DigitalModel): DigitalModel => {
  // 1. Reset analysis state for a fresh session
  const resetModel = resetModelAnalysisState(model)

  // Ensure history exists
  if (!resetModel.history) {
    resetModel.history = []
  }

  // 2. Process based on model type
  if (resetModel.DigitalThinkingModelType === 1) {
    // For Decision Models, ensure comparison tables are fully initialized and dominance factors are correct
    const allIdugs = resetModel.Model.map((el) => el.Idug)

    const updatedElements = resetModel.Model.map((element) => {
      const newTable = { ...element.ComparationTableData }
      allIdugs.forEach((idug) => {
        if (idug !== element.Idug && !(idug in newTable)) {
          newTable[idug] = 0 // Initialize as neutral if not present
        }
      })
      // Recalculate dominance factor based on the potentially updated table
      const dominanceFactor = Object.values(newTable).filter((v) => v === 1).length
      return { ...element, ComparationTableData: newTable, DominanceFactor: dominanceFactor }
    })

    return { ...resetModel, Model: updatedElements }
  }

  return resetModel // For other model types, just return the reset model
}

export const getAvailableModels = async (): Promise<ModelSummary[]> => {
  try {
    const response = await fetch('/api/models', {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }
    
    const data = await response.json()
    const models = data.models || []
    
    return models
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        type: model.model_type,
        description: model.description || (model.model_type === 1
          ? "Make a clear YES/NO decision by building a dominance hierarchy."
          : "Evaluate team/project performance with state and trend analysis."),
      }))
      .sort((a: ModelSummary, b: ModelSummary) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('[v0] Failed to fetch models:', error)
    return []
  }
}

// Fetches a model from API and processes it for use
export const getModel = async (modelId: ModelId): Promise<DigitalModel> => {
  console.log(`[v0] Fetching model from API: ${modelId}`)
  
  try {
    const response = await fetch(`/api/models/${modelId}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch model')
    }
    
    const data = await response.json()
    const dbModel = data.model
    
    // Convert database model to DigitalModel format
    const rawModel: DigitalModel = {
      Idug: dbModel.id,
      DigitalTopic: dbModel.name,
      ModelName: dbModel.name.replace(/\s/g, ""),
      DigitalThinkingModelType: dbModel.model_type,
      Model: dbModel.model_data?.Model || [],
      history: dbModel.model_data?.history || [],
      Note: dbModel.description || "",
      AutoSaveModel: true,
      HasIssue: false,
      Decision: false,
      Decided: false,
      FileSuffix: "",
      Valid: true,
      FileId: `${dbModel.name.replace(/\s/g, "")}__${dbModel.id}`,
      TwoOnly: dbModel.model_type === 1,
    }
    
    console.log(`[v0] Found model: ${rawModel.DigitalTopic}`)
    // Deep copy to prevent mutation of the state
    const modelCopy = JSON.parse(JSON.stringify(rawModel))
    // Process the model to reset state and calculate derived values for a clean session
    return processModel(modelCopy)
  } catch (error) {
    console.error(`[v0] Failed to fetch model:`, error)
    throw error
  }
}

// Saves a single model back to the API
export const saveModel = async (updatedModel: DigitalModel): Promise<void> => {
  try {
    const response = await fetch(`/api/models/${updatedModel.Idug}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: updatedModel.DigitalTopic,
        description: updatedModel.Note,
        modelData: {
          Model: updatedModel.Model,
          history: updatedModel.history
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save model')
    }
    
    console.log('[v0] Model saved to database successfully')
  } catch (error) {
    console.error('[v0] Failed to save model:', error)
    throw error
  }
}

export const createModel = async (config: {
  topic: string
  type: number
  elements: { name: string; description: string }[]
}): Promise<DigitalModel> => {
  const isDecisionModel = config.type === 1

  const newElements: DigitalElement[] = config.elements.map((el, index) => ({
    Idug: `el-${Date.now()}-${index}`,
    DisplayName: el.name,
    Description: el.description,
    NameElement: el.name.replace(/\s/g, ""),
    ComparationTableData: {},
    DominanceFactor: 0,
    SortNo: index,
    ComparationCompleted: false,
    DominantElementItIS: false,
    Meta: {},
    DtModified: new Date().toISOString(),
    DtCreated: new Date().toISOString(),
    Tlid: Date.now().toString(),
    TwoOnly: isDecisionModel,
    TwoFlag: false,
    TwoFlagAnswered: false,
    ThreeFlag: 0,
    ThreeFlagAnswered: false,
    Status: 1,
    Question: false,
    TelescopedModel: null,
  }))

  if (isDecisionModel) {
    const allIdugs = newElements.map((e) => e.Idug)
    newElements.forEach((element) => {
      const compTable: { [key: string]: number } = {}
      allIdugs.forEach((idug) => {
        if (idug !== element.Idug) {
          compTable[idug] = 0 // Initialize all comparisons to neutral
        }
      })
      element.ComparationTableData = compTable
    })
  }

  try {
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: config.topic,
        description: `A new model for ${isDecisionModel ? "decision making" : "performance review"}.`,
        modelType: config.type,
        modelData: {
          Model: newElements,
          history: []
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create model')
    }
    
    const data = await response.json()
    const dbModel = data.model
    
    // Convert database response to DigitalModel format
    const newModel: DigitalModel = {
      Idug: dbModel.id,
      DigitalTopic: dbModel.name,
      ModelName: dbModel.name.replace(/\s/g, ""),
      DigitalThinkingModelType: dbModel.model_type,
      Model: newElements,
      history: [],
      Note: dbModel.description || "",
      AutoSaveModel: true,
      HasIssue: false,
      Decision: false,
      Decided: false,
      FileSuffix: "",
      Valid: true,
      FileId: `${dbModel.name.replace(/\s/g, "")}__${dbModel.id}`,
      TwoOnly: isDecisionModel,
    }
    
    return newModel
  } catch (error) {
    console.error('[v0] Failed to create model:', error)
    throw error
  }
}

export const deleteModel = async (modelId: ModelId): Promise<void> => {
  try {
    const response = await fetch(`/api/models/${modelId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete model')
    }
  } catch (error) {
    console.error('[v0] Failed to delete model:', error)
    throw error
  }
}

export const importModel = async (modelToImport: DigitalModel): Promise<void> => {
  if (!modelToImport.Idug || !modelToImport.DigitalTopic || !Array.isArray(modelToImport.Model)) {
    throw new Error("Invalid model format. The file does not appear to be a valid TandT model.")
  }

  try {
    // Check if a model with the same topic already exists
    const existingModels = await getAvailableModels()
    const hasDuplicate = existingModels.some(m => m.name === modelToImport.DigitalTopic)
    
    const modelName = hasDuplicate 
      ? `${modelToImport.DigitalTopic} (Imported)` 
      : modelToImport.DigitalTopic

    // Create the model via API
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: modelName,
        description: modelToImport.Note || `Imported model from previous version`,
        modelType: modelToImport.DigitalThinkingModelType,
        modelData: {
          Model: modelToImport.Model,
          history: modelToImport.history || []
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to import model')
    }
    
    console.log('[v0] Model imported successfully')
  } catch (error) {
    console.error('[v0] Failed to import model:', error)
    throw error
  }
}

export const exportModel = async (modelId: ModelId): Promise<{ modelData: DigitalModel; fileName: string }> => {
  try {
    const response = await fetch(`/api/models/${modelId}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch model for export')
    }
    
    const data = await response.json()
    const dbModel = data.model
    
    // Convert database model to DigitalModel format for export
    const modelToExport: DigitalModel = {
      Idug: dbModel.id,
      DigitalTopic: dbModel.name,
      ModelName: dbModel.name.replace(/\s/g, ""),
      DigitalThinkingModelType: dbModel.model_type,
      Model: dbModel.model_data?.Model || [],
      history: dbModel.model_data?.history || [],
      Note: dbModel.description || "",
      AutoSaveModel: true,
      HasIssue: false,
      Decision: false,
      Decided: false,
      FileSuffix: "",
      Valid: true,
      FileId: `${dbModel.name.replace(/\s/g, "")}__${dbModel.id}`,
      TwoOnly: dbModel.model_type === 1,
    }

    const fileName = `${modelToExport.DigitalTopic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}__${modelToExport.Idug}.json`
    return { modelData: modelToExport, fileName }
  } catch (error) {
    console.error('[v0] Failed to export model:', error)
    throw error
  }
}
