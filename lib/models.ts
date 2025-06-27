// @ts-nocheck
// TandT Models Library - Complete Model Management System
// Handles CRUD operations, statistics, and data persistence

// NOTE: Node-only modules are loaded dynamically to prevent Next.js client bundle errors.

import type {
  DigitalModel,
  DecisionMakingModel,
  PerformanceReviewModel,
  DigitalElement,
  DecisionMakingElement,
  PerformanceReviewElement,
  BusinessAnalysisElement,
  CreateModelRequest,
  CreateElementRequest,
  ModelStatistics,
  DashboardStats,
  ActivityEntry,
  ModelResponse,
  ElementResponse,
} from "./types"
import {
  DigitalThinkingModelType,
  ElementStatus,
  PerformanceTrend,
  PriorityLevel,
  MODEL_TYPE_LABELS,
} from "./constants"
import { isDecisionMakingModel, isPerformanceReviewModel, isBusinessAnalysisModel } from "./types"

// In-memory storage for models (in production, this would be a database)
const modelsCache: DigitalModel[] = []
let initialized = false

// Initialize models from sample files
async function initializeModels(): Promise<void> {
  if (initialized || typeof window !== 'undefined') return
  
  try {
    // Only load fs and path on server side
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const samplesDir = path.join(process.cwd(), "samples")
    
    try {
      const files = await fs.readdir(samplesDir)
      const jsonFiles = files.filter((file) => file.endsWith(".json"))

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(samplesDir, file)
          const content = await fs.readFile(filePath, "utf-8")
          const modelData = JSON.parse(content)

          // Extract ID from filename or use the model's ID
          const fileId = file.match(/([a-f0-9-]{36})/)?.[1]
          if (fileId) {
            modelData.id = fileId
          }

          // Ensure required fields exist
          if (!modelData.dtCreated) {
            modelData.dtCreated = new Date().toISOString()
          }
          if (!modelData.dtModified) {
            modelData.dtModified = new Date().toISOString()
          }

          modelsCache.push(modelData)
        } catch (error) {
          console.error(`Error loading model from ${file}:`, error)
        }
      }
    } catch (error) {
      console.log("No samples directory found, starting with empty models")
    }
  } catch (error) {
    console.error("Error initializing models:", error)
  }

  initialized = true
}

// Ensure models are initialized before any operations
const ensureInitialized = async () => {
  if (!initialized) {
    await initializeModels()
  }
}

// Load models from samples directory - exported function
export async function loadModelsFromSamples(): Promise<DigitalModel[]> {
  await ensureInitialized()
  return [...modelsCache]
}

// Get all models
export async function getAllModels(): Promise<DigitalModel[]> {
  await ensureInitialized()
  return [...modelsCache]
}

// Get model by ID
export async function getModelById(id: string): Promise<DigitalModel | null> {
  await ensureInitialized()
  return modelsCache.find((model) => model.id === id) || null
}

// Create new model
export async function createModel(request: CreateModelRequest): Promise<ModelResponse> {
  try {
    await ensureInitialized()

    const newModel: DigitalModel = {
      id: generateId(),
      modelName: request.modelName,
      digitalTopic: request.digitalTopic,
      digitalThinkingModelType: request.digitalThinkingModelType,
      decided: false,
      valid: false,
      autoSaveModel: true,
      hasIssue: false,
      note: request.note || "",
      dtCreated: new Date().toISOString(),
      dtModified: new Date().toISOString(),
      model: [],
      // Type-specific properties
      ...(request.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING
        ? { twoOnly: true, comparisonMatrix: createEmptyComparisonMatrix() }
        : request.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW
          ? { twoOnly: false, performanceDashboard: createEmptyPerformanceDashboard() }
          : { twoOnly: false, businessMetrics: [], analysisResults: [] }),
    } as DigitalModel

    modelsCache.push(newModel)

    return {
      success: true,
      model: newModel,
      message: "Model created successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create model",
    }
  }
}

// Update model
export async function updateModel(id: string, updates: Partial<DigitalModel>): Promise<ModelResponse> {
  try {
    await ensureInitialized()

    const modelIndex = modelsCache.findIndex((model) => model.id === id)
    if (modelIndex === -1) {
      return {
        success: false,
        error: "Model not found",
      }
    }

    modelsCache[modelIndex] = {
      ...modelsCache[modelIndex],
      ...updates,
      dtModified: new Date().toISOString(),
    }

    return {
      success: true,
      model: modelsCache[modelIndex],
      message: "Model updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update model",
    }
  }
}

// Delete model
export async function deleteModel(id: string): Promise<ModelResponse> {
  try {
    await ensureInitialized()

    const modelIndex = modelsCache.findIndex((model) => model.id === id)
    if (modelIndex === -1) {
      return {
        success: false,
        error: "Model not found",
      }
    }

    const deletedModel = modelsCache.splice(modelIndex, 1)[0]

    return {
      success: true,
      model: deletedModel,
      message: "Model deleted successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete model",
    }
  }
}

// Add element to model
export async function addElementToModel(modelId: string, request: CreateElementRequest): Promise<ElementResponse> {
  try {
    await ensureInitialized()

    const model = modelsCache.find((m) => m.id === modelId)
    if (!model) {
      return {
        success: false,
        error: "Model not found",
      }
    }

    const newElement: DigitalElement = createNewElement(model.digitalThinkingModelType, request)
    model.model.push(newElement)
    model.dtModified = new Date().toISOString()

    return {
      success: true,
      element: newElement,
      message: "Element added successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add element",
    }
  }
}

// Update element
export async function updateElement(
  modelId: string,
  elementId: string,
  updates: Partial<DigitalElement>,
): Promise<ElementResponse> {
  try {
    await ensureInitialized()

    const model = modelsCache.find((m) => m.id === modelId)
    if (!model) {
      return {
        success: false,
        error: "Model not found",
      }
    }

    const elementIndex = model.model.findIndex((e) => e.idug === elementId)
    if (elementIndex === -1) {
      return {
        success: false,
        error: "Element not found",
      }
    }

    model.model[elementIndex] = {
      ...model.model[elementIndex],
      ...updates,
      dtModified: new Date().toISOString(),
    }
    model.dtModified = new Date().toISOString()

    return {
      success: true,
      element: model.model[elementIndex],
      message: "Element updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update element",
    }
  }
}

// Evaluate element acceptability - exported function
export async function evaluateElementAcceptability(
  modelId: string,
  elementId: string,
  isAcceptable: boolean,
): Promise<DigitalModel | null> {
  try {
    const model = await getModelById(modelId)
    if (!model) {
      return null
    }

    const elementIndex = model.model.findIndex((e) => e.idug === elementId)
    if (elementIndex === -1) {
      return null
    }

    model.model[elementIndex].twoFlag = isAcceptable
    model.model[elementIndex].twoFlagAnswered = true
    model.model[elementIndex].dtModified = new Date().toISOString()
    model.dtModified = new Date().toISOString()

    const updateResult = await updateModel(modelId, model)
    return updateResult.success ? updateResult.model || null : null
  } catch (error) {
    console.error("Error evaluating element acceptability:", error)
    return null
  }
}

// Evaluate element performance - exported function
export async function evaluateElementPerformance(
  modelId: string,
  elementId: string,
  performanceTrend: number,
): Promise<DigitalModel | null> {
  try {
    const model = await getModelById(modelId)
    if (!model) {
      return null
    }

    // Only allow performance evaluation for Performance Review models
    if (model.digitalThinkingModelType !== DigitalThinkingModelType.PERFORMANCE_REVIEW) {
      throw new Error("Performance evaluation only available for Performance Review models")
    }

    const elementIndex = model.model.findIndex((e) => e.idug === elementId)
    if (elementIndex === -1) {
      return null
    }

    model.model[elementIndex].threeFlag = performanceTrend as PerformanceTrend
    model.model[elementIndex].threeFlagAnswered = true
    model.model[elementIndex].dtModified = new Date().toISOString()
    model.dtModified = new Date().toISOString()

    const updateResult = await updateModel(modelId, model)
    return updateResult.success ? updateResult.model || null : null
  } catch (error) {
    console.error("Error evaluating element performance:", error)
    return null
  }
}

// Process pairwise comparison - exported function
export async function processComparison(
  modelId: string,
  element1Id: string,
  element2Id: string,
  decisionValue: "YES" | "NO",
): Promise<DigitalModel | null> {
  try {
    const model = await getModelById(modelId)
    if (!model) {
      return null
    }

    // Only allow comparisons for Decision Making models
    if (model.digitalThinkingModelType !== DigitalThinkingModelType.DECISION_MAKING) {
      throw new Error("Pairwise comparison only available for Decision Making models")
    }

    const element1 = model.model.find((e) => e.idug === element1Id)
    const element2 = model.model.find((e) => e.idug === element2Id)

    if (!element1 || !element2) {
      return null
    }

    const comparisonValue = decisionValue === "YES" ? 1 : -1

    // Update element1's comparison data
    if (!element1.comparationTableData) {
      element1.comparationTableData = {}
    }
    element1.comparationTableData[element2Id] = comparisonValue

    // Update element2's comparison data (inverse)
    if (!element2.comparationTableData) {
      element2.comparationTableData = {}
    }
    element2.comparationTableData[element1Id] = -comparisonValue

    // Mark comparison as completed
    element1.comparationCompleted = true
    element2.comparationCompleted = true

    model.dtModified = new Date().toISOString()

    const updateResult = await updateModel(modelId, model)
    return updateResult.success ? updateResult.model || null : null
  } catch (error) {
    console.error("Error processing comparison:", error)
    return null
  }
}

// Calculate dominance factors - exported function
export async function calculateDominanceFactors(modelId: string): Promise<DigitalModel | null> {
  try {
    const model = await getModelById(modelId)
    if (!model) {
      return null
    }

    // Only calculate dominance for Decision Making models
    if (model.digitalThinkingModelType !== DigitalThinkingModelType.DECISION_MAKING) {
      throw new Error("Dominance calculation only available for Decision Making models")
    }

    const elements = model.model as DecisionMakingElement[]

    // Calculate dominance factors for each element
    elements.forEach((element) => {
      const comparisons = Object.values(element.comparationTableData || {})
      if (comparisons.length > 0) {
        const totalScore = comparisons.reduce((sum, value) => sum + value, 0)
        element.dominanceFactor = totalScore / comparisons.length
        element.dominantElementItIS = element.dominanceFactor > 0
      } else {
        element.dominanceFactor = 0
        element.dominantElementItIS = false
      }
    })

    model.dtModified = new Date().toISOString()

    const updateResult = await updateModel(modelId, model)
    return updateResult.success ? updateResult.model || null : null
  } catch (error) {
    console.error("Error calculating dominance factors:", error)
    return null
  }
}

// Get model statistics
export async function getModelStatistics(modelId: string): Promise<ModelStatistics | null> {
  await ensureInitialized()

  const model = modelsCache.find((m) => m.id === modelId)
  if (!model) return null

  const totalElements = model.model.length
  const evaluatedElements = model.model.filter((e) => e.twoFlagAnswered).length
  const evaluationProgress = totalElements > 0 ? (evaluatedElements / totalElements) * 100 : 0

  const baseStats: ModelStatistics = {
    totalElements,
    evaluatedElements,
    evaluationProgress,
    modelType: model.digitalThinkingModelType.toString(),
    modelTypeName: MODEL_TYPE_LABELS[model.digitalThinkingModelType] || "Unknown",
    isValid: model.valid,
    hasIssues: model.hasIssue,
    lastModified: model.dtModified,
  }

  // Add type-specific statistics
  if (model.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING) {
    const decisionModel = model as DecisionMakingModel
    const totalComparisons = calculateTotalComparisons(totalElements)
    const completedComparisons = decisionModel.comparisonMatrix?.completedComparisons || 0

    return {
      ...baseStats,
      totalComparisons,
      completedComparisons,
      comparisonProgress: totalComparisons > 0 ? (completedComparisons / totalComparisons) * 100 : 0,
      consistencyScore: decisionModel.comparisonMatrix?.consistencyScore || 0,
      dominantElements: model.model.filter((e) => (e as DecisionMakingElement).dominantElementItIS).length,
    }
  }

  if (model.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW) {
    const performanceElements = model.model.filter((e) => e.threeFlagAnswered).length
    const improvingElements = model.model.filter((e) => e.threeFlag === PerformanceTrend.GETTING_BETTER).length
    const decliningElements = model.model.filter((e) => e.threeFlag === PerformanceTrend.GETTING_WORSE).length
    const highPriorityElements = model.model.filter(
      (e) =>
        (e as PerformanceReviewElement).priorityLevel === PriorityLevel.HIGH ||
        (e as PerformanceReviewElement).priorityLevel === PriorityLevel.CRITICAL,
    ).length

    return {
      ...baseStats,
      performanceEvaluated: performanceElements,
      performanceProgress: totalElements > 0 ? (performanceElements / totalElements) * 100 : 0,
      improvingElements,
      decliningElements,
      highPriorityElements,
    }
  }

  return baseStats
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureInitialized()

  const totalModels = modelsCache.length
  const decisionMakingModels = modelsCache.filter(
    (m) => m.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING,
  ).length
  const performanceReviewModels = modelsCache.filter(
    (m) => m.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW,
  ).length
  const businessAnalysisModels = modelsCache.filter(
    (m) => m.digitalThinkingModelType === DigitalThinkingModelType.BUSINESS_ANALYSIS,
  ).length
  const completedModels = modelsCache.filter((m) => m.decided && m.valid).length
  const modelsInProgress = modelsCache.filter((m) => !m.decided || !m.valid).length

  // Generate recent activity (mock data for now)
  const recentActivity: ActivityEntry[] = modelsCache
    .sort((a, b) => new Date(b.dtModified).getTime() - new Date(a.dtModified).getTime())
    .slice(0, 5)
    .map((model) => ({
      id: generateId(),
      type: "model_updated" as const,
      modelId: model.id,
      modelName: model.modelName,
      timestamp: model.dtModified,
      description: `Updated ${model.modelName}`,
    }))

  return {
    totalModels,
    decisionMakingModels,
    performanceReviewModels,
    businessAnalysisModels,
    completedModels,
    modelsInProgress,
    recentActivity,
  }
}

// Helper functions
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function createNewElement(modelType: DigitalThinkingModelType, request: CreateElementRequest): DigitalElement {
  const baseElement = {
    idug: generateId(),
    nameElement: request.nameElement,
    displayName: request.displayName,
    description: request.description,
    sortNo: 0,
    status: ElementStatus.ACTIVE,
    twoFlag: false,
    twoFlagAnswered: false,
    question: false,
    dtCreated: new Date().toISOString(),
    dtModified: new Date().toISOString(),
  }

  switch (modelType) {
    case DigitalThinkingModelType.DECISION_MAKING:
      return {
        ...baseElement,
        threeFlag: 0,
        threeFlagAnswered: false,
        dominanceFactor: 0,
        dominantElementItIS: false,
        comparationCompleted: false,
        comparationTableData: {},
      } as DecisionMakingElement

    case DigitalThinkingModelType.PERFORMANCE_REVIEW:
      return {
        ...baseElement,
        threeFlag: PerformanceTrend.STAYING_SAME,
        threeFlagAnswered: false,
        dominanceFactor: 0,
        dominantElementItIS: false,
        comparationCompleted: false,
        comparationTableData: {},
        priorityLevel: PriorityLevel.MEDIUM,
        improvementRequired: false,
        performanceHistory: [],
      } as PerformanceReviewElement

    case DigitalThinkingModelType.BUSINESS_ANALYSIS:
      return {
        ...baseElement,
        threeFlag: PerformanceTrend.STAYING_SAME,
        threeFlagAnswered: false,
        dominanceFactor: 0,
        dominantElementItIS: false,
        comparationCompleted: false,
        comparationTableData: {},
        businessImpact: PriorityLevel.MEDIUM,
        riskLevel: PriorityLevel.MEDIUM,
        costImplication: 0,
        timeToImplement: 0,
      } as BusinessAnalysisElement

    default:
      throw new Error(`Unsupported model type: ${modelType}`)
  }
}

function createEmptyComparisonMatrix() {
  return {
    totalComparisons: 0,
    completedComparisons: 0,
    consistencyScore: 0,
    matrix: {},
    pairs: [],
  }
}

function createEmptyPerformanceDashboard() {
  return {
    overallScore: 0,
    trendDirection: PerformanceTrend.STAYING_SAME,
    acceptableElements: [],
    unacceptableElements: [],
    improvingElements: [],
    decliningElements: [],
    priorityAreas: [],
    lastUpdated: new Date().toISOString(),
  }
}

function calculateTotalComparisons(elementCount: number): number {
  return elementCount > 1 ? (elementCount * (elementCount - 1)) / 2 : 0
}

export function getModelStats(model: DigitalModel) {
  const totalElements = model.model.length
  if (totalElements === 0) {
    return {
      totalElements: 0,
      evaluatedElements: 0,
      evaluationProgress: 0,
      comparisonProgress: 0, // for decision making
      performanceProgress: 0, // for performance review
      isValid: false,
    }
  }

  if (isDecisionMakingModel(model)) {
    const evaluatedElements = model.model.filter((el) => el.twoFlagAnswered).length
    const comparisonsNeeded = (totalElements * (totalElements - 1)) / 2
    const comparisonsMade = model.model.reduce((acc, el) => {
      return acc + Object.values(el.comparationTableData).filter(v => v !== 0).length
    }, 0) / 2;

    return {
      totalElements,
      evaluatedElements,
      evaluationProgress: totalElements > 0 ? evaluatedElements / totalElements : 0,
      comparisonProgress: comparisonsNeeded > 0 ? comparisonsMade / comparisonsNeeded : 0,
      isValid: comparisonsMade >= comparisonsNeeded,
    }
  }

  if (isPerformanceReviewModel(model)) {
    const evaluatedElements = model.model.filter((el) => el.threeFlagAnswered).length
    return {
      totalElements,
      evaluatedElements,
      evaluationProgress: totalElements > 0 ? evaluatedElements / totalElements : 0,
      performanceProgress: totalElements > 0 ? evaluatedElements / totalElements : 0,
      isValid: true, // Performance models don't have a strict validity gate like comparisons
    }
  }

  return {
    totalElements,
    evaluatedElements: 0,
    evaluationProgress: 0,
    comparisonProgress: 0,
    performanceProgress: 0,
    isValid: false,
  }
}

// Export all functions
