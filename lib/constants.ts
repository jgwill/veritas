// TandT Application Constants
// Centralized configuration and enums for the Digital Thinking Models

// Core Model Types
export enum DigitalThinkingModelType {
  DECISION_MAKING = 1,
  PERFORMANCE_REVIEW = 2,
  BUSINESS_ANALYSIS = 3,
  GENERIC = 4,
  GENERIC_TWO_ONLY = 5,
}

// Element Status
export enum ElementStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  PENDING = 2,
}

// Acceptability Flags
export enum AcceptabilityFlag {
  UNACCEPTABLE = 0,
  ACCEPTABLE = 1,
}

// Performance Trends
export enum PerformanceTrend {
  GETTING_WORSE = -1,
  STAYING_SAME = 0,
  GETTING_BETTER = 1,
}

// Priority Levels
export enum PriorityLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

// Model Modes
export enum ModelMode {
  EDITING = "editing",
  ANALYZING = "analyzing",
  RESULTS = "results",
}

// Model Type Labels
export const MODEL_TYPE_LABELS: Record<DigitalThinkingModelType, string> = {
  [DigitalThinkingModelType.DECISION_MAKING]: "Digital Decision Making",
  [DigitalThinkingModelType.PERFORMANCE_REVIEW]: "Digital Performance Review",
  [DigitalThinkingModelType.BUSINESS_ANALYSIS]: "Business Analysis",
  [DigitalThinkingModelType.GENERIC]: "Generic Model",
  [DigitalThinkingModelType.GENERIC_TWO_ONLY]: "Generic Two-Flag Model",
}

// Model Type Descriptions
export const MODEL_TYPE_DESCRIPTIONS: Record<DigitalThinkingModelType, string> = {
  [DigitalThinkingModelType.DECISION_MAKING]:
    "Analyze decision scenarios using pairwise comparisons to determine element hierarchy and mandatory factors.",
  [DigitalThinkingModelType.PERFORMANCE_REVIEW]:
    "Track performance trends over time with binary acceptability and performance direction evaluation.",
  [DigitalThinkingModelType.BUSINESS_ANALYSIS]:
    "Comprehensive business analysis with impact assessment, risk evaluation, and implementation planning.",
  [DigitalThinkingModelType.GENERIC]: "General-purpose model with flexible evaluation criteria.",
  [DigitalThinkingModelType.GENERIC_TWO_ONLY]: "Simplified model with binary evaluation only.",
}

// Element Status Labels
export const ELEMENT_STATUS_LABELS: Record<ElementStatus, string> = {
  [ElementStatus.ACTIVE]: "Active",
  [ElementStatus.INACTIVE]: "Inactive",
  [ElementStatus.PENDING]: "Pending",
}

// Performance Trend Labels
export const PERFORMANCE_TREND_LABELS: Record<PerformanceTrend, string> = {
  [PerformanceTrend.GETTING_WORSE]: "Getting Worse",
  [PerformanceTrend.STAYING_SAME]: "Staying Same",
  [PerformanceTrend.GETTING_BETTER]: "Getting Better",
}

// Priority Level Labels
export const PRIORITY_LEVEL_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: "Low",
  [PriorityLevel.MEDIUM]: "Medium",
  [PriorityLevel.HIGH]: "High",
  [PriorityLevel.CRITICAL]: "Critical",
}

// Model Mode Labels
export const MODEL_MODE_LABELS: Record<ModelMode, string> = {
  [ModelMode.EDITING]: "Editing",
  [ModelMode.ANALYZING]: "Analyzing",
  [ModelMode.RESULTS]: "Results",
}

// Color Schemes for UI
export const MODEL_TYPE_COLORS: Record<DigitalThinkingModelType, string> = {
  [DigitalThinkingModelType.DECISION_MAKING]: "blue",
  [DigitalThinkingModelType.PERFORMANCE_REVIEW]: "green",
  [DigitalThinkingModelType.BUSINESS_ANALYSIS]: "purple",
  [DigitalThinkingModelType.GENERIC]: "gray",
  [DigitalThinkingModelType.GENERIC_TWO_ONLY]: "slate",
}

export const PERFORMANCE_TREND_COLORS: Record<PerformanceTrend, string> = {
  [PerformanceTrend.GETTING_WORSE]: "red",
  [PerformanceTrend.STAYING_SAME]: "yellow",
  [PerformanceTrend.GETTING_BETTER]: "green",
}

export const PRIORITY_LEVEL_COLORS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: "green",
  [PriorityLevel.MEDIUM]: "yellow",
  [PriorityLevel.HIGH]: "orange",
  [PriorityLevel.CRITICAL]: "red",
}

// Application Configuration
export const APP_CONFIG = {
  name: "TandT Digital Thinking",
  version: "1.0.0",
  description: "Advanced Digital Thinking Models for Decision Making and Performance Review",
  maxElementsPerModel: 50,
  maxModelsPerUser: 100,
  autoSaveInterval: 30000, // 30 seconds
  defaultModelType: DigitalThinkingModelType.DECISION_MAKING,
}

// API Configuration
export const API_CONFIG = {
  baseUrl: "/api",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// UI Configuration
export const UI_CONFIG = {
  defaultTheme: "light",
  compactView: false,
  showDescriptions: true,
  autoSave: true,
  notifications: true,
  animationDuration: 200,
  debounceDelay: 300,
}

// Validation Rules
export const VALIDATION_RULES = {
  modelName: {
    minLength: 3,
    maxLength: 100,
    required: true,
  },
  digitalTopic: {
    minLength: 5,
    maxLength: 200,
    required: true,
  },
  elementName: {
    minLength: 2,
    maxLength: 50,
    required: true,
  },
  elementDisplayName: {
    minLength: 3,
    maxLength: 100,
    required: true,
  },
  elementDescription: {
    minLength: 0,
    maxLength: 500,
    required: false,
  },
  note: {
    minLength: 0,
    maxLength: 1000,
    required: false,
  },
}

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_LENGTH: "Invalid length for this field",
  INVALID_FORMAT: "Invalid format",
  MODEL_NOT_FOUND: "Model not found",
  ELEMENT_NOT_FOUND: "Element not found",
  UNAUTHORIZED: "Unauthorized access",
  SERVER_ERROR: "Server error occurred",
  NETWORK_ERROR: "Network error occurred",
  VALIDATION_ERROR: "Validation error",
}

// Success Messages
export const SUCCESS_MESSAGES = {
  MODEL_CREATED: "Model created successfully",
  MODEL_UPDATED: "Model updated successfully",
  MODEL_DELETED: "Model deleted successfully",
  ELEMENT_CREATED: "Element created successfully",
  ELEMENT_UPDATED: "Element updated successfully",
  ELEMENT_DELETED: "Element deleted successfully",
  EVALUATION_SAVED: "Evaluation saved successfully",
  COMPARISON_SAVED: "Comparison saved successfully",
}

// Feature Flags
export const FEATURE_FLAGS = {
  enableGeminiAssistant: true,
  enableAdvancedAnalytics: true,
  enableExportFeatures: true,
  enableCollaboration: false,
  enableNotifications: true,
  enableAutoSave: true,
  enableDarkMode: true,
  enableMobileView: true,
}

// Export all constants
export default {
  DigitalThinkingModelType,
  ElementStatus,
  AcceptabilityFlag,
  PerformanceTrend,
  PriorityLevel,
  ModelMode,
  MODEL_TYPE_LABELS,
  MODEL_TYPE_DESCRIPTIONS,
  ELEMENT_STATUS_LABELS,
  PERFORMANCE_TREND_LABELS,
  PRIORITY_LEVEL_LABELS,
  MODEL_MODE_LABELS,
  MODEL_TYPE_COLORS,
  PERFORMANCE_TREND_COLORS,
  PRIORITY_LEVEL_COLORS,
  APP_CONFIG,
  API_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
}
