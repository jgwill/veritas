// @ts-nocheck
// TandT Models Library - Complete Model Management System
// Handles CRUD operations, statistics, and data persistence

// NOTE: Node-only modules are loaded dynamically to prevent Next.js client bundle errors.

import type {
  DigitalModel,
  DecisionMakingModel,
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

// In-memory storage for models (in production, this would be a database)
const modelsCache: DigitalModel[] = []
let initialized = false

// Initialize models from sample files
async function initializeModels(): Promise<void> {
  try {
    // Skip file-system initialization on the client/browser to avoid bundling fs/path.
    if (typeof window !== "undefined") {
      initialized = true
      return
    }

    // Dynamically import Node-only modules.
    const { promises: fs } = await import("fs")
    const path = await import("path")

    const samplesDir = path.join(process.cwd(), "samples")
    let files: string[] = []
    try {
      files = await fs.readdir(samplesDir)
    } catch {
      // samples directory may not exist in production; ignore.
      files = []
    }

    const jsonFiles = files.filter((file) => file.endsWith(".json"))

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(samplesDir, file)
        const content = await fs.readFile(filePath, "utf-8")
        const modelData = JSON.parse(content)

        // Extract ID from filename or use the model's ID
        const fileId = file.match(/([a-f0-9-]{36})/)?.[1]
        if (fileId) modelData.id = fileId

        modelData.dtCreated ||= new Date().toISOString()
        modelData.dtModified ||= new Date().toISOString()

        modelsCache.push(modelData as DigitalModel)
      } catch (error) {
        console.warn(`Failed to load sample file ${file}:`, error)
      }
    }

    initialized = true
  } catch (error) {
    console.warn("Failed to initialize models from samples:", error)
    initialized = true // Prevent repeated attempts
  }
}

// Get all models
export async function getAllModels(): Promise<DigitalModel[]> {
  await initializeModels()
  return [...modelsCache]
}

// Get model by ID
export async function getModelById(id: string): Promise<DigitalModel | null> {
  await initializeModels()
  return modelsCache.find((model) => model.id === id) || null
}

// Create new model
export async function createModel(request: CreateModelRequest): Promise<ModelResponse> {
  try {
    await initializeModels()

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
    await initializeModels()

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
    await initializeModels()

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
    await initializeModels()

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
    await initializeModels()

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

// Get model statistics
export async function getModelStatistics(modelId: string): Promise<ModelStatistics | null> {
  await initializeModels()

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
  await initializeModels()

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

// Export all functions
