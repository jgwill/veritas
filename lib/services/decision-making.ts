// Decision Making Service - Core Logic for Decision Making Models
// Handles pairwise comparisons, dominance calculations, and decision recommendations

import {
  type DecisionMakingModel,
  type DecisionMakingElement,
  DigitalThinkingModelType,
  type DecisionMakingResult,
  type ComparisonMatrixState,
} from "../types"

export class DecisionMakingService {
  /**
   * Create a new Decision Making model
   */
  static createModel(modelName: string, digitalTopic: string, note?: string): DecisionMakingModel {
    const now = new Date().toISOString()

    return {
      id: crypto.randomUUID(),
      modelName,
      digitalTopic,
      digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING,
      twoOnly: false,
      decided: false,
      valid: false,
      autoSaveModel: true,
      hasIssue: false,
      note,
      dtCreated: now,
      dtModified: now,
      model: [],
    }
  }

  /**
   * Add a new element to the model
   */
  static addElement(
    model: DecisionMakingModel,
    nameElement: string,
    displayName: string,
    description: string,
  ): DecisionMakingElement {
    const newElement: DecisionMakingElement = {
      idug: crypto.randomUUID(),
      nameElement,
      displayName,
      description,
      sortNo: model.model.length + 1,
      status: 1,
      twoFlag: false,
      twoFlagAnswered: false,
      threeFlag: 0,
      threeFlagAnswered: false,
      dominanceFactor: 0,
      dominantElementItIS: false,
      comparationCompleted: false,
      question: false,
      comparationTableData: {},
    }

    // Initialize comparison table with existing elements
    model.model.forEach((existingElement) => {
      newElement.comparationTableData[existingElement.idug] = 0
      existingElement.comparationTableData[newElement.idug] = 0
    })

    return newElement
  }

  /**
   * Evaluate element acceptability
   */
  static evaluateElementAcceptability(
    model: DecisionMakingModel,
    elementId: string,
    isAcceptable: boolean,
  ): DecisionMakingModel {
    const element = model.model.find((e) => e.idug === elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    element.twoFlag = isAcceptable
    element.twoFlagAnswered = true

    // Update model validity
    this.validateModel(model)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Process pairwise comparison
   */
  static processComparison(
    model: DecisionMakingModel,
    element1Id: string,
    element2Id: string,
    decision: "YES" | "NO",
  ): DecisionMakingModel {
    const element1 = model.model.find((e) => e.idug === element1Id)
    const element2 = model.model.find((e) => e.idug === element2Id)

    if (!element1 || !element2) {
      throw new Error("Elements not found")
    }

    // Store comparison result
    // YES means element1 is more important than element2
    // NO means element2 is more important than element1
    const value = decision === "YES" ? 1 : -1

    element1.comparationTableData[element2Id] = value
    element2.comparationTableData[element1Id] = -value

    // Mark comparison as completed
    element1.comparationCompleted = this.isElementComparisonComplete(model, element1)
    element2.comparationCompleted = this.isElementComparisonComplete(model, element2)

    // Recalculate dominance factors
    this.calculateDominanceFactors(model)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Check if element has completed all comparisons
   */
  private static isElementComparisonComplete(model: DecisionMakingModel, element: DecisionMakingElement): boolean {
    const otherElements = model.model.filter((e) => e.idug !== element.idug)
    return otherElements.every(
      (other) =>
        element.comparationTableData[other.idug] !== undefined && element.comparationTableData[other.idug] !== 0,
    )
  }

  /**
   * Calculate dominance factors for all elements
   */
  static calculateDominanceFactors(model: DecisionMakingModel): void {
    const totalElements = model.model.length

    if (totalElements < 2) {
      return
    }

    model.model.forEach((element) => {
      let dominanceScore = 0
      let completedComparisons = 0

      // Sum up comparison scores
      Object.values(element.comparationTableData).forEach((value) => {
        if (value !== 0) {
          dominanceScore += value
          completedComparisons++
        }
      })

      // Calculate dominance factor (normalized)
      if (completedComparisons > 0) {
        element.dominanceFactor = dominanceScore / (totalElements - 1)
      }

      // Determine if this is a dominant element
      element.dominantElementItIS = element.dominanceFactor > 0.5
    })

    // Sort elements by dominance factor
    model.model.sort((a, b) => b.dominanceFactor - a.dominanceFactor)

    // Update sort numbers
    model.model.forEach((element, index) => {
      element.sortNo = index + 1
    })
  }

  /**
   * Generate comparison matrix state
   */
  static generateComparisonMatrix(model: DecisionMakingModel): ComparisonMatrixState {
    const totalElements = model.model.length
    const totalComparisons = (totalElements * (totalElements - 1)) / 2

    let completedComparisons = 0
    const matrix: Record<string, Record<string, number>> = {}

    model.model.forEach((element) => {
      matrix[element.idug] = { ...element.comparationTableData }

      // Count completed comparisons (only count each pair once)
      Object.entries(element.comparationTableData).forEach(([otherId, value]) => {
        if (value !== 0 && element.idug < otherId) {
          completedComparisons++
        }
      })
    })

    // Calculate consistency score (simplified)
    const consistencyScore = totalComparisons > 0 ? completedComparisons / totalComparisons : 0

    return {
      matrix,
      completedComparisons,
      totalComparisons,
      consistencyScore,
    }
  }

  /**
   * Generate decision recommendation
   */
  static generateRecommendation(model: DecisionMakingModel): DecisionMakingResult {
    const acceptableElements = model.model.filter((e) => e.twoFlagAnswered && e.twoFlag)
    const unacceptableElements = model.model.filter((e) => e.twoFlagAnswered && !e.twoFlag)
    const dominantElements = model.model.filter((e) => e.dominantElementItIS)

    // Check if all dominant elements are acceptable
    const dominantAcceptable = dominantElements.filter((e) => e.twoFlag)
    const dominantUnacceptable = dominantElements.filter((e) => !e.twoFlag)

    let recommendation: "YES" | "NO" | "INSUFFICIENT_DATA" = "INSUFFICIENT_DATA"
    let confidence = 0

    if (dominantUnacceptable.length > 0) {
      // If any dominant element is unacceptable, recommendation is NO
      recommendation = "NO"
      confidence = 0.9
    } else if (dominantAcceptable.length === dominantElements.length && dominantElements.length > 0) {
      // If all dominant elements are acceptable, recommendation is YES
      recommendation = "YES"
      confidence = 0.8
    }

    return {
      recommendation,
      dominantElements: dominantElements.map((element) => ({
        element,
        dominanceFactor: element.dominanceFactor,
        isAcceptable: element.twoFlag,
      })),
      criticalMissingElements: model.model.filter((e) => !e.twoFlagAnswered),
      consistencyScore: this.generateComparisonMatrix(model).consistencyScore,
      confidence,
    }
  }

  /**
   * Validate model completeness and consistency
   */
  static validateModel(model: DecisionMakingModel): boolean {
    const hasElements = model.model.length > 0
    const allElementsEvaluated = model.model.every((e) => e.twoFlagAnswered)
    const comparisonMatrix = this.generateComparisonMatrix(model)
    const sufficientComparisons = comparisonMatrix.consistencyScore > 0.7

    const isValid = hasElements && allElementsEvaluated && sufficientComparisons

    model.valid = isValid
    model.hasIssue = !isValid

    return isValid
  }
}
