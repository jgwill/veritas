// Advanced Event-Driven Architecture for TandT Application
// Inspired by legacy TandTEventManager patterns

import { DigitalModel, BaseDigitalElement, DigitalThinkingModelType } from '@/lib/types'

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
export type ModelViewMode = 'editing' | 'analyzing' | 'structuring' | 'unset'

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
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
  private currentMode: ModelViewMode = 'unset'
  private activeModelId: string | null = null

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
      handlers.forEach(handler => {
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
      handlers.forEach(handler => {
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
      handlers.forEach(handler => {
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
    this.fireModelEvent('editModelAction', {
      model,
      sender,
      timestamp: new Date()
    })
  }

  public fireModelListUpdated(models: DigitalModel[], sender?: string): void {
    this.fireModelEvent('modelListUpdated', {
      model: models[0], // For compatibility, though this is really a list event
      sender,
      timestamp: new Date()
    })
  }

  public fireClosingModelAction(model: DigitalModel, sender?: string): void {
    if (this.activeModelId === model.id) {
      this.activeModelId = null
    }
    this.fireModelEvent('closingModelAction', {
      model,
      sender,
      timestamp: new Date()
    })
  }

  public fireModelTypeChanged(modelType: DigitalThinkingModelType, modelId: string, sender?: string): void {
    this.fireModelEvent('modelTypeChanged', {
      model: { digitalThinkingModelType: modelType, id: modelId } as Partial<DigitalModel>,
      sender,
      timestamp: new Date()
    } as ModelEventArgs)
  }

  public fireEditModeChanged(mode: ModelViewMode, modelId: string, sender?: string): void {
    const previousMode = this.currentMode
    this.currentMode = mode
    
    this.fireModeEvent('editModeChanged', {
      mode,
      previousMode,
      modelId,
      sender,
      timestamp: new Date()
    })
  }

  public fireElementUpdated(element: BaseDigitalElement, model: DigitalModel, sender?: string): void {
    this.fireElementEvent('elementUpdated', {
      element,
      model,
      sender,
      timestamp: new Date()
    })
  }

  public fireElementEvaluated(element: BaseDigitalElement, model: DigitalModel, sender?: string): void {
    this.fireElementEvent('elementEvaluated', {
      element,
      model,
      sender,
      timestamp: new Date()
    })
  }

  public fireModelValidationChanged(modelId: string, isValid: boolean, issues: ValidationIssue[], sender?: string): void {
    const handlers = this.validationListeners.get('validationChanged')
    if (handlers) {
      const args: ValidationEventArgs = {
        modelId,
        isValid,
        issues,
        sender,
        timestamp: new Date()
      }
      handlers.forEach(handler => {
        try {
          handler(args)
        } catch (error) {
          console.error('Error in validation event handler:', error)
        }
      })
    }
  }

  public fireProgressUpdated(modelId: string, progress: ModelProgress, sender?: string): void {
    const handlers = this.progressListeners.get('progressUpdated')
    if (handlers) {
      const args: ProgressEventArgs = {
        modelId,
        progress,
        sender,
        timestamp: new Date()
      }
      handlers.forEach(handler => {
        try {
          handler(args)
        } catch (error) {
          console.error('Error in progress event handler:', error)
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
    this.currentMode = 'unset'
  }
}

// Global Instance Export
export const tandtEventManager = TandTEventManager.getInstance()

// Event Type Constants
export const MODEL_EVENTS = {
  EDIT_MODEL_ACTION: 'editModelAction',
  MODEL_LIST_UPDATED: 'modelListUpdated',
  CLOSING_MODEL_ACTION: 'closingModelAction',
  MODEL_TYPE_CHANGED: 'modelTypeChanged',
  MODEL_SAVED: 'modelSaved',
  MODEL_CREATED: 'modelCreated',
  MODEL_DELETED: 'modelDeleted'
} as const

export const ELEMENT_EVENTS = {
  ELEMENT_UPDATED: 'elementUpdated',
  ELEMENT_EVALUATED: 'elementEvaluated',
  ELEMENT_CREATED: 'elementCreated',
  ELEMENT_DELETED: 'elementDeleted',
  COMPARISON_COMPLETED: 'comparisonCompleted'
} as const

export const MODE_EVENTS = {
  EDIT_MODE_CHANGED: 'editModeChanged',
  VIEW_MODE_SWITCHED: 'viewModeSwitched'
} as const

export const VALIDATION_EVENTS = {
  VALIDATION_CHANGED: 'validationChanged',
  CONSISTENCY_CHECK: 'consistencyCheck'
} as const

export const PROGRESS_EVENTS = {
  PROGRESS_UPDATED: 'progressUpdated',
  EVALUATION_COMPLETE: 'evaluationComplete'
} as const 