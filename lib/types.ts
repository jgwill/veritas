// TandT Application - Complete Type System
// Comprehensive type definitions for Digital Thinking Models

import {
  DigitalThinkingModelType,
  ElementStatus,
  AcceptabilityFlag,
  PerformanceTrend,
  PriorityLevel,
  ModelMode,
} from "./constants"

// Base Digital Element Interface
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

// Decision Making Element (Type 1 - Binary evaluation only)
export interface DecisionMakingElement extends BaseDigitalElement {
  // Decision Making specific fields
  threeFlag: 0 // Always 0 for Decision Making models
  threeFlagAnswered: false // Always false for Decision Making models
  dominanceFactor: number // Calculated from pairwise comparisons
  dominantElementItIS: boolean
  comparationCompleted: boolean
  comparationTableData: Record<string, number> // Pairwise comparison values
}

// Performance Review Element (Type 2 - Binary + performance evaluation)
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
  performanceHistory?: PerformanceHistoryEntry[]
}

// Business Analysis Element (Type 3)
export interface BusinessAnalysisElement extends BaseDigitalElement {
  threeFlag: PerformanceTrend
  threeFlagAnswered: boolean
  dominanceFactor: number
  dominantElementItIS: boolean
  comparationCompleted: boolean
  comparationTableData: Record<string, number>
  // Business Analysis specific fields
  businessImpact: PriorityLevel
  riskLevel: PriorityLevel
  costImplication: number
  timeToImplement: number
}

// Union type for all element types
export type DigitalElement = DecisionMakingElement | PerformanceReviewElement | BusinessAnalysisElement

// Base Digital Model Interface
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
  dtCreated: string
  dtModified: string
}

// Decision Making Model (Type 1)
export interface DecisionMakingModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING
  twoOnly: true // Only binary evaluation
  model: DecisionMakingElement[]
  comparisonMatrix?: ComparisonMatrix
  decisionResult?: DecisionResult
}

// Performance Review Model (Type 2)
export interface PerformanceReviewModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.PERFORMANCE_REVIEW
  twoOnly: false // Binary + performance evaluation
  model: PerformanceReviewElement[]
  performanceDashboard?: PerformanceDashboard
  improvementPlan?: ImprovementPlan
}

// Business Analysis Model (Type 3)
export interface BusinessAnalysisModel extends BaseDigitalModel {
  digitalThinkingModelType: DigitalThinkingModelType.BUSINESS_ANALYSIS
  twoOnly: false
  model: BusinessAnalysisElement[]
  businessMetrics?: BusinessMetric[]
  analysisResults?: AnalysisResult[]
}

// Union type for all models
export type DigitalModel = DecisionMakingModel | PerformanceReviewModel | BusinessAnalysisModel

// Supporting Interfaces
export interface ComparisonMatrix {
  totalComparisons: number
  completedComparisons: number
  consistencyScore: number
  matrix: Record<string, Record<string, number>>
  pairs: ComparisonPair[]
}

export interface ComparisonPair {
  element1Id: string
  element2Id: string
  value: number // 1 = element1 dominates, -1 = element2 dominates, 0 = neutral
  completed: boolean
  question: string
}

export interface DecisionResult {
  decision: "YES" | "NO" | "INSUFFICIENT_DATA"
  confidence: number
  mandatoryElements: DecisionMakingElement[]
  optionalElements: DecisionMakingElement[]
  hierarchy: ElementHierarchy[]
  reasoning: string
}

export interface ElementHierarchy {
  element: DecisionMakingElement
  rank: number
  dominanceScore: number
  isMandatory: boolean
}

export interface PerformanceDashboard {
  overallScore: number
  trendDirection: PerformanceTrend
  acceptableElements: PerformanceReviewElement[]
  unacceptableElements: PerformanceReviewElement[]
  improvingElements: PerformanceReviewElement[]
  decliningElements: PerformanceReviewElement[]
  priorityAreas: PriorityArea[]
  lastUpdated: string
}

export interface PriorityArea {
  element: PerformanceReviewElement
  priorityLevel: PriorityLevel
  performanceTrend: PerformanceTrend
  reason: string
  actionRequired: boolean
  recommendedAction: string
}

export interface ImprovementPlan {
  highPriorityActions: ActionItem[]
  mediumPriorityActions: ActionItem[]
  lowPriorityActions: ActionItem[]
  timeline: string
  expectedOutcomes: string[]
}

export interface ActionItem {
  elementId: string
  action: string
  priority: PriorityLevel
  timeframe: string
  responsible?: string
  status: "pending" | "in_progress" | "completed"
}

export interface PerformanceHistoryEntry {
  date: string
  acceptability: boolean
  performance: PerformanceTrend
  note?: string
  evaluatedBy?: string
}

export interface BusinessMetric {
  id: string
  name: string
  value: number
  target: number
  trend: PerformanceTrend
  category: string
  unit: string
  lastUpdated: string
}

export interface AnalysisResult {
  category: string
  score: number
  maxScore: number
  insights: string[]
  recommendations: string[]
  riskFactors: string[]
  opportunities: string[]
}

// Request/Response Types
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

export interface EvaluateElementRequest {
  elementId: string
  isAcceptable: boolean
  performanceTrend?: PerformanceTrend
  note?: string
}

export interface ComparisonRequest {
  element1Id: string
  element2Id: string
  decision: "YES" | "NO"
  question: string
}

export interface ModelResponse {
  success: boolean
  model?: DigitalModel
  error?: string
  message?: string
}

export interface ModelsResponse {
  success: boolean
  models?: DigitalModel[]
  error?: string
  message?: string
}

export interface ElementResponse {
  success: boolean
  element?: DigitalElement
  error?: string
  message?: string
}

// Statistics Types
export interface ModelStatistics {
  totalElements: number
  evaluatedElements: number
  evaluationProgress: number
  modelType: string
  modelTypeName: string
  isValid: boolean
  hasIssues: boolean
  lastModified: string
  // Decision Making specific
  totalComparisons?: number
  completedComparisons?: number
  comparisonProgress?: number
  consistencyScore?: number
  dominantElements?: number
  // Performance Review specific
  performanceEvaluated?: number
  performanceProgress?: number
  improvingElements?: number
  decliningElements?: number
  highPriorityElements?: number
  // Business Analysis specific
  businessImpactScore?: number
  riskScore?: number
  implementationComplexity?: number
}

export interface DashboardStats {
  totalModels: number
  decisionMakingModels: number
  performanceReviewModels: number
  businessAnalysisModels: number
  completedModels: number
  modelsInProgress: number
  recentActivity: ActivityEntry[]
}

export interface ActivityEntry {
  id: string
  type: "model_created" | "model_updated" | "element_evaluated" | "comparison_made"
  modelId: string
  modelName: string
  timestamp: string
  description: string
}

// UI State Types
export interface ModelViewState {
  mode: ModelMode
  selectedElement?: string
  showComparisons: boolean
  showPerformanceHistory: boolean
  showBusinessMetrics: boolean
  filterStatus?: ElementStatus
  sortBy: "name" | "status" | "priority" | "performance"
  sortOrder: "asc" | "desc"
}

export interface UIPreferences {
  theme: "light" | "dark" | "system"
  compactView: boolean
  showDescriptions: boolean
  autoSave: boolean
  notifications: boolean
}

// Event Types for Advanced Features
export interface ModelEvent {
  type: "MODEL_CREATED" | "MODEL_UPDATED" | "MODEL_DELETED" | "ELEMENT_EVALUATED" | "COMPARISON_MADE" | "MODE_CHANGED"
  modelId: string
  timestamp: string
  userId?: string
  data?: any
  metadata?: Record<string, any>
}

export interface TandTEventManager {
  subscribe(eventType: string, callback: (event: ModelEvent) => void): void
  unsubscribe(eventType: string, callback: (event: ModelEvent) => void): void
  emit(event: ModelEvent): void
  getHistory(modelId?: string): ModelEvent[]
  clearHistory(modelId?: string): void
}

// Type Guards
export function isDecisionMakingModel(model: DigitalModel): model is DecisionMakingModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING
}

export function isPerformanceReviewModel(model: DigitalModel): model is PerformanceReviewModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW
}

export function isBusinessAnalysisModel(model: DigitalModel): model is BusinessAnalysisModel {
  return model.digitalThinkingModelType === DigitalThinkingModelType.BUSINESS_ANALYSIS
}

export function isDecisionMakingElement(element: DigitalElement): element is DecisionMakingElement {
  return (
    "comparationTableData" in element &&
    typeof element.comparationTableData === "object" &&
    Object.keys(element.comparationTableData).length >= 0
  )
}

export function isPerformanceReviewElement(element: DigitalElement): element is PerformanceReviewElement {
  return (
    "threeFlag" in element && typeof element.threeFlag === "number" && element.threeFlag >= -1 && element.threeFlag <= 1
  )
}

export function isBusinessAnalysisElement(element: DigitalElement): element is BusinessAnalysisElement {
  return "businessImpact" in element && "riskLevel" in element && "costImplication" in element
}

// Utility Types
export type ModelTypeKey = keyof typeof DigitalThinkingModelType
export type ElementStatusKey = keyof typeof ElementStatus
export type PerformanceTrendKey = keyof typeof PerformanceTrend
export type PriorityLevelKey = keyof typeof PriorityLevel

// Export commonly used types for convenience
export type {
  DigitalModel,
  DecisionMakingModel,
  PerformanceReviewModel,
  BusinessAnalysisModel,
  DigitalElement,
  ModelStatistics,
  DashboardStats,
  ModelViewState,
}

// Re-export constants for convenience
export { DigitalThinkingModelType, ElementStatus, AcceptabilityFlag, PerformanceTrend, PriorityLevel, ModelMode }
