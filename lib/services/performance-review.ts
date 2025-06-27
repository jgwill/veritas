// Performance Review Model Service
// Handles performance tracking, trend analysis, and improvement prioritization

import {
  PerformanceReviewModel,
  PerformanceReviewElement,
  PerformanceDashboard,
  ImprovementPlan,
  PriorityArea,
  ActionItem,
  DigitalThinkingModelType,
  PerformanceTrend,
  PriorityLevel,
  AcceptabilityFlag
} from '../types'

export class PerformanceReviewService {
  
  /**
   * Create a new Performance Review model
   */
  static createModel(
    modelName: string,
    digitalTopic: string,
    note?: string
  ): PerformanceReviewModel {
    return {
      id: crypto.randomUUID(),
      modelName,
      digitalTopic,
      digitalThinkingModelType: DigitalThinkingModelType.PERFORMANCE_REVIEW,
      twoOnly: false, // Always false for Performance Review models
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
   * Add element to Performance Review model
   */
  static addElement(
    model: PerformanceReviewModel,
    nameElement: string,
    displayName: string,
    description: string
  ): PerformanceReviewElement {
    const newElement: PerformanceReviewElement = {
      idug: crypto.randomUUID(),
      nameElement,
      displayName,
      description,
      sortNo: model.model.length,
      status: 1, // ACTIVE
      twoFlag: false,
      twoFlagAnswered: false,
      threeFlag: PerformanceTrend.STAY_SAME, // Default to no change
      threeFlagAnswered: false,
      dominanceFactor: 0, // Always 0 for Performance Review
      dominantElementItIS: false, // Always false for Performance Review
      comparationCompleted: false, // Always false for Performance Review
      question: false,
      comparationTableData: {}, // Empty for Performance Review
      dtCreated: new Date().toISOString(),
      dtModified: new Date().toISOString()
    }

    return newElement
  }

  /**
   * Evaluate element acceptability in analyzing mode
   */
  static evaluateElementAcceptability(
    model: PerformanceReviewModel,
    elementId: string,
    isAcceptable: boolean
  ): PerformanceReviewModel {
    const element = model.model.find(e => e.idug === elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    element.twoFlag = isAcceptable
    element.twoFlagAnswered = true

    // Calculate priority level based on acceptability and trend
    element.priorityLevel = this.calculatePriorityLevel(element)
    element.improvementRequired = element.priorityLevel === PriorityLevel.HIGH

    // Update model timestamp
    model.dtModified = new Date().toISOString()

    return model
  }

  /**
   * Evaluate element performance trend in analyzing mode
   */
  static evaluateElementPerformance(
    model: PerformanceReviewModel,
    elementId: string,
    performanceTrend: PerformanceTrend
  ): PerformanceReviewModel {
    const element = model.model.find(e => e.idug === elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    element.threeFlag = performanceTrend
    element.threeFlagAnswered = true
    element.status = 3 // EVALUATED

    // Calculate priority level based on acceptability and trend
    element.priorityLevel = this.calculatePriorityLevel(element)
    element.improvementRequired = element.priorityLevel === PriorityLevel.HIGH

    // Update model timestamp
    model.dtModified = new Date().toISOString()

    return model
  }

  /**
   * Calculate priority level for improvement focus
   */
  static calculatePriorityLevel(element: PerformanceReviewElement): PriorityLevel {
    const isAcceptable = element.twoFlag
    const trend = element.threeFlag

    // High Priority: Unacceptable AND (Getting Worse OR Staying Same)
    if (!isAcceptable && trend <= PerformanceTrend.STAY_SAME) {
      return PriorityLevel.HIGH
    }

    // Low Priority: Acceptable AND Getting Better
    if (isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return PriorityLevel.LOW
    }

    // Medium Priority: All other combinations
    return PriorityLevel.MEDIUM
  }

  /**
   * Generate performance dashboard
   */
  static generatePerformanceDashboard(model: PerformanceReviewModel): PerformanceDashboard {
    const elements = model.model

    // Categorize elements
    const acceptableElements = elements.filter(e => e.twoFlag && e.twoFlagAnswered)
    const unacceptableElements = elements.filter(e => !e.twoFlag && e.twoFlagAnswered)
    const improvingElements = elements.filter(e => e.threeFlag === PerformanceTrend.GETTING_BETTER)
    const decliningElements = elements.filter(e => e.threeFlag === PerformanceTrend.GETTING_WORSE)

    // Calculate overall score
    const evaluatedElements = elements.filter(e => e.twoFlagAnswered)
    const overallScore = evaluatedElements.length > 0 
      ? acceptableElements.length / evaluatedElements.length 
      : 0

    // Generate priority areas
    const priorityAreas: PriorityArea[] = elements
      .filter(e => e.twoFlagAnswered && e.threeFlagAnswered)
      .map(element => ({
        element,
        priorityLevel: element.priorityLevel || this.calculatePriorityLevel(element),
        reason: this.generatePriorityReason(element),
        actionRequired: element.improvementRequired || false
      }))
      .sort((a, b) => {
        // Sort by priority: HIGH > MEDIUM > LOW
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        return priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel]
      })

    return {
      overallScore,
      acceptableElements,
      unacceptableElements,
      improvingElements,
      decliningElements,
      priorityAreas
    }
  }

  /**
   * Generate improvement plan
   */
  static generateImprovementPlan(model: PerformanceReviewModel): ImprovementPlan {
    const dashboard = this.generatePerformanceDashboard(model)
    
    const highPriorityActions: ActionItem[] = dashboard.priorityAreas
      .filter(area => area.priorityLevel === PriorityLevel.HIGH)
      .map(area => ({
        elementId: area.element.idug,
        action: this.generateActionItem(area.element),
        priority: PriorityLevel.HIGH,
        timeframe: 'Immediate (1-2 weeks)'
      }))

    const mediumPriorityActions: ActionItem[] = dashboard.priorityAreas
      .filter(area => area.priorityLevel === PriorityLevel.MEDIUM)
      .map(area => ({
        elementId: area.element.idug,
        action: this.generateActionItem(area.element),
        priority: PriorityLevel.MEDIUM,
        timeframe: 'Short-term (1-3 months)'
      }))

    const lowPriorityActions: ActionItem[] = dashboard.priorityAreas
      .filter(area => area.priorityLevel === PriorityLevel.LOW)
      .map(area => ({
        elementId: area.element.idug,
        action: this.generateActionItem(area.element),
        priority: PriorityLevel.LOW,
        timeframe: 'Long-term (3-6 months)'
      }))

    return {
      highPriorityActions,
      mediumPriorityActions,
      lowPriorityActions
    }
  }

  /**
   * Generate priority reason explanation
   */
  static generatePriorityReason(element: PerformanceReviewElement): string {
    const isAcceptable = element.twoFlag
    const trend = element.threeFlag

    if (!isAcceptable && trend === PerformanceTrend.GETTING_WORSE) {
      return 'Unacceptable performance that is declining - requires immediate attention'
    }
    if (!isAcceptable && trend === PerformanceTrend.STAY_SAME) {
      return 'Consistently unacceptable performance - needs improvement plan'
    }
    if (!isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return 'Improving but still unacceptable - monitor progress closely'
    }
    if (isAcceptable && trend === PerformanceTrend.GETTING_WORSE) {
      return 'Declining performance - prevent further deterioration'
    }
    if (isAcceptable && trend === PerformanceTrend.STAY_SAME) {
      return 'Stable acceptable performance - maintain current level'
    }
    if (isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return 'Strong performance trending upward - continue current approach'
    }

    return 'Performance status requires evaluation'
  }

  /**
   * Generate action item recommendation
   */
  static generateActionItem(element: PerformanceReviewElement): string {
    const isAcceptable = element.twoFlag
    const trend = element.threeFlag

    if (!isAcceptable && trend === PerformanceTrend.GETTING_WORSE) {
      return `Immediate intervention required for ${element.displayName}. Investigate root causes and implement corrective measures.`
    }
    if (!isAcceptable && trend === PerformanceTrend.STAY_SAME) {
      return `Develop improvement plan for ${element.displayName}. Set specific targets and timeline for enhancement.`
    }
    if (!isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return `Continue improvement efforts for ${element.displayName}. Monitor progress and adjust strategies as needed.`
    }
    if (isAcceptable && trend === PerformanceTrend.GETTING_WORSE) {
      return `Investigate declining trend in ${element.displayName}. Identify and address contributing factors.`
    }
    if (isAcceptable && trend === PerformanceTrend.STAY_SAME) {
      return `Maintain current performance level for ${element.displayName}. Review periodically for optimization opportunities.`
    }
    if (isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return `Sustain positive momentum in ${element.displayName}. Document best practices for replication.`
    }

    return `Review and evaluate ${element.displayName} performance status.`
  }

  /**
   * Validate model completeness
   */
  static validateModel(model: PerformanceReviewModel): boolean {
    // Check if all elements have been evaluated for acceptability
    const allAcceptabilityEvaluated = model.model.every(e => e.twoFlagAnswered)
    if (!allAcceptabilityEvaluated) return false

    // Check if all elements have been evaluated for performance trend
    const allPerformanceEvaluated = model.model.every(e => e.threeFlagAnswered)
    if (!allPerformanceEvaluated) return false

    return true
  }

  /**
   * Get evaluation completion statistics
   */
  static getEvaluationStats(model: PerformanceReviewModel) {
    const totalElements = model.model.length
    const acceptabilityEvaluated = model.model.filter(e => e.twoFlagAnswered).length
    const performanceEvaluated = model.model.filter(e => e.threeFlagAnswered).length
    
    return {
      totalElements,
      acceptabilityEvaluated,
      performanceEvaluated,
      acceptabilityProgress: totalElements > 0 ? acceptabilityEvaluated / totalElements : 0,
      performanceProgress: totalElements > 0 ? performanceEvaluated / totalElements : 0,
      overallProgress: totalElements > 0 ? Math.min(acceptabilityEvaluated, performanceEvaluated) / totalElements : 0
    }
  }
} 