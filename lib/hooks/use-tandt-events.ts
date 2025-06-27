"use client"

// React Integration Hook for TandT Event Management System
// Provides clean React patterns for the sophisticated event architecture

import { useEffect, useCallback, useRef, useState } from 'react'
import {
  tandtEventManager,
  ModelEventArgs,
  ElementEventArgs,
  ModeEventArgs,
  ValidationEventArgs,
  ProgressEventArgs,
  ModelEventHandler,
  ElementEventHandler,
  ModeEventHandler,
  ValidationEventHandler,
  ProgressEventHandler,
  MODEL_EVENTS,
  ELEMENT_EVENTS,
  MODE_EVENTS,
  VALIDATION_EVENTS,
  PROGRESS_EVENTS,
  ModelViewMode,
  ValidationIssue,
  ModelProgress
} from '@/lib/events/model-events'
import { DigitalModel, BaseDigitalElement } from '@/lib/types'

// Hook for Model Events
export function useModelEvents() {
  const [activeModelId, setActiveModelId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const subscribeToEvent = useCallback((eventType: string, handler: ModelEventHandler) => {
    tandtEventManager.subscribeToModelEvents(eventType, handler)
    return () => tandtEventManager.unsubscribeFromModelEvents(eventType, handler)
  }, [])

  const fireEditModelAction = useCallback((model: DigitalModel, sender?: string) => {
    tandtEventManager.fireEditModelAction(model, sender)
  }, [])

  const fireModelListUpdated = useCallback((models: DigitalModel[], sender?: string) => {
    tandtEventManager.fireModelListUpdated(models, sender)
  }, [])

  const fireClosingModelAction = useCallback((model: DigitalModel, sender?: string) => {
    tandtEventManager.fireClosingModelAction(model, sender)
  }, [])

  // Subscribe to global state changes
  useEffect(() => {
    const handleEditAction = (args: ModelEventArgs) => {
      setActiveModelId(args.model.id)
    }

    const handleCloseAction = (args: ModelEventArgs) => {
      if (activeModelId === args.model.id) {
        setActiveModelId(null)
      }
    }

    const unsubscribeEdit = subscribeToEvent(MODEL_EVENTS.EDIT_MODEL_ACTION, handleEditAction)
    const unsubscribeClose = subscribeToEvent(MODEL_EVENTS.CLOSING_MODEL_ACTION, handleCloseAction)

    return () => {
      unsubscribeEdit()
      unsubscribeClose()
    }
  }, [subscribeToEvent, activeModelId])

  // Track refreshing state
  useEffect(() => {
    const checkRefreshing = () => {
      setIsRefreshing(tandtEventManager.isRefreshingModels)
    }

    const interval = setInterval(checkRefreshing, 100)
    return () => clearInterval(interval)
  }, [])

  return {
    activeModelId,
    isRefreshing,
    subscribeToEvent,
    fireEditModelAction,
    fireModelListUpdated,
    fireClosingModelAction,
    startRefresh: () => tandtEventManager.startModelRefresh(),
    endRefresh: () => tandtEventManager.endModelRefresh()
  }
}

// Hook for Element Events
export function useElementEvents(modelId?: string) {
  const [lastUpdatedElement, setLastUpdatedElement] = useState<BaseDigitalElement | null>(null)
  const [lastEvaluatedElement, setLastEvaluatedElement] = useState<BaseDigitalElement | null>(null)

  const subscribeToEvent = useCallback((eventType: string, handler: ElementEventHandler) => {
    tandtEventManager.subscribeToElementEvents(eventType, handler)
    return () => tandtEventManager.unsubscribeFromElementEvents(eventType, handler)
  }, [])

  const fireElementUpdated = useCallback((element: BaseDigitalElement, model: DigitalModel, sender?: string) => {
    tandtEventManager.fireElementUpdated(element, model, sender)
  }, [])

  const fireElementEvaluated = useCallback((element: BaseDigitalElement, model: DigitalModel, sender?: string) => {
    tandtEventManager.fireElementEvaluated(element, model, sender)
  }, [])

  useEffect(() => {
    const handleElementUpdated = (args: ElementEventArgs) => {
      if (!modelId || args.model.id === modelId) {
        setLastUpdatedElement(args.element)
      }
    }

    const handleElementEvaluated = (args: ElementEventArgs) => {
      if (!modelId || args.model.id === modelId) {
        setLastEvaluatedElement(args.element)
      }
    }

    const unsubscribeUpdated = subscribeToEvent(ELEMENT_EVENTS.ELEMENT_UPDATED, handleElementUpdated)
    const unsubscribeEvaluated = subscribeToEvent(ELEMENT_EVENTS.ELEMENT_EVALUATED, handleElementEvaluated)

    return () => {
      unsubscribeUpdated()
      unsubscribeEvaluated()
    }
  }, [subscribeToEvent, modelId])

  return {
    lastUpdatedElement,
    lastEvaluatedElement,
    subscribeToEvent,
    fireElementUpdated,
    fireElementEvaluated
  }
}

// Hook for Mode Events
export function useModeEvents(modelId?: string) {
  const [currentMode, setCurrentMode] = useState<ModelViewMode>('unset')
  const [previousMode, setPreviousMode] = useState<ModelViewMode | undefined>()

  const subscribeToEvent = useCallback((eventType: string, handler: ModeEventHandler) => {
    tandtEventManager.subscribeToModeEvents(eventType, handler)
    return () => tandtEventManager.unsubscribeFromModeEvents(eventType, handler)
  }, [])

  const fireEditModeChanged = useCallback((mode: ModelViewMode, targetModelId: string, sender?: string) => {
    tandtEventManager.fireEditModeChanged(mode, targetModelId, sender)
  }, [])

  useEffect(() => {
    const handleModeChanged = (args: ModeEventArgs) => {
      if (!modelId || args.modelId === modelId) {
        setCurrentMode(args.mode)
        setPreviousMode(args.previousMode)
      }
    }

    const unsubscribe = subscribeToEvent(MODE_EVENTS.EDIT_MODE_CHANGED, handleModeChanged)

    // Initialize with global state
    setCurrentMode(tandtEventManager.getCurrentMode)

    return unsubscribe
  }, [subscribeToEvent, modelId])

  return {
    currentMode,
    previousMode,
    subscribeToEvent,
    fireEditModeChanged
  }
}

// Hook for Validation Events
export function useValidationEvents(modelId?: string) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean
    issues: ValidationIssue[]
  }>({ isValid: true, issues: [] })

  const subscribeToEvent = useCallback((eventType: string, handler: ValidationEventHandler) => {
    tandtEventManager.subscribeToModelEvents(eventType, handler as any)
    return () => tandtEventManager.unsubscribeFromModelEvents(eventType, handler as any)
  }, [])

  const fireValidationChanged = useCallback((
    targetModelId: string, 
    isValid: boolean, 
    issues: ValidationIssue[], 
    sender?: string
  ) => {
    tandtEventManager.fireModelValidationChanged(targetModelId, isValid, issues, sender)
  }, [])

  useEffect(() => {
    const handleValidationChanged = (args: ValidationEventArgs) => {
      if (!modelId || args.modelId === modelId) {
        setValidationState({
          isValid: args.isValid,
          issues: args.issues
        })
      }
    }

    const unsubscribe = subscribeToEvent(VALIDATION_EVENTS.VALIDATION_CHANGED, handleValidationChanged as any)

    return unsubscribe
  }, [subscribeToEvent, modelId])

  return {
    isValid: validationState.isValid,
    issues: validationState.issues,
    subscribeToEvent,
    fireValidationChanged
  }
}

// Hook for Progress Events
export function useProgressEvents(modelId?: string) {
  const [progress, setProgress] = useState<ModelProgress | null>(null)

  const subscribeToEvent = useCallback((eventType: string, handler: ProgressEventHandler) => {
    tandtEventManager.subscribeToModelEvents(eventType, handler as any)
    return () => tandtEventManager.unsubscribeFromModelEvents(eventType, handler as any)
  }, [])

  const fireProgressUpdated = useCallback((
    targetModelId: string, 
    progressData: ModelProgress, 
    sender?: string
  ) => {
    tandtEventManager.fireProgressUpdated(targetModelId, progressData, sender)
  }, [])

  useEffect(() => {
    const handleProgressUpdated = (args: ProgressEventArgs) => {
      if (!modelId || args.modelId === modelId) {
        setProgress(args.progress)
      }
    }

    const unsubscribe = subscribeToEvent(PROGRESS_EVENTS.PROGRESS_UPDATED, handleProgressUpdated as any)

    return unsubscribe
  }, [subscribeToEvent, modelId])

  return {
    progress,
    subscribeToEvent,
    fireProgressUpdated
  }
}

// Comprehensive Hook - Combines All Event Types
export function useTandTEvents(modelId?: string) {
  const modelEvents = useModelEvents()
  const elementEvents = useElementEvents(modelId)
  const modeEvents = useModeEvents(modelId)
  const validationEvents = useValidationEvents(modelId)
  const progressEvents = useProgressEvents(modelId)

  // Cross-event derived state
  const isModelActive = modelEvents.activeModelId === modelId
  const canAnalyze = modeEvents.currentMode === 'analyzing'
  const canEdit = modeEvents.currentMode === 'editing'

  return {
    // Individual event hooks
    model: modelEvents,
    element: elementEvents,
    mode: modeEvents,
    validation: validationEvents,
    progress: progressEvents,

    // Derived state
    isModelActive,
    canAnalyze,
    canEdit,

    // Global utilities
    eventManager: tandtEventManager
  }
}

// Hook for Custom Event Subscription with Cleanup
export function useCustomTandTEvent<T>(
  eventType: string,
  handler: (args: T) => void,
  dependencies: any[] = []
) {
  const handlerRef = useRef(handler)
  
  // Update handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = handler
  }, dependencies)

  useEffect(() => {
    const wrappedHandler = (args: T) => {
      handlerRef.current(args)
    }

    // Generic subscription - assumes model events for simplicity
    tandtEventManager.subscribeToModelEvents(eventType, wrappedHandler as any)

    return () => {
      tandtEventManager.unsubscribeFromModelEvents(eventType, wrappedHandler as any)
    }
  }, [eventType])
}

// Development Utilities
export function useTandTEventLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const logEvent = (eventType: string) => (args: any) => {
      console.group(`🔄 TandT Event: ${eventType}`)
      console.log('Event Args:', args)
      console.log('Timestamp:', new Date().toLocaleTimeString())
      console.groupEnd()
    }

    // Subscribe to all major events for development logging
    const unsubscribers = [
      tandtEventManager.subscribeToModelEvents(MODEL_EVENTS.EDIT_MODEL_ACTION, logEvent('EDIT_MODEL')),
      tandtEventManager.subscribeToModeEvents(MODE_EVENTS.EDIT_MODE_CHANGED, logEvent('MODE_CHANGED')),
      tandtEventManager.subscribeToElementEvents(ELEMENT_EVENTS.ELEMENT_EVALUATED, logEvent('ELEMENT_EVALUATED'))
    ]

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [])
} 