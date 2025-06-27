// TandT Models Library - Unified Model Management
// Integrates with enhanced type system and services

import {
  DigitalModel,
  DecisionMakingModel,
  PerformanceReviewModel,
  DigitalThinkingModelType,
  CreateModelRequest,
  isDecisionMakingModel,
  isPerformanceReviewModel
} from './types'
import { DecisionMakingService } from './services/decision-making'
import { PerformanceReviewService } from './services/performance-review'

export interface DigitalElement {
  idug: string
  nameElement: string
  displayName: string
  description: string
  sortNo: number
  status: number
  twoFlag: boolean
  twoFlagAnswered: boolean
  threeFlag: number
  threeFlagAnswered: boolean
  dominanceFactor: number
  dominantElementItIS: boolean
  comparationCompleted: boolean
  question: boolean
  comparationTableData: Record<string, number>
}

// Sample data storage (in production, this would be a database)
let modelsStorage: DigitalModel[] = []

/**
 * Load models from samples directory
 */
export function loadModelsFromSamples(): DigitalModel[] {
  // This would normally load from JSON files in samples/
  // For now, return the in-memory storage
  return modelsStorage
}

/**
 * Create a new model based on type
 */
export function createModel(request: CreateModelRequest): DigitalModel {
  let newModel: DigitalModel

  if (request.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING) {
    newModel = DecisionMakingService.createModel(
      request.modelName,
      request.digitalTopic,
      request.note
    )
  } else if (request.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW) {
    newModel = PerformanceReviewService.createModel(
      request.modelName,
      request.digitalTopic,
      request.note
    )
  } else {
    throw new Error('Invalid model type')
  }

  // Add to storage
  modelsStorage.push(newModel)
  
  return newModel
}

/**
 * Get model by ID
 */
export function getModelById(id: string): DigitalModel | undefined {
  return modelsStorage.find(model => model.id === id)
}

/**
 * Update existing model
 */
export function updateModel(updatedModel: DigitalModel): DigitalModel {
  const index = modelsStorage.findIndex(model => model.id === updatedModel.id)
  if (index === -1) {
    throw new Error('Model not found')
  }

  // Update timestamp
  updatedModel.dtModified = new Date().toISOString()
  
  modelsStorage[index] = updatedModel
  return updatedModel
}

/**
 * Delete model by ID
 */
export function deleteModel(id: string): boolean {
  const index = modelsStorage.findIndex(model => model.id === id)
  if (index === -1) {
    return false
  }

  modelsStorage.splice(index, 1)
  return true
}

/**
 * Add element to model
 */
export function addElementToModel(
  modelId: string,
  nameElement: string,
  displayName: string,
  description: string
): DigitalModel {
  const model = getModelById(modelId)
  if (!model) {
    throw new Error('Model not found')
  }

  let newElement

  if (isDecisionMakingModel(model)) {
    newElement = DecisionMakingService.addElement(
      model,
      nameElement,
      displayName,
      description
    )
    model.model.push(newElement)
  } else if (isPerformanceReviewModel(model)) {
    newElement = PerformanceReviewService.addElement(
      model,
      nameElement,
      displayName,
      description
    )
    model.model.push(newElement)
  } else {
    throw new Error('Invalid model type')
  }

  return updateModel(model)
}

/**
 * Evaluate element acceptability
 */
export function evaluateElementAcceptability(
  modelId: string,
  elementId: string,
  isAcceptable: boolean
): DigitalModel {
  const model = getModelById(modelId)
  if (!model) {
    throw new Error('Model not found')
  }

  let updatedModel: DigitalModel

  if (isDecisionMakingModel(model)) {
    updatedModel = DecisionMakingService.evaluateElementAcceptability(
      model,
      elementId,
      isAcceptable
    )
  } else if (isPerformanceReviewModel(model)) {
    updatedModel = PerformanceReviewService.evaluateElementAcceptability(
      model,
      elementId,
      isAcceptable
    )
  } else {
    throw new Error('Invalid model type')
  }

  return updateModel(updatedModel)
}

/**
 * Evaluate element performance (Performance Review only)
 */
export function evaluateElementPerformance(
  modelId: string,
  elementId: string,
  performanceTrend: number
): DigitalModel {
  const model = getModelById(modelId)
  if (!model) {
    throw new Error('Model not found')
  }

  if (!isPerformanceReviewModel(model)) {
    throw new Error('Performance evaluation only available for Performance Review models')
  }

  const updatedModel = PerformanceReviewService.evaluateElementPerformance(
    model,
    elementId,
    performanceTrend
  )

  return updateModel(updatedModel)
}

/**
 * Process pairwise comparison (Decision Making only)
 */
export function processComparison(
  modelId: string,
  element1Id: string,
  element2Id: string,
  decisionValue: 'YES' | 'NO'
): DigitalModel {
  const model = getModelById(modelId)
  if (!model) {
    throw new Error('Model not found')
  }

  if (!isDecisionMakingModel(model)) {
    throw new Error('Pairwise comparison only available for Decision Making models')
  }

  const updatedModel = DecisionMakingService.processComparison(
    model,
    element1Id,
    element2Id,
    decisionValue
  )

  return updateModel(updatedModel)
}

/**
 * Calculate dominance factors (Decision Making only)
 */
export function calculateDominanceFactors(modelId: string): DigitalModel {
  const model = getModelById(modelId)
  if (!model) {
    throw new Error('Model not found')
  }

  if (!isDecisionMakingModel(model)) {
    throw new Error('Dominance calculation only available for Decision Making models')
  }

  DecisionMakingService.calculateDominanceFactors(model)
  return updateModel(model)
}

/**
 * Get model statistics
 */
export function getModelStats(model: DigitalModel) {
  const totalElements = model.model.length
  const evaluatedElements = model.model.filter(e => e.twoFlagAnswered).length
  
  const baseStats = {
    totalElements,
    evaluatedElements,
    evaluationProgress: totalElements > 0 ? evaluatedElements / totalElements : 0
  }

  if (isDecisionMakingModel(model)) {
    const matrix = DecisionMakingService.generateComparisonMatrix(model)
    return {
      ...baseStats,
      modelType: 'Decision Making',
      totalComparisons: matrix.totalComparisons,
      completedComparisons: matrix.completedComparisons,
      comparisonProgress: matrix.totalComparisons > 0 ? matrix.completedComparisons / matrix.totalComparisons : 0,
      consistencyScore: matrix.consistencyScore,
      isValid: DecisionMakingService.validateModel(model)
    }
  } else if (isPerformanceReviewModel(model)) {
    const stats = PerformanceReviewService.getEvaluationStats(model)
    return {
      ...baseStats,
      modelType: 'Performance Review',
      performanceEvaluated: stats.performanceEvaluated,
      performanceProgress: stats.performanceProgress,
      overallProgress: stats.overallProgress,
      isValid: PerformanceReviewService.validateModel(model)
    }
  }

  return baseStats
}

/**
 * Initialize with sample data
 */
export function initializeWithSampleData(): void {
  // Decision Making Model Sample
  const housingModel = DecisionMakingService.createModel(
    'habitav1b24042419',
    'lieu habitat qui convient v1b',
    'Housing decision model for selecting suitable living space'
  )

  // Add sample elements
  const elements = [
    { name: 'VoisinageCalmeNuit', display: 'Calme la nuit', desc: 'Bruits naturels et tranquillité' },
    { name: 'Cuisinepratique', display: 'Cuisine pratique', desc: 'Spacieuse et fonctionnelle pour deux personnes' },
    { name: 'BonneAeration', display: 'Bonne aération', desc: 'Aération et ventilation optimales' },
    { name: 'LumiereNaturelle', display: 'Lumière naturelle', desc: 'Fenêtres exposées au sud pour une bonne luminosité' }
  ]

  elements.forEach(el => {
    const newElement = DecisionMakingService.addElement(housingModel, el.name, el.display, el.desc)
    housingModel.model.push(newElement)
  })

  modelsStorage.push(housingModel)

  // Performance Review Model Sample
  const businessModel = PerformanceReviewService.createModel(
    'ModelDigitalPerformanceReview',
    'Digital Performance Review Model',
    'Business performance assessment model'
  )

  const businessElements = [
    { name: 'MarketMatch', display: 'Match between business offering and Market', desc: '' },
    { name: 'MarketShare', display: 'Current Market Share', desc: '' },
    { name: 'Competition', display: 'Competition', desc: '' },
    { name: 'ManagementEffectiveness', display: 'Managerial Effectiveness', desc: '' }
  ]

  businessElements.forEach(el => {
    const newElement = PerformanceReviewService.addElement(businessModel, el.name, el.display, el.desc)
    businessModel.model.push(newElement)
  })

  modelsStorage.push(businessModel)
}

// Initialize with sample data
initializeWithSampleData()

export type { DigitalModel }
