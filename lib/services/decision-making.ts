import type { DecisionMakingModel, ComparisonMatrix, DecisionResult, ElementHierarchy } from "../types"

export class DecisionMakingService {
  /**
   * Calculate dominance factors for all elements based on pairwise comparisons
   */
  static calculateDominanceFactors(model: DecisionMakingModel): DecisionMakingModel {
    const elements = model.model
    const n = elements.length

    // Initialize dominance factors
    elements.forEach((element) => {
      element.dominanceFactor = 0
      element.dominantElementItIS = false
    })

    // Calculate dominance based on comparison data
    elements.forEach((element) => {
      const comparisons = element.comparationTableData || {}
      let dominanceScore = 0
      let totalComparisons = 0

      Object.entries(comparisons).forEach(([otherElementId, value]) => {
        if (value === 1)
          dominanceScore += 1 // This element dominates
        else if (value === -1) dominanceScore -= 1 // Other element dominates
        totalComparisons += 1
      })

      if (totalComparisons > 0) {
        element.dominanceFactor = dominanceScore / totalComparisons
        element.dominantElementItIS = element.dominanceFactor > 0.5
      }
    })

    return model
  }

  /**
   * Generate comparison matrix for the model
   */
  static generateComparisonMatrix(model: DecisionMakingModel): ComparisonMatrix {
    const elements = model.model
    const n = elements.length
    const totalPairs = (n * (n - 1)) / 2

    let completedComparisons = 0
    const pairs: any[] = []

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const element1 = elements[i]
        const element2 = elements[j]

        const comparison = element1.comparationTableData?.[element2.idug]
        const isCompleted = comparison !== undefined && comparison !== 0

        if (isCompleted) completedComparisons++

        pairs.push({
          element1Id: element1.idug,
          element2Id: element2.idug,
          value: comparison || 0,
          completed: isCompleted,
        })
      }
    }

    return {
      completed: completedComparisons === totalPairs,
      totalComparisons: totalPairs,
      completedComparisons,
      consistencyScore: this.calculateConsistencyScore(model),
      pairs,
    }
  }

  /**
   * Calculate consistency score for the comparison matrix
   */
  static calculateConsistencyScore(model: DecisionMakingModel): number {
    const elements = model.model
    let consistentComparisons = 0
    let totalTriads = 0

    // Check transitivity: if A > B and B > C, then A should > C
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        for (let k = 0; k < elements.length; k++) {
          if (i !== j && j !== k && i !== k) {
            const aOverB = elements[i].comparationTableData?.[elements[j].idug]
            const bOverC = elements[j].comparationTableData?.[elements[k].idug]
            const aOverC = elements[i].comparationTableData?.[elements[k].idug]

            if (aOverB && bOverC && aOverC) {
              totalTriads++
              // Check if transitivity holds
              if (
                (aOverB > 0 && bOverC > 0 && aOverC > 0) ||
                (aOverB < 0 && bOverC < 0 && aOverC > 0) ||
                (aOverB > 0 && bOverC < 0) ||
                (aOverB < 0 && bOverC > 0)
              ) {
                consistentComparisons++
              }
            }
          }
        }
      }
    }

    return totalTriads > 0 ? consistentComparisons / totalTriads : 1
  }

  /**
   * Generate decision result based on current model state
   */
  static generateDecisionResult(model: DecisionMakingModel): DecisionResult {
    const elements = model.model
    const evaluatedElements = elements.filter((e) => e.twoFlagAnswered)
    const acceptableElements = evaluatedElements.filter((e) => e.twoFlag)
    const unacceptableElements = evaluatedElements.filter((e) => !e.twoFlag)

    // Calculate hierarchy based on dominance factors
    const hierarchy: ElementHierarchy[] = elements
      .map((element, index) => ({
        element,
        rank: index + 1,
        dominanceScore: element.dominanceFactor,
        isMandatory: element.dominantElementItIS && element.twoFlag,
      }))
      .sort((a, b) => b.dominanceScore - a.dominanceScore)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    // Determine mandatory elements (high dominance + acceptable)
    const mandatoryElements = hierarchy.filter((h) => h.isMandatory).map((h) => h.element)

    // Decision logic: YES if all mandatory elements are acceptable
    const unacceptableMandatory = mandatoryElements.filter((e) => !e.twoFlag)
    const decision: "YES" | "NO" = unacceptableMandatory.length === 0 ? "YES" : "NO"

    // Calculate confidence based on evaluation completeness and consistency
    const evaluationCompleteness = evaluatedElements.length / elements.length
    const consistencyScore = this.calculateConsistencyScore(model)
    const confidence = evaluationCompleteness * 0.7 + consistencyScore * 0.3

    return {
      decision,
      confidence: Math.round(confidence * 100),
      mandatoryElements,
      optionalElements: acceptableElements.filter((e) => !mandatoryElements.includes(e)),
      hierarchy: hierarchy,
    }
  }

  /**
   * Process a pairwise comparison
   */
  static processComparison(
    model: DecisionMakingModel,
    element1Id: string,
    element2Id: string,
    decision: "YES" | "NO",
  ): DecisionMakingModel {
    const element1 = model.model.find((e) => e.idug === element1Id)
    const element2 = model.model.find((e) => e.idug === element2Id)

    if (!element1 || !element2) return model

    // Initialize comparison tables if they don't exist
    if (!element1.comparationTableData) element1.comparationTableData = {}
    if (!element2.comparationTableData) element2.comparationTableData = {}

    // Set comparison values
    // If decision is YES (element1 without element2 = YES), then element1 dominates
    const value = decision === "YES" ? 1 : -1
    element1.comparationTableData[element2Id] = value
    element2.comparationTableData[element1Id] = -value

    // Update completion status
    const totalPossibleComparisons = model.model.length - 1
    element1.comparationCompleted = Object.keys(element1.comparationTableData).length >= totalPossibleComparisons
    element2.comparationCompleted = Object.keys(element2.comparationTableData).length >= totalPossibleComparisons

    // Recalculate dominance factors
    return this.calculateDominanceFactors(model)
  }
}
