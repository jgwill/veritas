// TandT Types - Comprehensive Type System
// Defines all model types, interfaces, and enums for the TandT framework

export enum DigitalThinkingModelType {
  DECISION_MAKING = 1,
  PERFORMANCE_REVIEW = 2,
}

export interface BaseDigitalElement {
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
}

export interface DecisionMakingElement extends BaseDigitalElement {
  dominanceFactor: number
  dominantElementItIS: boolean
  comparationCompleted: boolean
  question: boolean
  comparationTableData: Record<string, number>
}

export interface PerformanceReviewElement extends BaseDigitalElement {
  priority: number
  performanceHistory: Array<{
    date: string
    acceptability: boolean
    performance: number
    note?: string
  }>
}

export interface BaseDigitalModel {
  id: string
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: DigitalThinkingModelType
  twoOnly: boolean
  decided: boolean
  valid: boolean
  autoSaveModel: boolean
  hasIssue: boolean
  note?: string
  dtCreated: string
  dtModified: string
}

export interface DecisionMakingModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING
  model: DecisionMakingElement[]
  comparisonMatrix?: {
    totalComparisons: number
    completedComparisons: number
    consistencyScore: number
  }
}

export interface PerformanceReviewModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.PERFORMANCE_REVIEW
  model: PerformanceReviewElement[]
  evaluationStats?: {
    totalElements: number
    evaluatedElements: number
    performanceTracked: number
    overallProgress: number
  }
}

export type DigitalModel = DecisionMakingModel | PerformanceReviewModel
export type DigitalElement = DecisionMakingElement | PerformanceReviewElement

// Type Guards
export function isDecisionMakingModel(model: DigitalModel): model is DecisionMakingModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING
}

export function isPerformanceReviewModel(model: DigitalModel): model is PerformanceReviewModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW
}

export function isDecisionMakingElement(element: DigitalElement): element is DecisionMakingElement {
  return "dominanceFactor" in element
}

export function isPerformanceReviewElement(element: DigitalElement): element is PerformanceReviewElement {
  return "priority" in element
}

// Request/Response Types
export interface CreateModelRequest {
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: DigitalThinkingModelType
  note?: string
}

export interface AddElementRequest {
  nameElement: string
  displayName: string
  description: string
}

export interface EvaluateElementRequest {
  elementId: string
  isAcceptable: boolean
  performanceTrend?: number // -1: worse, 0: same, 1: better (Performance Review only)
  note?: string
}

export interface ComparisonRequest {
  element1Id: string
  element2Id: string
  decision: "YES" | "NO" // "If you have element1 but not element2, would the decision be YES or NO?"
}

// Analysis Results
export interface DecisionMakingResult {
  recommendation: "YES" | "NO" | "INSUFFICIENT_DATA"
  dominantElements: Array<{
    element: DecisionMakingElement
    dominanceFactor: number
    isAcceptable: boolean
  }>
  criticalMissingElements: DecisionMakingElement[]
  consistencyScore: number
  confidence: number
}

export interface PerformanceReviewResult {
  overallStatus: "IMPROVING" | "STABLE" | "DECLINING" | "MIXED"
  elementPerformance: Array<{
    element: PerformanceReviewElement
    currentStatus: boolean
    trend: "IMPROVING" | "STABLE" | "DECLINING"
    priority: number
  }>
  recommendations: string[]
  riskFactors: string[]
}

// UI State Types
export interface ModelViewState {
  mode: "EDITING" | "ANALYZING" | "RESULTS"
  selectedElement?: string
  showComparisons?: boolean
  showPerformanceHistory?: boolean
}

export interface ComparisonMatrixState {
  matrix: Record<string, Record<string, number>>
  completedComparisons: number
  totalComparisons: number
  consistencyScore: number
}

// Export commonly used types
export type {
  DigitalModel,
  DecisionMakingModel,
  PerformanceReviewModel,
  DigitalElement,
  DecisionMakingElement,
  PerformanceReviewElement,
}
