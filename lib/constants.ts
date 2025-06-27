// TandT Application Constants
// Core constants and enums used throughout the application

export enum DigitalThinkingModelType {
  DECISION_MAKING = 1,
  PERFORMANCE_REVIEW = 2,
  BUSINESS_ANALYSIS = 3,
  GENERIC = 4,
  GENERIC_TWO_ONLY = 5,
}

export enum ElementStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  PENDING = 2,
  EVALUATED = 3,
  ARCHIVED = 4,
}

export enum AcceptabilityFlag {
  UNACCEPTABLE = 0,
  ACCEPTABLE = 1,
}

export enum PerformanceTrend {
  GETTING_WORSE = -1,
  STAYING_SAME = 0,
  GETTING_BETTER = 1,
}

export enum PriorityLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export enum ModelMode {
  EDITING = "editing",
  ANALYZING = "analyzing",
  RESULTS = "results",
}

// Model Type Labels
export const MODEL_TYPE_LABELS = {
  [DigitalThinkingModelType.DECISION_MAKING]: "Digital Decision Making",
  [DigitalThinkingModelType.PERFORMANCE_REVIEW]: "Digital Performance Review",
  [DigitalThinkingModelType.BUSINESS_ANALYSIS]: "Business Analysis",
  [DigitalThinkingModelType.GENERIC]: "Generic Model",
  [DigitalThinkingModelType.GENERIC_TWO_ONLY]: "Generic Two-Flag Model",
} as const

// Status Labels
export const ELEMENT_STATUS_LABELS = {
  [ElementStatus.INACTIVE]: "Inactive",
  [ElementStatus.ACTIVE]: "Active",
  [ElementStatus.PENDING]: "Pending",
  [ElementStatus.EVALUATED]: "Evaluated",
  [ElementStatus.ARCHIVED]: "Archived",
} as const

export const PERFORMANCE_TREND_LABELS = {
  [PerformanceTrend.GETTING_WORSE]: "Getting Worse",
  [PerformanceTrend.STAYING_SAME]: "Staying Same",
  [PerformanceTrend.GETTING_BETTER]: "Getting Better",
} as const

export const PRIORITY_LEVEL_LABELS = {
  [PriorityLevel.LOW]: "Low",
  [PriorityLevel.MEDIUM]: "Medium",
  [PriorityLevel.HIGH]: "High",
  [PriorityLevel.CRITICAL]: "Critical",
} as const

// Default Values
export const DEFAULT_ELEMENT_STATUS = ElementStatus.ACTIVE
export const DEFAULT_PERFORMANCE_TREND = PerformanceTrend.STAYING_SAME
export const DEFAULT_PRIORITY_LEVEL = PriorityLevel.MEDIUM

// Validation Constants
export const MIN_MODEL_NAME_LENGTH = 3
export const MAX_MODEL_NAME_LENGTH = 100
export const MIN_ELEMENT_NAME_LENGTH = 2
export const MAX_ELEMENT_NAME_LENGTH = 80
export const MAX_DESCRIPTION_LENGTH = 500

// UI Constants
export const ITEMS_PER_PAGE = 10
export const DEBOUNCE_DELAY = 300
export const AUTO_SAVE_DELAY = 2000

// Colors for UI
export const STATUS_COLORS = {
  [ElementStatus.INACTIVE]: "gray",
  [ElementStatus.ACTIVE]: "blue",
  [ElementStatus.PENDING]: "yellow",
  [ElementStatus.EVALUATED]: "green",
  [ElementStatus.ARCHIVED]: "red",
} as const

export const TREND_COLORS = {
  [PerformanceTrend.GETTING_WORSE]: "red",
  [PerformanceTrend.STAYING_SAME]: "yellow",
  [PerformanceTrend.GETTING_BETTER]: "green",
} as const

export const PRIORITY_COLORS = {
  [PriorityLevel.LOW]: "gray",
  [PriorityLevel.MEDIUM]: "blue",
  [PriorityLevel.HIGH]: "orange",
  [PriorityLevel.CRITICAL]: "red",
} as const
