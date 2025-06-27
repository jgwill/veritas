// Performance Review Model Service
// Handles performance tracking, trend analysis, and improvement prioritization

import {
  type PerformanceReviewModel,
  type PerformanceReviewElement,
  type PerformanceDashboard,
  type ImprovementPlan,
  type PriorityArea,
  type ActionItem,
  DigitalThinkingModelType,
  PerformanceTrend,
  PriorityLevel,
  type PerformanceReviewResult,
} from "../types"

export class PerformanceReviewService {
  /**
   * Create a new Performance Review model
   */
  static createModel(modelName: string, digitalTopic: string, note?: string): PerformanceReviewModel {
    const now = new Date().toISOString()

    return {
      id: crypto.randomUUID(),
      modelName,
      digitalTopic,
      digitalThinkingModelType: DigitalThinkingModelType.PERFORMANCE_REVIEW,
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
   * Add element to Performance Review model
   */
  static addElement(
    model: PerformanceReviewModel,
    nameElement: string,
    displayName: string,
    description: string,
  ): PerformanceReviewElement {
    const newElement: PerformanceReviewElement = {
      idug: crypto.randomUUID(),
      nameElement,
      displayName,
      description,
      sortNo: model.model.length + 1,
      status: 1, // ACTIVE
      twoFlag: false,
      twoFlagAnswered: false,
      threeFlag: 0,
      threeFlagAnswered: false,
      priority: 1,
      performanceHistory: [],
      dtModified: new Date().toISOString(),
    }

    model.model.push(newElement)
    return newElement
  }

  /**
   * Evaluate element acceptability in analyzing mode
   */
  static evaluateElementAcceptability(
    model: PerformanceReviewModel,
    elementId: string,
    isAcceptable: boolean,
  ): PerformanceReviewModel {
    const element = model.model.find((e) => e.idug === elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    element.twoFlag = isAcceptable
    element.twoFlagAnswered = true

    // Add to performance history
    const historyEntry = {
      date: new Date().toISOString(),
      acceptability: isAcceptable,
      performance: element.threeFlag,
      note: `Acceptability evaluation: ${isAcceptable ? "Acceptable" : "Unacceptable"}`,
    }

    element.performanceHistory.push(historyEntry)

    // Update model validity
    this.validateModel(model)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Evaluate element performance trend in analyzing mode
   */
  static evaluateElementPerformance(
    model: PerformanceReviewModel,
    elementId: string,
    performanceTrend: number, // -1: worse, 0: same, 1: better
  ): PerformanceReviewModel {
    const element = model.model.find((e) => e.idug === elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    element.threeFlag = performanceTrend
    element.threeFlagAnswered = true

    // Add to performance history
    const historyEntry = {
      date: new Date().toISOString(),
      acceptability: element.twoFlag,
      performance: performanceTrend,
      note: `Performance trend: ${
        performanceTrend === 1 ? "Getting Better" : performanceTrend === 0 ? "Staying Same" : "Getting Worse"
      }`,
    }

    element.performanceHistory.push(historyEntry)

    // Update priority based on performance and acceptability
    this.updateElementPriority(element)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Update element priority based on acceptability and performance
   */
  private static updateElementPriority(element: PerformanceReviewElement): void {
    // Priority calculation:
    // High priority: Unacceptable and getting worse
    // Medium priority: Unacceptable but stable/improving, or acceptable but getting worse
    // Low priority: Acceptable and stable/improving

    if (!element.twoFlagAnswered || !element.threeFlagAnswered) {
      element.priority = 1 // Default priority
      return
    }

    if (!element.twoFlag && element.threeFlag === -1) {
      element.priority = 3 // High priority: Unacceptable and getting worse
    } else if (!element.twoFlag || element.threeFlag === -1) {
      element.priority = 2 // Medium priority
    } else {
      element.priority = 1 // Low priority: Acceptable and stable/improving
    }
  }

  /**
   * Generate performance dashboard
   */
  static generatePerformanceDashboard(model: PerformanceReviewModel): PerformanceDashboard {
    const elements = model.model
    const evaluatedElements = elements.filter((e) => e.twoFlagAnswered)

    const acceptableElements = evaluatedElements.filter((e) => e.twoFlag)
    const unacceptableElements = evaluatedElements.filter((e) => !e.twoFlag)

    const improvingElements = evaluatedElements.filter(
      (e) => e.threeFlagAnswered && e.threeFlag === PerformanceTrend.GETTING_BETTER,
    )
    const decliningElements = evaluatedElements.filter(
      (e) => e.threeFlagAnswered && e.threeFlag === PerformanceTrend.GETTING_WORSE,
    )

    // Calculate overall score based on acceptability and trends
    const overallScore = this.calculateOverallScore(elements)

    // Identify priority areas
    const priorityAreas = this.identifyPriorityAreas(elements)

    return {
      overallScore,
      acceptableElements,
      unacceptableElements,
      improvingElements,
      decliningElements,
      priorityAreas,
    }
  }

  /**
   * Calculate overall performance score
   */
  static calculateOverallScore(elements: PerformanceReviewElement[]): number {
    if (elements.length === 0) return 0

    const evaluatedElements = elements.filter((e) => e.twoFlagAnswered)
    if (evaluatedElements.length === 0) return 0

    let totalScore = 0
    evaluatedElements.forEach((element) => {
      let elementScore = element.twoFlag ? 1 : 0 // Base acceptability score

      // Add performance trend bonus/penalty
      if (element.threeFlagAnswered) {
        if (element.threeFlag === PerformanceTrend.GETTING_BETTER) {
          elementScore += 0.2 // Bonus for improvement
        } else if (element.threeFlag === PerformanceTrend.GETTING_WORSE) {
          elementScore -= 0.2 // Penalty for decline
        }
      }

      totalScore += Math.max(0, Math.min(1, elementScore)) // Clamp between 0 and 1
    })

    return Math.round((totalScore / evaluatedElements.length) * 100)
  }

  /**
   * Identify priority areas that need attention
   */
  static identifyPriorityAreas(elements: PerformanceReviewElement[]): PriorityArea[] {
    const priorityAreas: PriorityArea[] = []

    elements.forEach((element) => {
      if (!element.twoFlagAnswered) return

      let priorityLevel: PriorityLevel = PriorityLevel.LOW
      let reason = ""
      let actionRequired = false

      // High priority: Unacceptable and getting worse
      if (!element.twoFlag && element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_WORSE) {
        priorityLevel = PriorityLevel.HIGH
        reason = "Unacceptable performance and declining trend"
        actionRequired = true
      }
      // High priority: Unacceptable but stable/improving
      else if (!element.twoFlag) {
        priorityLevel = PriorityLevel.HIGH
        reason = "Currently unacceptable performance"
        actionRequired = true
      }
      // Medium priority: Acceptable but declining
      else if (element.twoFlag && element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_WORSE) {
        priorityLevel = PriorityLevel.MEDIUM
        reason = "Acceptable but showing declining trend"
        actionRequired = true
      }
      // Low priority: Acceptable and stable
      else if (element.twoFlag && (!element.threeFlagAnswered || element.threeFlag === PerformanceTrend.STAY_SAME)) {
        priorityLevel = PriorityLevel.LOW
        reason = "Acceptable performance, monitor for changes"
        actionRequired = false
      }

      // Only add to priority areas if action is required or it's declining
      if (actionRequired || (element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_WORSE)) {
        priorityAreas.push({
          element,
          priorityLevel,
          reason,
          actionRequired,
        })
      }
    })

    // Sort by priority level (High -> Medium -> Low)
    return priorityAreas.sort((a, b) => {
      const priorityOrder = { [PriorityLevel.HIGH]: 3, [PriorityLevel.MEDIUM]: 2, [PriorityLevel.LOW]: 1 }
      return priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel]
    })
  }

  /**
   * Generate improvement plan based on priority areas
   */
  static generateImprovementPlan(priorityAreas: PriorityArea[]): ImprovementPlan {
    const highPriorityActions: ActionItem[] = []
    const mediumPriorityActions: ActionItem[] = []
    const lowPriorityActions: ActionItem[] = []

    priorityAreas.forEach((area) => {
      const action = this.generateActionItem(area)

      switch (area.priorityLevel) {
        case PriorityLevel.HIGH:
          highPriorityActions.push(action)
          break
        case PriorityLevel.MEDIUM:
          mediumPriorityActions.push(action)
          break
        case PriorityLevel.LOW:
          lowPriorityActions.push(action)
          break
      }
    })

    return {
      highPriorityActions,
      mediumPriorityActions,
      lowPriorityActions,
    }
  }

  /**
   * Generate specific action item for a priority area
   */
  static generateActionItem(area: PriorityArea): ActionItem {
    const element = area.element
    let action = ""
    let timeframe = ""

    switch (area.priorityLevel) {
      case PriorityLevel.HIGH:
        if (!element.twoFlag) {
          action = `Immediate intervention required for "${element.displayName}". Develop action plan to address unacceptable performance.`
          timeframe = "Immediate (1-2 weeks)"
        } else {
          action = `Address declining trend in "${element.displayName}" before it becomes unacceptable.`
          timeframe = "Short-term (2-4 weeks)"
        }
        break

      case PriorityLevel.MEDIUM:
        action = `Monitor and implement preventive measures for "${element.displayName}" to prevent further decline.`
        timeframe = "Medium-term (1-2 months)"
        break

      case PriorityLevel.LOW:
        action = `Continue monitoring "${element.displayName}" and maintain current performance levels.`
        timeframe = "Long-term (3+ months)"
        break
    }

    return {
      elementId: element.idug,
      action,
      priority: area.priorityLevel,
      timeframe,
    }
  }

  /**
   * Update element performance evaluation
   */
  static updateElementPerformance(
    model: PerformanceReviewModel,
    elementId: string,
    isAcceptable: boolean,
    performanceTrend?: PerformanceTrend,
    note?: string,
  ): PerformanceReviewModel {
    const element = model.model.find((e) => e.idug === elementId)
    if (!element) return model

    // Update acceptability
    element.twoFlag = isAcceptable
    element.twoFlagAnswered = true

    // Update performance trend if provided
    if (performanceTrend !== undefined) {
      element.threeFlag = performanceTrend
      element.threeFlagAnswered = true
    }

    // Update modification timestamp
    element.dtModified = new Date().toISOString()

    // Add to performance history if it exists
    if ("performanceHistory" in element) {
      const historyEntry = {
        date: new Date().toISOString(),
        acceptability: isAcceptable,
        performance: performanceTrend || PerformanceTrend.STAY_SAME,
        note,
      }

      if (!element.performanceHistory) {
        element.performanceHistory = []
      }
      element.performanceHistory.push(historyEntry)
    }

    return model
  }

  /**
   * Get performance trends over time for an element
   */
  static getPerformanceTrends(element: PerformanceReviewElement): Array<{
    date: string
    acceptability: boolean
    performance: number
    note?: string
  }> {
    if ("performanceHistory" in element && element.performanceHistory) {
      return element.performanceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    return []
  }

  /**
   * Validate model completeness
   */
  static validateModel(model: PerformanceReviewModel): boolean {
    const hasElements = model.model.length > 0
    const allElementsEvaluated = model.model.every((e) => e.twoFlagAnswered)
    const sufficientPerformanceData = model.model.filter((e) => e.threeFlagAnswered).length >= model.model.length * 0.5

    const isValid = hasElements && allElementsEvaluated && sufficientPerformanceData

    model.valid = isValid
    model.hasIssue = !isValid

    return isValid
  }

  /**
   * Get evaluation completion statistics
   */
  static getEvaluationStats(model: PerformanceReviewModel) {
    const totalElements = model.model.length
    const evaluatedElements = model.model.filter((e) => e.twoFlagAnswered).length
    const performanceEvaluated = model.model.filter((e) => e.threeFlagAnswered).length

    const evaluationProgress = totalElements > 0 ? evaluatedElements / totalElements : 0
    const performanceProgress = totalElements > 0 ? performanceEvaluated / totalElements : 0
    const overallProgress = (evaluationProgress + performanceProgress) / 2

    return {
      totalElements,
      evaluatedElements,
      performanceEvaluated,
      evaluationProgress,
      performanceProgress,
      overallProgress,
    }
  }

  /**
   * Generate performance review result
   */
  static generatePerformanceResult(model: PerformanceReviewModel): PerformanceReviewResult {
    const evaluatedElements = model.model.filter((e) => e.twoFlagAnswered && e.threeFlagAnswered)

    if (evaluatedElements.length === 0) {
      return {
        overallStatus: "MIXED",
        elementPerformance: [],
        recommendations: ["Complete element evaluations to generate insights"],
        riskFactors: ["Insufficient data for analysis"],
      }
    }

    // Calculate overall status
    const improvingCount = evaluatedElements.filter((e) => e.threeFlag === 1).length
    const decliningCount = evaluatedElements.filter((e) => e.threeFlag === -1).length
    const stableCount = evaluatedElements.filter((e) => e.threeFlag === 0).length

    let overallStatus: "IMPROVING" | "STABLE" | "DECLINING" | "MIXED" = "MIXED"

    if (improvingCount > decliningCount && improvingCount > stableCount) {
      overallStatus = "IMPROVING"
    } else if (decliningCount > improvingCount && decliningCount > stableCount) {
      overallStatus = "DECLINING"
    } else if (stableCount > improvingCount && stableCount > decliningCount) {
      overallStatus = "STABLE"
    }

    // Generate element performance summary
    const elementPerformance = evaluatedElements.map((element) => ({
      element,
      currentStatus: element.twoFlag,
      trend:
        element.threeFlag === 1
          ? ("IMPROVING" as const)
          : element.threeFlag === -1
            ? ("DECLINING" as const)
            : ("STABLE" as const),
      priority: element.priority,
    }))

    // Generate recommendations
    const recommendations: string[] = []
    const highPriorityElements = evaluatedElements.filter((e) => e.priority === 3)
    const unacceptableElements = evaluatedElements.filter((e) => !e.twoFlag)

    if (highPriorityElements.length > 0) {
      recommendations.push(`Address ${highPriorityElements.length} high-priority elements immediately`)
    }

    if (unacceptableElements.length > 0) {
      recommendations.push(`Focus on improving ${unacceptableElements.length} unacceptable elements`)
    }

    if (decliningCount > 0) {
      recommendations.push(`Investigate root causes for ${decliningCount} declining elements`)
    }

    // Generate risk factors
    const riskFactors: string[] = []

    if (decliningCount > improvingCount) {
      riskFactors.push("More elements declining than improving")
    }

    if (unacceptableElements.length > evaluatedElements.length / 2) {
      riskFactors.push("Majority of elements are unacceptable")
    }

    if (highPriorityElements.length > 0) {
      riskFactors.push(`${highPriorityElements.length} critical elements require immediate attention`)
    }

    return {
      overallStatus,
      elementPerformance,
      recommendations,
      riskFactors,
    }
  }
}
