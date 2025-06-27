// Decision Making Model Service
// Handles pairwise comparisons, dominance calculations, and decision logic

import {
  DecisionMakingModel,
  DecisionMakingElement,
  ComparisonMatrix,
  ComparisonPair,
  DecisionResult,
  ElementHierarchy,
  DigitalThinkingModelType,
  AcceptabilityFlag
} from '../types'

export class DecisionMakingService {
  
  /**
   * Create a new Decision Making model
   */
  static createModel(
    modelName: string,
    digitalTopic: string,
    note?: string
  ): DecisionMakingModel {
    return {
      id: crypto.randomUUID(),
      modelName,
      digitalTopic,
      digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING,
      twoOnly: true, // Always true for Decision Making models
      decided: false,
      valid: false,
      autoSaveModel: true,
      hasIssue: false,
      note: note || '',
      model: [],
      dtCreated: new Date().toISOString(),
      dtModified: new Date().toISOString()
    }
  }

  /**
   * Add element to Decision Making model
   */
  static addElement(
    model: DecisionMakingModel,
    nameElement: string,
    displayName: string,
    description: string
  ): DecisionMakingElement {
    const newElement: DecisionMakingElement = {
      idug: crypto.randomUUID(),
      nameElement,
      displayName,
      description,
      sortNo: model.model.length,
      status: 1, // ACTIVE
      twoFlag: false,
      twoFlagAnswered: false,
      threeFlag: 0, // Always 0 for Decision Making
      threeFlagAnswered: false, // Always false for Decision Making
      dominanceFactor: 0,
      dominantElementItIS: false,
      comparationCompleted: false,
      question: false,
      comparationTableData: {},
      dtCreated: new Date().toISOString(),
      dtModified: new Date().toISOString()
    }

    // Initialize comparison data for existing elements
    model.model.forEach(existingElement => {
      // Add comparison entry for new element in existing elements
      existingElement.comparationTableData[newElement.idug] = 0
      // Add comparison entry for existing element in new element
      newElement.comparationTableData[existingElement.idug] = 0
    })

    return newElement
  }

  /**
   * Generate comparison matrix
   */
  static generateComparisonMatrix(model: DecisionMakingModel): ComparisonMatrix {
    const elements = model.model
    const pairs: ComparisonPair[] = []
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const element1 = elements[i]
        const element2 = elements[j]
        
        const value = element1.comparationTableData[element2.idug] || 0
        const completed = value !== 0
        
        pairs.push({
          element1Id: element1.idug,
          element2Id: element2.idug,
          value,
          completed
        })
      }
    }

    const totalComparisons = pairs.length
    const completedComparisons = pairs.filter(p => p.completed).length
    
    return {
      completed: completedComparisons === totalComparisons && totalComparisons > 0,
      totalComparisons,
      completedComparisons,
      consistencyScore: this.calculateConsistencyScore(model),
      pairs
    }
  }

  /**
   * Process pairwise comparison
   * Question: "If you have Element1 but don't have Element2, would the decision be YES or NO?"
   * YES = Element2 is optional (Element1 dominates Element2)
   * NO = Element1 requires Element2 (Element2 dominates Element1)
   */
  static processComparison(
    model: DecisionMakingModel,
    element1Id: string,
    element2Id: string,
    decisionValue: 'YES' | 'NO'
  ): DecisionMakingModel {
    const element1 = model.model.find(e => e.idug === element1Id)
    const element2 = model.model.find(e => e.idug === element2Id)
    
    if (!element1 || !element2) {
      throw new Error('Elements not found')
    }

    // Convert decision to comparison value
    const comparisonValue = decisionValue === 'YES' ? 1 : -1
    
    // Update comparison data (symmetric)
    element1.comparationTableData[element2Id] = comparisonValue
    element2.comparationTableData[element1Id] = -comparisonValue
    
    // Recalculate dominance factors
    this.calculateDominanceFactors(model)
    
    // Update model timestamp
    model.dtModified = new Date().toISOString()
    
    return model
  }

  /**
   * Calculate dominance factors for all elements
   */
  static calculateDominanceFactors(model: DecisionMakingModel): void {
    model.model.forEach(element => {
      let dominanceFactor = 0
      
      // Count how many elements this element dominates
      Object.values(element.comparationTableData).forEach(value => {
        if (value === 1) {
          dominanceFactor++
        }
      })
      
      element.dominanceFactor = dominanceFactor
      element.dominantElementItIS = dominanceFactor === Math.max(...model.model.map(e => e.dominanceFactor))
    })
  }

  /**
   * Calculate consistency score for validation
   */
  static calculateConsistencyScore(model: DecisionMakingModel): number {
    const elements = model.model
    let totalChecks = 0
    let consistentChecks = 0
    
    // Check transitivity: if A > B and B > C, then A should > C
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        for (let k = 0; k < elements.length; k++) {
          if (i !== j && j !== k && i !== k) {
            const aToB = elements[i].comparationTableData[elements[j].idug]
            const bToC = elements[j].comparationTableData[elements[k].idug]
            const aToC = elements[i].comparationTableData[elements[k].idug]
            
            if (aToB !== 0 && bToC !== 0 && aToC !== 0) {
              totalChecks++
              if ((aToB > 0 && bToC > 0 && aToC > 0) || 
                  (aToB < 0 || bToC < 0)) {
                consistentChecks++
              }
            }
          }
        }
      }
    }
    
    return totalChecks > 0 ? consistentChecks / totalChecks : 1
  }

  /**
   * Generate decision result
   */
  static generateDecisionResult(model: DecisionMakingModel): DecisionResult {
    // Calculate element hierarchy
    const hierarchy: ElementHierarchy[] = model.model
      .map(element => ({
        element,
        rank: 0, // Will be calculated
        dominanceScore: element.dominanceFactor,
        isMandatory: element.twoFlag && element.dominanceFactor > 0
      }))
      .sort((a, b) => b.dominanceScore - a.dominanceScore)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    // Separate mandatory and optional elements
    const mandatoryElements = hierarchy
      .filter(h => h.isMandatory)
      .map(h => h.element)
    
    const optionalElements = hierarchy
      .filter(h => !h.isMandatory)
      .map(h => h.element)

    // Calculate overall decision confidence
    const acceptableElements = model.model.filter(e => e.twoFlag).length
    const totalElements = model.model.length
    const confidence = totalElements > 0 ? acceptableElements / totalElements : 0
    
    // Determine final decision
    const hasUnacceptableMandatory = mandatoryElements.some(e => !e.twoFlag)
    const decision: 'YES' | 'NO' = hasUnacceptableMandatory ? 'NO' : 'YES'

    return {
      decision,
      confidence,
      mandatoryElements,
      optionalElements,
      hierarchy
    }
  }

  /**
   * Evaluate element acceptability in analyzing mode
   */
  static evaluateElementAcceptability(
    model: DecisionMakingModel,
    elementId: string,
    isAcceptable: boolean
  ): DecisionMakingModel {
    const element = model.model.find(e => e.idug === elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    element.twoFlag = isAcceptable
    element.twoFlagAnswered = true
    element.status = 3 // EVALUATED

    // Update model timestamp
    model.dtModified = new Date().toISOString()

    return model
  }

  /**
   * Validate model completeness
   */
  static validateModel(model: DecisionMakingModel): boolean {
    // Check if all pairwise comparisons are completed
    const matrix = this.generateComparisonMatrix(model)
    if (!matrix.completed) return false

    // Check if all elements have been evaluated for acceptability
    const allEvaluated = model.model.every(e => e.twoFlagAnswered)
    if (!allEvaluated) return false

    // Check consistency score
    if (matrix.consistencyScore < 0.8) return false

    return true
  }
} 