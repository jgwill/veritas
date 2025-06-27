// Advanced Event-Driven Architecture for TandT Application
// Inspired by legacy TandTEventManager patterns

import type { DigitalModel, BaseDigitalElement } from "@/lib/types"
import { DigitalThinkingModelType } from "@/lib/constants"

// Event Argument Types
export interface ModelEventArgs {
  model: DigitalModel
  sender?: string
  timestamp: Date
}

export interface ElementEventArgs {
  element: BaseDigitalElement
  model: DigitalModel
  sender?: string
  timestamp: Date
}

export interface ModeEventArgs {
  mode: ModelViewMode
  previousMode?: ModelViewMode
  modelId: string
  sender?: string
  timestamp: Date
}

export interface ValidationEventArgs {
  modelId: string
  isValid: boolean
  issues: ValidationIssue[]
  sender?: string
  timestamp: Date
}

export interface ProgressEventArgs {
  modelId: string
  progress: ModelProgress
  sender?: string
  timestamp: Date
}

// Supporting Types
export type ModelViewMode = "editing" | "analyzing" | "structuring" | "unset"

export interface ValidationIssue {
  type: "error" | "warning" | "info"
  code: string
  message: string
  elementId?: string
  severity: number
}

export interface ModelProgress {
  totalElements: number
  evaluatedElements: number
  evaluationProgress: number
  comparisonProgress?: number // For Decision Making models
  performanceProgress?: number // For Performance Review models
  isComplete: boolean
}

// Event Handler Type Definitions
export type ModelEventHandler = (args: ModelEventArgs) => void
export type ElementEventHandler = (args: ElementEventArgs) => void
export type ModeEventHandler = (args: ModeEventArgs) => void
export type ValidationEventHandler = (args: ValidationEventArgs) => void
export type ProgressEventHandler = (args: ProgressEventArgs) => void

// Global Event Manager Class
export class TandTEventManager {
  private static _instance: TandTEventManager | null = null

  // Event Collections
  private modelListeners = new Map<string, Set<ModelEventHandler>>()
  private elementListeners = new Map<string, Set<ElementEventHandler>>()
  private modeListeners = new Map<string, Set<ModeEventHandler>>()
  private validationListeners = new Map<string, Set<ValidationEventHandler>>()
  private progressListeners = new Map<string, Set<ProgressEventHandler>>()

  // Global Flags
  private refreshingModels = false
  private currentMode: ModelViewMode = "unset"
  private activeModelId: string | null = null

  // New Subscription and Event Management
  private subscriptions: Map<string, EventSubscription[]> = new Map()
  private eventHistory: ModelEvent[] = []
  private maxHistorySize = 1000

  // Singleton Pattern
  public static getInstance(): TandTEventManager {
    if (!TandTEventManager._instance) {
      TandTEventManager._instance = new TandTEventManager()
    }
    return TandTEventManager._instance
  }

  private constructor() {
    // Private constructor for singleton
  }

  // Global State Management
  public get isRefreshingModels(): boolean {
    return this.refreshingModels
  }

  public get getCurrentMode(): ModelViewMode {
    return this.currentMode
  }

  public get getActiveModelId(): string | null {
    return this.activeModelId
  }

  // Model Events
  public subscribeToModelEvents(eventType: string, handler: ModelEventHandler): void {
    if (!this.modelListeners.has(eventType)) {
      this.modelListeners.set(eventType, new Set())
    }
    this.modelListeners.get(eventType)!.add(handler)
  }

  public unsubscribeFromModelEvents(eventType: string, handler: ModelEventHandler): void {
    const handlers = this.modelListeners.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  public fireModelEvent(eventType: string, args: ModelEventArgs): void {
    const handlers = this.modelListeners.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(args)
        } catch (error) {
          console.error(`Error in model event handler for ${eventType}:`, error)
        }
      })
    }
  }

  // Element Events
  public subscribeToElementEvents(eventType: string, handler: ElementEventHandler): void {
    if (!this.elementListeners.has(eventType)) {
      this.elementListeners.set(eventType, new Set())
    }
    this.elementListeners.get(eventType)!.add(handler)
  }

  public unsubscribeFromElementEvents(eventType: string, handler: ElementEventHandler): void {
    const handlers = this.elementListeners.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  public fireElementEvent(eventType: string, args: ElementEventArgs): void {
    const handlers = this.elementListeners.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(args)
        } catch (error) {
          console.error(`Error in element event handler for ${eventType}:`, error)
        }
      })
    }
  }

  // Mode Events
  public subscribeToModeEvents(eventType: string, handler: ModeEventHandler): void {
    if (!this.modeListeners.has(eventType)) {
      this.modeListeners.set(eventType, new Set())
    }
    this.modeListeners.get(eventType)!.add(handler)
  }

  public unsubscribeFromModeEvents(eventType: string, handler: ModeEventHandler): void {
    const handlers = this.modeListeners.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  public fireModeEvent(eventType: string, args: ModeEventArgs): void {
    const handlers = this.modeListeners.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(args)
        } catch (error) {
          console.error(`Error in mode event handler for ${eventType}:`, error)
        }
      })
    }
  }

  // High-Level Event Dispatchers
  public fireEditModelAction(model: DigitalModel, sender?: string): void {
    this.activeModelId = model.id
    this.fireModelEvent("editModelAction", {
      model,
      sender,
      timestamp: new Date(),
    })
  }

  public fireModelListUpdated(models: DigitalModel[], sender?: string): void {
    this.fireModelEvent("modelListUpdated", {
      model: models[0], // For compatibility, though this is really a list event
      sender,
      timestamp: new Date(),
    })
  }

  public fireClosingModelAction(model: DigitalModel, sender?: string): void {
    if (this.activeModelId === model.id) {
      this.activeModelId = null
    }
    this.fireModelEvent("closingModelAction", {
      model,
      sender,
      timestamp: new Date(),
    })
  }

  public fireModelTypeChanged(modelType: DigitalThinkingModelType, modelId: string, sender?: string): void {
    this.fireModelEvent("modelTypeChanged", {
      model: { digitalThinkingModelType: modelType, id: modelId } as Partial<DigitalModel>,
      sender,
      timestamp: new Date(),
    } as ModelEventArgs)
  }

  public fireEditModeChanged(mode: ModelViewMode, modelId: string, sender?: string): void {
    const previousMode = this.currentMode
    this.currentMode = mode

    this.fireModeEvent("editModeChanged", {
      mode,
      previousMode,
      modelId,
      sender,
      timestamp: new Date(),
    })
  }

  public fireElementUpdated(element: BaseDigitalElement, model: DigitalModel, sender?: string): void {
    this.fireElementEvent("elementUpdated", {
      element,
      model,
      sender,
      timestamp: new Date(),
    })
  }

  public fireElementEvaluated(element: BaseDigitalElement, model: DigitalModel, sender?: string): void {
    this.fireElementEvent("elementEvaluated", {
      element,
      model,
      sender,
      timestamp: new Date(),
    })
  }

  public fireModelValidationChanged(
    modelId: string,
    isValid: boolean,
    issues: ValidationIssue[],
    sender?: string,
  ): void {
    const handlers = this.validationListeners.get("validationChanged")
    if (handlers) {
      const args: ValidationEventArgs = {
        modelId,
        isValid,
        issues,
        sender,
        timestamp: new Date(),
      }
      handlers.forEach((handler) => {
        try {
          handler(args)
        } catch (error) {
          console.error("Error in validation event handler:", error)
        }
      })
    }
  }

  public fireProgressUpdated(modelId: string, progress: ModelProgress, sender?: string): void {
    const handlers = this.progressListeners.get("progressUpdated")
    if (handlers) {
      const args: ProgressEventArgs = {
        modelId,
        progress,
        sender,
        timestamp: new Date(),
      }
      handlers.forEach((handler) => {
        try {
          handler(args)
        } catch (error) {
          console.error("Error in progress event handler:", error)
        }
      })
    }
  }

  // Model Refreshing State Management
  public startModelRefresh(): void {
    this.refreshingModels = true
  }

  public endModelRefresh(): void {
    this.refreshingModels = false
  }

  // Cleanup
  public dispose(): void {
    this.modelListeners.clear()
    this.elementListeners.clear()
    this.modeListeners.clear()
    this.validationListeners.clear()
    this.progressListeners.clear()
    this.activeModelId = null
    this.currentMode = "unset"
  }

  // New Subscription Methods
  public subscribe(eventType: ModelEventType | "ALL", callback: (event: ModelEvent) => void): string {
    const subscriptionId = crypto.randomUUID()
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      callback,
    }

    const key = eventType
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, [])
    }
    this.subscriptions.get(key)!.push(subscription)

    return subscriptionId
  }

  public unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex((sub) => sub.id === subscriptionId)
      if (index !== -1) {
        subscriptions.splice(index, 1)
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType)
        }
        return true
      }
    }
    return false
  }

  // New Event Emission Method
  public emit(event: ModelEvent): void {
    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Notify specific event type subscribers
    const specificSubscribers = this.subscriptions.get(event.type) || []
    const allSubscribers = this.subscriptions.get("ALL") || []

    const allCallbacks = [...specificSubscribers, ...allSubscribers]

    allCallbacks.forEach((subscription) => {
      try {
        subscription.callback(event)
      } catch (error) {
        console.error("Error in event callback:", error)
      }
    })
  }

  // New Event History Methods
  public getModelHistory(modelId: string): ModelEvent[] {
    return this.eventHistory.filter((event) => event.modelId === modelId)
  }

  public getRecentEvents(limit = 50): ModelEvent[] {
    return this.eventHistory.slice(-limit)
  }

  public clearHistory(): void {
    this.eventHistory = []
  }

  public getSubscriptionCount(): number {
    let count = 0
    for (const subscriptions of this.subscriptions.values()) {
      count += subscriptions.length
    }
    return count
  }
}

// Global Instance Export
export const tandtEventManager = TandTEventManager.getInstance()

// Event Type Constants
export const MODEL_EVENTS = {
  EDIT_MODEL_ACTION: "editModelAction",
  MODEL_LIST_UPDATED: "modelListUpdated",
  CLOSING_MODEL_ACTION: "closingModelAction",
  MODEL_TYPE_CHANGED: "modelTypeChanged",
  MODEL_SAVED: "modelSaved",
  MODEL_CREATED: "MODEL_CREATED",
  MODEL_UPDATED: "MODEL_UPDATED",
  MODEL_DELETED: "MODEL_DELETED",
  MODEL_OPENED: "MODEL_OPENED",
  MODEL_CLOSED: "MODEL_CLOSED",
  MODE_CHANGED: "MODE_CHANGED",
  ELEMENT_ADDED: "ELEMENT_ADDED",
  ELEMENT_DELETED: "ELEMENT_DELETED",
  ELEMENT_EVALUATED: "ELEMENT_EVALUATED",
  COMPARISON_MADE: "COMPARISON_MADE",
  CALCULATION_COMPLETED: "CALCULATION_COMPLETED",
} as const

export const ELEMENT_EVENTS = {
  ELEMENT_UPDATED: "elementUpdated",
  ELEMENT_EVALUATED: "elementEvaluated",
  ELEMENT_CREATED: "ELEMENT_ADDED",
  ELEMENT_DELETED: "ELEMENT_DELETED",
  COMPARISON_COMPLETED: "COMPARISON_MADE",
} as const

export const MODE_EVENTS = {
  EDIT_MODE_CHANGED: "editModeChanged",
  VIEW_MODE_SWITCHED: "viewModeSwitched",
  MODE_CHANGED: "MODE_CHANGED",
} as const

export const VALIDATION_EVENTS = {
  VALIDATION_CHANGED: "validationChanged",
  CONSISTENCY_CHECK: "consistencyCheck",
} as const

export const PROGRESS_EVENTS = {
  PROGRESS_UPDATED: "progressUpdated",
  EVALUATION_COMPLETE: "evaluationComplete",
} as const

// New Event Types
export type ModelEventType =
  | "MODEL_CREATED"
  | "MODEL_UPDATED"
  | "MODEL_DELETED"
  | "MODEL_OPENED"
  | "MODEL_CLOSED"
  | "MODE_CHANGED"
  | "ELEMENT_ADDED"
  | "ELEMENT_UPDATED"
  | "ELEMENT_DELETED"
  | "ELEMENT_EVALUATED"
  | "COMPARISON_MADE"
  | "CALCULATION_COMPLETED"

export interface ModelEvent {
  type: ModelEventType
  modelId: string
  timestamp: string
  data?: any
  userId?: string
}

export interface EventSubscription {
  id: string
  eventType: ModelEventType | "ALL"
  callback: (event: ModelEvent) => void
}

// Helper functions for common events
export const ModelEvents = {
  modelCreated: (modelId: string, data?: any): ModelEvent => ({
    type: "MODEL_CREATED",
    modelId,
    timestamp: new Date().toISOString(),
    data,
  }),

  modelUpdated: (modelId: string, data?: any): ModelEvent => ({
    type: "MODEL_UPDATED",
    modelId,
    timestamp: new Date().toISOString(),
    data,
  }),

  modelDeleted: (modelId: string): ModelEvent => ({
    type: "MODEL_DELETED",
    modelId,
    timestamp: new Date().toISOString(),
  }),

  modelOpened: (modelId: string): ModelEvent => ({
    type: "MODEL_OPENED",
    modelId,
    timestamp: new Date().toISOString(),
  }),

  modelClosed: (modelId: string): ModelEvent => ({
    type: "MODEL_CLOSED",
    modelId,
    timestamp: new Date().toISOString(),
  }),

  modeChanged: (modelId: string, mode: string): ModelEvent => ({
    type: "MODE_CHANGED",
    modelId,
    timestamp: new Date().toISOString(),
    data: { mode },
  }),

  elementEvaluated: (modelId: string, elementId: string, evaluation: any): ModelEvent => ({
    type: "ELEMENT_EVALUATED",
    modelId,
    timestamp: new Date().toISOString(),
    data: { elementId, evaluation },
  }),

  comparisonMade: (modelId: string, element1Id: string, element2Id: string, decision: string): ModelEvent => ({
    type: "COMPARISON_MADE",
    modelId,
    timestamp: new Date().toISOString(),
    data: { element1Id, element2Id, decision },
  }),
}
