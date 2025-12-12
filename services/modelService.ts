import type { DigitalModel, ModelSummary, ModelId, DigitalElement } from "../types"
import { performanceReviewModelData, habitatModelData } from "../constants"

const LOCAL_STORAGE_KEY = "TANDT_MODELS"

// Helper to get all models from localStorage
const getModelsFromStorage = (): DigitalModel[] => {
  const modelsJson = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (modelsJson) {
    try {
      const models = JSON.parse(modelsJson)
      if (!Array.isArray(models)) {
        console.error("localStorage data is not an array, reinitializing")
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        return getDefaultModels()
      }
      if (models.length === 0) {
        console.log("No models found, initializing with defaults")
        const defaultModels = getDefaultModels()
        saveModelsToStorage(defaultModels)
        return defaultModels
      }
      return models
    } catch (e) {
      console.error("Failed to parse models from localStorage", e)
      // If parsing fails, clear the corrupted data and return defaults
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return getDefaultModels()
    }
  }
  return getDefaultModels()
}

const getDefaultModels = (): DigitalModel[] => {
  return [JSON.parse(JSON.stringify(performanceReviewModelData)), JSON.parse(JSON.stringify(habitatModelData))]
}

// Helper to save all models to localStorage
const saveModelsToStorage = (models: DigitalModel[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models))
  } catch (e) {
    console.error("Failed to save models to localStorage", e)
    // Handle quota exceeded or other storage errors
  }
}

// Initialize localStorage with default data if it's empty
const initializeLocalStorage = () => {
  const existing = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!existing) {
    console.log("Initializing local storage with default models.")
    saveModelsToStorage(getDefaultModels())
  } else {
    try {
      const models = JSON.parse(existing)
      if (!Array.isArray(models) || models.length === 0) {
        console.log("Invalid or empty models in storage, reinitializing.")
        saveModelsToStorage(getDefaultModels())
      }
    } catch (e) {
      console.error("Corrupted localStorage detected, reinitializing")
      saveModelsToStorage(getDefaultModels())
    }
  }
}

// Run initialization once when the service is imported
initializeLocalStorage()

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
  await new Promise((resolve) => setTimeout(resolve, 50)) // simulate slight delay
  const models = getModelsFromStorage()
  return models
    .map((model) => ({
      id: model.Idug,
      name: model.DigitalTopic,
      type: model.DigitalThinkingModelType,
      description:
        model.Note ||
        (model.DigitalThinkingModelType === 1
          ? "Make a clear YES/NO decision by building a dominance hierarchy."
          : "Evaluate team/project performance with state and trend analysis."),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Fetches a model from storage and processes it for use
export const getModel = async (modelId: ModelId): Promise<DigitalModel> => {
  console.log(`[v0] Fetching model from storage: ${modelId}`)
  await new Promise((resolve) => setTimeout(resolve, 100))

  const models = getModelsFromStorage()
  console.log(
    `[v0] Available models in storage:`,
    models.map((m) => ({ id: m.Idug, name: m.DigitalTopic })),
  )

  const rawModel = models.find((m) => m.Idug === modelId)

  if (!rawModel) {
    const availableIds = models.map((m) => m.Idug).join(", ")
    console.error(`[v0] Model with ID "${modelId}" not found. Available IDs: ${availableIds}`)
    throw new Error(`Model with ID "${modelId}" not found in local storage. Available models: ${availableIds}`)
  }

  console.log(`[v0] Found model: ${rawModel.DigitalTopic}`)
  // Deep copy to prevent mutation of the state
  const modelCopy = JSON.parse(JSON.stringify(rawModel))
  // Process the model to reset state and calculate derived values for a clean session
  return processModel(modelCopy)
}

// Saves a single model back to the collection in storage
export const saveModel = async (updatedModel: DigitalModel): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const models = getModelsFromStorage()
  const modelIndex = models.findIndex((m) => m.Idug === updatedModel.Idug)

  if (modelIndex > -1) {
    models[modelIndex] = updatedModel
    saveModelsToStorage(models)
  } else {
    throw new Error(`Could not find model with ID ${updatedModel.Idug} to save.`)
  }
}

export const createModel = async (config: {
  topic: string
  type: number
  elements: { name: string; description: string }[]
}): Promise<DigitalModel> => {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const newModelId = `model-${Date.now()}`
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

  const newModel: DigitalModel = {
    Idug: newModelId,
    DigitalTopic: config.topic,
    ModelName: config.topic.replace(/\s/g, ""),
    DigitalThinkingModelType: config.type,
    Model: newElements,
    history: [],
    Note: `A new model for ${isDecisionModel ? "decision making" : "performance review"}.`,
    AutoSaveModel: true,
    HasIssue: false,
    Decision: false,
    Decided: false,
    FileSuffix: "",
    Valid: true,
    FileId: `${config.topic.replace(/\s/g, "")}__${newModelId}`,
    TwoOnly: isDecisionModel,
  }

  const models = getModelsFromStorage()
  models.push(newModel)
  saveModelsToStorage(models)
  return newModel
}

export const deleteModel = async (modelId: ModelId): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 50))
  let models = getModelsFromStorage()
  models = models.filter((m) => m.Idug !== modelId)
  saveModelsToStorage(models)
}

export const importModel = async (modelToImport: DigitalModel): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 50))

  if (!modelToImport.Idug || !modelToImport.DigitalTopic || !Array.isArray(modelToImport.Model)) {
    throw new Error("Invalid model format. The file does not appear to be a valid TandT model.")
  }

  const models = getModelsFromStorage()
  const existingModelIndex = models.findIndex((m) => m.Idug === modelToImport.Idug)

  const modelCopy = JSON.parse(JSON.stringify(modelToImport))

  if (existingModelIndex > -1) {
    modelCopy.Idug = `model-${Date.now()}`
    modelCopy.DigitalTopic = `${modelCopy.DigitalTopic} (Imported)`
    models.push(modelCopy)
  } else {
    models.push(modelCopy)
  }

  saveModelsToStorage(models)
}

export const exportModel = async (modelId: ModelId): Promise<{ modelData: DigitalModel; fileName: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const models = getModelsFromStorage()
  const modelToExport = models.find((m) => m.Idug === modelId)

  if (!modelToExport) {
    throw new Error(`Model with ID ${modelId} not found for export.`)
  }

  const fileName = `${modelToExport.DigitalTopic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
  return { modelData: modelToExport, fileName }
}
