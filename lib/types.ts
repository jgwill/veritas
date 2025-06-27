// TandT Application - Enhanced Type Definitions
// Differentiating Digital Decision Making vs Digital Performance Review Models

// Core Enums
export enum DigitalThinkingModelType {
  DECISION_MAKING = 1,
  PERFORMANCE_REVIEW = 2,
}

export enum ElementStatus {
  ACTIVE = 1,
  EVALUATED = 3,
}

export enum AcceptabilityFlag {
  UNACCEPTABLE = 0,
  ACCEPTABLE = 1,
}

export enum PerformanceTrend {
  GETTING_WORSE = -1,
  STAY_SAME = 0,
  GETTING_BETTER = 1,
}

export enum PriorityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// Base Element Interface
export interface BaseDigitalElement {
  idug: string
  nameElement: string
  displayName: string
  description: string
  sortNo: number
  status: ElementStatus
  twoFlag: boolean // Binary acceptability (1/0)
  twoFlagAnswered: boolean
  question: boolean
  dtCreated?: string
  dtModified?: string
}

// Decision Making Element (extends base with comparison data)
export interface DecisionMakingElement extends BaseDigitalElement {
  // Decision Making specific fields
  threeFlag: 0 // Always 0 for Decision Making models
  threeFlagAnswered: false // Always false for Decision Making models
  dominanceFactor: number // Calculated from comparisons
  dominantElementItIS: boolean
  comparationCompleted: boolean
  comparationTableData: Record<string, number> // Pairwise comparison values
}

// Performance Review Element (extends base with trend tracking)
export interface PerformanceReviewElement extends BaseDigitalElement {
  // Performance Review specific fields
  threeFlag: PerformanceTrend // Performance trend tracking
  threeFlagAnswered: boolean
  dominanceFactor: 0 // Always 0 for Performance Review models
  dominantElementItIS: false // Always false for Performance Review models
  comparationCompleted: false // Always false for Performance Review models
  comparationTableData: {} // Empty for Performance Review models
  // Additional Performance Review fields
  priorityLevel?: PriorityLevel
  improvementRequired?: boolean
}

// Base Model Interface
export interface BaseDigitalModel {
  id: string
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: DigitalThinkingModelType
  decided: boolean
  valid: boolean
  autoSaveModel: boolean
  hasIssue: boolean
  note?: string
  dtCreated?: string
  dtModified?: string
}

// Decision Making Model
export interface DecisionMakingModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING
  twoOnly: true // Always true for Decision Making models
  model: DecisionMakingElement[]
  // Decision Making specific methods/properties
  comparisonMatrix?: ComparisonMatrix
  decisionResult?: DecisionResult
}

// Performance Review Model
export interface PerformanceReviewModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.PERFORMANCE_REVIEW
  twoOnly: false // Always false for Performance Review models
  model: PerformanceReviewElement[]
  // Performance Review specific methods/properties
  performanceDashboard?: PerformanceDashboard
  improvementPlan?: ImprovementPlan
}

// Union type for all models
export type DigitalModel = DecisionMakingModel | PerformanceReviewModel

// Comparison Matrix for Decision Making models
export interface ComparisonMatrix {
  completed: boolean
  totalComparisons: number
  completedComparisons: number
  consistencyScore: number
  pairs: ComparisonPair[]
}

export interface ComparisonPair {
  element1Id: string
  element2Id: string
  value: number // 1 = element1 dominates, -1 = element2 dominates, 0 = neutral
  completed: boolean
}

// Decision Making Results
export interface DecisionResult {
  decision: "YES" | "NO"
  confidence: number
  mandatoryElements: DecisionMakingElement[]
  optionalElements: DecisionMakingElement[]
  hierarchy: ElementHierarchy[]
}

export interface ElementHierarchy {
  element: DecisionMakingElement
  rank: number
  dominanceScore: number
  isMandatory: boolean
}

// Performance Review Results
export interface PerformanceDashboard {
  overallScore: number
  acceptableElements: PerformanceReviewElement[]
  unacceptableElements: PerformanceReviewElement[]
  improvingElements: PerformanceReviewElement[]
  decliningElements: PerformanceReviewElement[]
  priorityAreas: PriorityArea[]
}

export interface PriorityArea {
  element: PerformanceReviewElement
  priorityLevel: PriorityLevel
  reason: string
  actionRequired: boolean
}

export interface ImprovementPlan {
  highPriorityActions: ActionItem[]
  mediumPriorityActions: ActionItem[]
  lowPriorityActions: ActionItem[]
}

export interface ActionItem {
  elementId: string
  action: string
  priority: PriorityLevel
  timeframe: string
}

// Application Mode Types
export type AppMode = "editing" | "analyzing"

// Model Creation Types
export interface CreateModelRequest {
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: DigitalThinkingModelType
  note?: string
}

export interface CreateElementRequest {
  modelId: string
  nameElement: string
  displayName: string
  description: string
}

// Type Guards
export function isDecisionMakingModel(model: DigitalModel): model is DecisionMakingModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING
}

export function isPerformanceReviewModel(model: DigitalModel): model is PerformanceReviewModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW
}

export function isDecisionMakingElement(element: BaseDigitalElement): element is DecisionMakingElement {
  return "comparationTableData" in element && Object.keys(element.comparationTableData || {}).length > 0
}

export function isPerformanceReviewElement(element: BaseDigitalElement): element is PerformanceReviewElement {
  return "threeFlag" in element && typeof element.threeFlag === "number" && element.threeFlag !== 0
}
