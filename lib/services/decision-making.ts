import type { DecisionMakingModel, DigitalElement, ComparisonMatrix, DecisionResult } from "../types"
import { crypto } from "crypto"
import { ElementStatus, PerformanceTrend } from "../constants"

export class DecisionMakingService {
  /**
   * Create a new Decision Making model
   */
  static createModel(modelName: string, digitalTopic: string, note?: string): DecisionMakingModel {
    return {
      id: crypto.randomUUID(),
      modelName,
      digitalTopic,
      digitalThinkingModelType: "DECISION_MAKING",
      twoOnly: true,
      decided: false,
      valid: false,
      autoSaveModel: true,
      hasIssue: false,
      note,
      dtCreated: new Date().toISOString(),
      dtModified: new Date().toISOString(),
      model: [],
      comparisonMatrix: {
        totalComparisons: 0,
        completedComparisons: 0,
        consistencyScore: 0,
        matrix: {},
      },
      dominanceResults: [],
    }
  }

  /**
   * Add element to Decision Making model
   */
  static addElement(
    model: DecisionMakingModel,
    nameElement: string,
    displayName: string,
    description: string,
  ): DigitalElement {
    const sortNo = model.model.length + 1

    return {
      idug: crypto.randomUUID(),
      nameElement,
      displayName,
      description,
      sortNo,
      status: ElementStatus.ACTIVE,
      twoFlag: false,
      twoFlagAnswered: false,
      threeFlag: PerformanceTrend.STAYING_SAME,
      threeFlagAnswered: false,
      dominanceFactor: 0,
      dominantElementItIS: false,
      comparationCompleted: false,
      question: false,
      comparationTableData: {},
    }
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

    // Initialize comparison matrix if needed
    if (!model.comparisonMatrix.matrix[element1Id]) {
      model.comparisonMatrix.matrix[element1Id] = {}
    }
    if (!model.comparisonMatrix.matrix[element2Id]) {
      model.comparisonMatrix.matrix[element2Id] = {}
    }

    // Store comparison result (1 for YES, 0 for NO)
    const value = decision === "YES" ? 1 : 0
    model.comparisonMatrix.matrix[element1Id][element2Id] = value
    model.comparisonMatrix.matrix[element2Id][element1Id] = 1 - value // Inverse

    // Update comparison counts
    model.comparisonMatrix.completedComparisons++

    // Recalculate dominance factors
    this.calculateDominanceFactors(model)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Calculate dominance factors for all elements
   */
  static calculateDominanceFactors(model: DecisionMakingModel): void {
    const elements = model.model
    const matrix = model.comparisonMatrix.matrix

    elements.forEach((element) => {
      let dominanceSum = 0
      let comparisonCount = 0

      elements.forEach((otherElement) => {
        if (element.idug !== otherElement.idug) {
          const comparison = matrix[element.idug]?.[otherElement.idug]
          if (comparison !== undefined) {
            dominanceSum += comparison
            comparisonCount++
          }
        }
      })

      element.dominanceFactor = comparisonCount > 0 ? dominanceSum / comparisonCount : 0
      element.dominantElementItIS = element.dominanceFactor > 0.5
    })

    // Update dominance results
    model.dominanceResults = elements
      .map((element) => ({
        elementId: element.idug,
        dominanceFactor: element.dominanceFactor,
        rank: 0,
        isDominant: element.dominantElementItIS,
      }))
      .sort((a, b) => b.dominanceFactor - a.dominanceFactor)
      .map((result, index) => ({ ...result, rank: index + 1 }))
  }

  /**
   * Generate comparison matrix data
   */
  static generateComparisonMatrix(model: DecisionMakingModel): ComparisonMatrix {
    const elementCount = model.model.length
    const totalComparisons = elementCount > 1 ? (elementCount * (elementCount - 1)) / 2 : 0

    return {
      ...model.comparisonMatrix,
      totalComparisons,
    }
  }

  /**
   * Validate model completeness
   */
  static validateModel(model: DecisionMakingModel): boolean {
    const hasElements = model.model.length > 0
    const allEvaluated = model.model.every((e) => e.twoFlagAnswered)
    const matrix = this.generateComparisonMatrix(model)
    const comparisonsComplete = matrix.completedComparisons >= matrix.totalComparisons

    return hasElements && allEvaluated && comparisonsComplete
  }

  /**
   * Generate decision result
   */
  static generateDecisionResult(model: DecisionMakingModel): DecisionResult {
    const acceptableElements = model.model.filter((e) => e.twoFlag && e.twoFlagAnswered)
    const dominantElements = model.dominanceResults.filter((r) => r.isDominant)

    const mandatoryElements = dominantElements
      .filter((d) => acceptableElements.some((e) => e.idug === d.elementId))
      .map((d) => d.elementId)

    const optionalElements = acceptableElements.filter((e) => !mandatoryElements.includes(e.idug)).map((e) => e.idug)

    const decision = mandatoryElements.length > 0 ? "YES" : "NO"
    const confidence = mandatoryElements.length / acceptableElements.length

    return {
      decision,
      confidence,
      mandatoryElements,
      optionalElements,
      reasoning: `Decision based on ${mandatoryElements.length} mandatory elements out of ${acceptableElements.length} acceptable elements.`,
    }
  }
}
