"use server"

import type {
  CreateModelRequest,
  CreateElementRequest,
  EvaluateElementRequest,
  ComparisonRequest,
  ModelResponse,
  ModelsResponse,
  ElementResponse,
  DigitalModel,
  ModelStatistics,
  DashboardStats,
} from "./types"
import {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  addElementToModel,
  updateElement,
  getModelStatistics,
  getDashboardStats,
} from "./models"

// Model Management Actions
export async function fetchAllModels(): Promise<ModelsResponse> {
  try {
    const models = await getAllModels()
    return {
      success: true,
      models,
      message: `Retrieved ${models.length} models`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch models",
    }
  }
}

export async function fetchModelById(id: string): Promise<ModelResponse> {
  try {
    const model = await getModelById(id)
    if (!model) {
      return {
        success: false,
        error: "Model not found",
      }
    }
    return {
      success: true,
      model,
      message: "Model retrieved successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch model",
    }
  }
}

export async function createNewModel(request: CreateModelRequest): Promise<ModelResponse> {
  try {
    // Validate input
    if (!request.modelName?.trim()) {
      return {
        success: false,
        error: "Model name is required",
      }
    }

    if (!request.digitalTopic?.trim()) {
      return {
        success: false,
        error: "Digital topic is required",
      }
    }

    if (!request.digitalThinkingModelType) {
      return {
        success: false,
        error: "Model type is required",
      }
    }

    return await createModel(request)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create model",
    }
  }
}

export async function updateExistingModel(id: string, updates: Partial<DigitalModel>): Promise<ModelResponse> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    return await updateModel(id, updates)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update model",
    }
  }
}

export async function deleteExistingModel(id: string): Promise<ModelResponse> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    return await deleteModel(id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete model",
    }
  }
}

// Element Management Actions
export async function addNewElement(modelId: string, request: CreateElementRequest): Promise<ElementResponse> {
  try {
    // Validate input
    if (!modelId?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    if (!request.nameElement?.trim()) {
      return {
        success: false,
        error: "Element name is required",
      }
    }

    if (!request.displayName?.trim()) {
      return {
        success: false,
        error: "Display name is required",
      }
    }

    return await addElementToModel(modelId, request)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add element",
    }
  }
}

export async function updateExistingElement(
  modelId: string,
  elementId: string,
  updates: any,
): Promise<ElementResponse> {
  try {
    if (!modelId?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    if (!elementId?.trim()) {
      return {
        success: false,
        error: "Element ID is required",
      }
    }

    return await updateElement(modelId, elementId, updates)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update element",
    }
  }
}

// Evaluation Actions
export async function evaluateElement(
  modelId: string,
  elementId: string,
  request: EvaluateElementRequest,
): Promise<ElementResponse> {
  try {
    if (!modelId?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    if (!elementId?.trim()) {
      return {
        success: false,
        error: "Element ID is required",
      }
    }

    const updates = {
      twoFlag: request.isAcceptable,
      twoFlagAnswered: true,
      dtModified: new Date().toISOString(),
    }

    // Add performance trend if provided
    if (request.performanceTrend !== undefined) {
      Object.assign(updates, {
        threeFlag: request.performanceTrend,
        threeFlagAnswered: true,
      })
    }

    return await updateElement(modelId, elementId, updates)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to evaluate element",
    }
  }
}

export async function makeComparison(modelId: string, request: ComparisonRequest): Promise<ModelResponse> {
  try {
    if (!modelId?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    if (!request.element1Id?.trim() || !request.element2Id?.trim()) {
      return {
        success: false,
        error: "Both element IDs are required",
      }
    }

    if (!request.decision || !["YES", "NO"].includes(request.decision)) {
      return {
        success: false,
        error: "Valid decision (YES/NO) is required",
      }
    }

    // Get the model
    const modelResponse = await fetchModelById(modelId)
    if (!modelResponse.success || !modelResponse.model) {
      return modelResponse
    }

    const model = modelResponse.model

    // Update comparison data
    const element1 = model.model.find((e) => e.idug === request.element1Id)
    const element2 = model.model.find((e) => e.idug === request.element2Id)

    if (!element1 || !element2) {
      return {
        success: false,
        error: "One or both elements not found",
      }
    }

    // Update comparison table data
    const comparisonValue = request.decision === "YES" ? 1 : -1

    // Update element1's comparison data
    if (!element1.comparationTableData) {
      element1.comparationTableData = {}
    }
    element1.comparationTableData[request.element2Id] = comparisonValue

    // Update element2's comparison data (inverse)
    if (!element2.comparationTableData) {
      element2.comparationTableData = {}
    }
    element2.comparationTableData[request.element1Id] = -comparisonValue

    // Update the model
    return await updateModel(modelId, {
      model: model.model,
      dtModified: new Date().toISOString(),
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to make comparison",
    }
  }
}

// Statistics Actions
export async function fetchModelStatistics(
  modelId: string,
): Promise<{ success: boolean; statistics?: ModelStatistics; error?: string }> {
  try {
    if (!modelId?.trim()) {
      return {
        success: false,
        error: "Model ID is required",
      }
    }

    const statistics = await getModelStatistics(modelId)
    if (!statistics) {
      return {
        success: false,
        error: "Model not found",
      }
    }

    return {
      success: true,
      statistics,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch statistics",
    }
  }
}

export async function fetchDashboardStats(): Promise<{ success: boolean; stats?: DashboardStats; error?: string }> {
  try {
    const stats = await getDashboardStats()
    return {
      success: true,
      stats,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch dashboard statistics",
    }
  }
}

// Utility Actions
export async function validateModel(
  modelId: string,
): Promise<{ success: boolean; isValid?: boolean; issues?: string[]; error?: string }> {
  try {
    const modelResponse = await fetchModelById(modelId)
    if (!modelResponse.success || !modelResponse.model) {
      return {
        success: false,
        error: "Model not found",
      }
    }

    const model = modelResponse.model
    const issues: string[] = []

    // Basic validation
    if (model.model.length === 0) {
      issues.push("Model has no elements")
    }

    if (model.model.length < 2) {
      issues.push("Model needs at least 2 elements for meaningful analysis")
    }

    // Check if elements are evaluated
    const unevaluatedElements = model.model.filter((e) => !e.twoFlagAnswered)
    if (unevaluatedElements.length > 0) {
      issues.push(`${unevaluatedElements.length} elements are not evaluated`)
    }

    // Type-specific validation
    if (model.digitalThinkingModelType === 1) {
      // Decision Making
      const totalComparisons = model.model.length > 1 ? (model.model.length * (model.model.length - 1)) / 2 : 0
      const completedComparisons =
        model.model.reduce((count, element) => {
          return count + Object.keys(element.comparationTableData || {}).length
        }, 0) / 2 // Divide by 2 because each comparison is counted twice

      if (completedComparisons < totalComparisons) {
        issues.push(`${totalComparisons - completedComparisons} comparisons are missing`)
      }
    }

    const isValid = issues.length === 0

    // Update model validity
    if (model.valid !== isValid || model.hasIssue !== issues.length > 0) {
      await updateModel(modelId, {
        valid: isValid,
        hasIssue: issues.length > 0,
      })
    }

    return {
      success: true,
      isValid,
      issues,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate model",
    }
  }
}
