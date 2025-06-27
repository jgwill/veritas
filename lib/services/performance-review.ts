import type { PerformanceReviewModel, DigitalElement, ImprovementPlan, PerformanceTrend, PriorityLevel } from "../types"
import { crypto } from "crypto"

export class PerformanceReviewService {
  /**
   * Create a new Performance Review model
   */
  static createModel(modelName: string, digitalTopic: string, note?: string): PerformanceReviewModel {
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
      dtCreated: new Date().toISOString(),
      dtModified: new Date().toISOString(),
      model: [],
      performanceDashboard: {
        overallScore: 0,
        trendDirection: PerformanceTrend.STAYING_SAME,
        evaluatedElements: 0,
        totalElements: 0,
        lastUpdated: new Date().toISOString(),
      },
      priorityAreas: [],
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

    // Update dashboard
    this.updatePerformanceDashboard(model)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Evaluate element performance trend
   */
  static evaluateElementPerformance(
    model: PerformanceReviewModel,
    elementId: string,
    performanceTrend: PerformanceTrend,
  ): PerformanceReviewModel {
    const element = model.model.find((e) => e.idug === elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    element.threeFlag = performanceTrend
    element.threeFlagAnswered = true

    // Update dashboard and priority areas
    this.updatePerformanceDashboard(model)
    this.updatePriorityAreas(model)

    return {
      ...model,
      dtModified: new Date().toISOString(),
    }
  }

  /**
   * Update performance dashboard
   */
  static updatePerformanceDashboard(model: PerformanceReviewModel): void {
    const totalElements = model.model.length
    const evaluatedElements = model.model.filter((e) => e.twoFlagAnswered).length
    const performanceEvaluated = model.model.filter((e) => e.threeFlagAnswered).length

    // Calculate overall score based on acceptability
    const acceptableElements = model.model.filter((e) => e.twoFlag && e.twoFlagAnswered).length
    const overallScore = evaluatedElements > 0 ? (acceptableElements / evaluatedElements) * 100 : 0

    // Calculate overall trend
    const performanceElements = model.model.filter((e) => e.threeFlagAnswered)
    let trendSum = 0
    performanceElements.forEach((e) => (trendSum += e.threeFlag))
    const avgTrend = performanceElements.length > 0 ? trendSum / performanceElements.length : 0

    let trendDirection: PerformanceTrend
    if (avgTrend > 0.3) trendDirection = PerformanceTrend.GETTING_BETTER
    else if (avgTrend < -0.3) trendDirection = PerformanceTrend.GETTING_WORSE
    else trendDirection = PerformanceTrend.STAYING_SAME

    model.performanceDashboard = {
      overallScore,
      trendDirection,
      evaluatedElements,
      totalElements,
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Update priority areas based on performance
   */
  static updatePriorityAreas(model: PerformanceReviewModel): void {
    model.priorityAreas = model.model
      .filter((e) => e.threeFlagAnswered)
      .map((element) => {
        let priorityLevel: PriorityLevel
        let recommendedAction: string

        // Determine priority based on acceptability and performance trend
        if (!element.twoFlag && element.threeFlag === PerformanceTrend.GETTING_WORSE) {
          priorityLevel = PriorityLevel.CRITICAL
          recommendedAction = "Immediate intervention required - unacceptable and declining"
        } else if (!element.twoFlag) {
          priorityLevel = PriorityLevel.HIGH
          recommendedAction = "Address unacceptable performance"
        } else if (element.threeFlag === PerformanceTrend.GETTING_WORSE) {
          priorityLevel = PriorityLevel.MEDIUM
          recommendedAction = "Monitor declining trend and implement improvements"
        } else if (element.threeFlag === PerformanceTrend.GETTING_BETTER) {
          priorityLevel = PriorityLevel.LOW
          recommendedAction = "Continue current positive trajectory"
        } else {
          priorityLevel = PriorityLevel.LOW
          recommendedAction = "Maintain current performance level"
        }

        return {
          elementId: element.idug,
          priorityLevel,
          performanceTrend: element.threeFlag,
          recommendedAction,
        }
      })
      .sort((a, b) => b.priorityLevel - a.priorityLevel)
  }

  /**
   * Generate improvement plan
   */
  static generateImprovementPlan(model: PerformanceReviewModel): ImprovementPlan {
    const criticalAreas = model.priorityAreas.filter((p) => p.priorityLevel === PriorityLevel.CRITICAL)
    const highAreas = model.priorityAreas.filter((p) => p.priorityLevel === PriorityLevel.HIGH)
    const mediumAreas = model.priorityAreas.filter((p) => p.priorityLevel === PriorityLevel.MEDIUM)

    return {
      highPriorityActions: [
        ...criticalAreas.map((p) => p.recommendedAction),
        ...highAreas.map((p) => p.recommendedAction),
      ],
      mediumPriorityActions: mediumAreas.map((p) => p.recommendedAction),
      lowPriorityActions: model.priorityAreas
        .filter((p) => p.priorityLevel === PriorityLevel.LOW)
        .map((p) => p.recommendedAction),
      timeline: "30-90 days for high priority, 90-180 days for medium priority",
      expectedOutcomes: [
        "Improved overall performance score",
        "Reduced critical and high priority areas",
        "Enhanced system stability and effectiveness",
      ],
    }
  }

  /**
   * Get evaluation statistics
   */
  static getEvaluationStats(model: PerformanceReviewModel) {
    const totalElements = model.model.length
    const evaluatedElements = model.model.filter((e) => e.twoFlagAnswered).length
    const performanceEvaluated = model.model.filter((e) => e.threeFlagAnswered).length

    return {
      totalElements,
      evaluatedElements,
      performanceEvaluated,
      evaluationProgress: totalElements > 0 ? evaluatedElements / totalElements : 0,
      performanceProgress: totalElements > 0 ? performanceEvaluated / totalElements : 0,
      overallProgress: totalElements > 0 ? (evaluatedElements + performanceEvaluated) / (totalElements * 2) : 0,
    }
  }

  /**
   * Validate model completeness
   */
  static validateModel(model: PerformanceReviewModel): boolean {
    const hasElements = model.model.length > 0
    const allAcceptabilityEvaluated = model.model.every((e) => e.twoFlagAnswered)
    const allPerformanceEvaluated = model.model.every((e) => e.threeFlagAnswered)

    return hasElements && allAcceptabilityEvaluated && allPerformanceEvaluated
  }
}
