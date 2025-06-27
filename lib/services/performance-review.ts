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

    // Categorize elements
    const acceptableElements = elements.filter((e) => e.twoFlag && e.twoFlagAnswered)
    const unacceptableElements = elements.filter((e) => !e.twoFlag && e.twoFlagAnswered)
    const improvingElements = elements.filter((e) => e.threeFlag === 1)
    const decliningElements = elements.filter((e) => e.threeFlag === -1)

    // Calculate overall score
    const evaluatedElements = elements.filter((e) => e.twoFlagAnswered)
    const overallScore = evaluatedElements.length > 0 ? acceptableElements.length / evaluatedElements.length : 0

    // Generate priority areas
    const priorityAreas: PriorityArea[] = elements
      .filter((e) => e.twoFlagAnswered && e.threeFlagAnswered)
      .map((element) => ({
        element,
        priorityLevel: element.priority || this.updateElementPriority(element),
        reason: this.generatePriorityReason(element),
        actionRequired: element.priority === 3 || false,
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
      priorityAreas,
    }
  }

  /**
   * Generate improvement plan
   */
  static generateImprovementPlan(model: PerformanceReviewModel): ImprovementPlan {
    const dashboard = this.generatePerformanceDashboard(model)

    const highPriorityActions: ActionItem[] = dashboard.priorityAreas
      .filter((area) => area.priorityLevel === PriorityLevel.HIGH)
      .map((area) => ({
        elementId: area.element.idug,
        action: this.generateActionItem(area.element),
        priority: PriorityLevel.HIGH,
        timeframe: "Immediate (1-2 weeks)",
      }))

    const mediumPriorityActions: ActionItem[] = dashboard.priorityAreas
      .filter((area) => area.priorityLevel === PriorityLevel.MEDIUM)
      .map((area) => ({
        elementId: area.element.idug,
        action: this.generateActionItem(area.element),
        priority: PriorityLevel.MEDIUM,
        timeframe: "Short-term (1-3 months)",
      }))

    const lowPriorityActions: ActionItem[] = dashboard.priorityAreas
      .filter((area) => area.priorityLevel === PriorityLevel.LOW)
      .map((area) => ({
        elementId: area.element.idug,
        action: this.generateActionItem(area.element),
        priority: PriorityLevel.LOW,
        timeframe: "Long-term (3-6 months)",
      }))

    return {
      highPriorityActions,
      mediumPriorityActions,
      lowPriorityActions,
    }
  }

  /**
   * Generate priority reason explanation
   */
  static generatePriorityReason(element: PerformanceReviewElement): string {
    const isAcceptable = element.twoFlag
    const trend = element.threeFlag

    if (!isAcceptable && trend === PerformanceTrend.GETTING_WORSE) {
      return "Unacceptable performance that is declining - requires immediate attention"
    }
    if (!isAcceptable && trend === PerformanceTrend.STAY_SAME) {
      return "Consistently unacceptable performance - needs improvement plan"
    }
    if (!isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return "Improving but still unacceptable - monitor progress closely"
    }
    if (isAcceptable && trend === PerformanceTrend.GETTING_WORSE) {
      return "Declining performance - prevent further deterioration"
    }
    if (isAcceptable && trend === PerformanceTrend.STAY_SAME) {
      return "Stable acceptable performance - maintain current level"
    }
    if (isAcceptable && trend === PerformanceTrend.GETTING_BETTER) {
      return "Strong performance trending upward - continue current approach"
    }

    return "Performance status requires evaluation"
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
