"use client"

// React Integration Hook for TandT Event Management System
// Provides clean React patterns for the sophisticated event architecture

import { useEffect, useCallback, useRef, useState } from "react"
import { eventManager, type ModelEvent, type ModelEventType } from "../events/model-events"
import type { DigitalModel, BaseDigitalElement } from "../lib/types"

// Hook for Model Events
export function useModelEvents() {
  const [activeModelId, setActiveModelId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const subscribeToEvent = useCallback((eventType: string, handler: (args: any) => void) => {
    return eventManager.subscribe(eventType, handler)
  }, [])

  const fireEditModelAction = useCallback((model: DigitalModel, sender?: string) => {
    eventManager.emit({ type: "EDIT_MODEL_ACTION", model, sender })
  }, [])

  const fireModelListUpdated = useCallback((models: DigitalModel[], sender?: string) => {
    eventManager.emit({ type: "MODEL_LIST_UPDATED", models, sender })
  }, [])

  const fireClosingModelAction = useCallback((model: DigitalModel, sender?: string) => {
    eventManager.emit({ type: "CLOSING_MODEL_ACTION", model, sender })
  }, [])

  // Subscribe to global state changes
  useEffect(() => {
    const handleEditAction = (args: any) => {
      setActiveModelId(args.model.id)
    }

    const handleCloseAction = (args: any) => {
      if (activeModelId === args.model.id) {
        setActiveModelId(null)
      }
    }

    const unsubscribeEdit = subscribeToEvent("EDIT_MODEL_ACTION", handleEditAction)
    const unsubscribeClose = subscribeToEvent("CLOSING_MODEL_ACTION", handleCloseAction)

    return () => {
      if (unsubscribeEdit) unsubscribeEdit()
      if (unsubscribeClose) unsubscribeClose()
    }
  }, [subscribeToEvent, activeModelId])

  // Track refreshing state
  useEffect(() => {
    const checkRefreshing = () => {
      setIsRefreshing(eventManager.isRefreshingModels)
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
    startRefresh: () => eventManager.startModelRefresh(),
    endRefresh: () => eventManager.endModelRefresh(),
  }
}

// Hook for Element Events
export function useElementEvents(modelId?: string) {
  const [lastUpdatedElement, setLastUpdatedElement] = useState<BaseDigitalElement | null>(null)
  const [lastEvaluatedElement, setLastEvaluatedElement] = useState<BaseDigitalElement | null>(null)

  const subscribeToEvent = useCallback((eventType: string, handler: (args: any) => void) => {
    return eventManager.subscribe(eventType, handler)
  }, [])

  const fireElementUpdated = useCallback((element: BaseDigitalElement, model: DigitalModel, sender?: string) => {
    eventManager.emit({ type: "ELEMENT_UPDATED", element, model, sender })
  }, [])

  const fireElementEvaluated = useCallback((element: BaseDigitalElement, model: DigitalModel, sender?: string) => {
    eventManager.emit({ type: "ELEMENT_EVALUATED", element, model, sender })
  }, [])

  useEffect(() => {
    const handleElementUpdated = (args: any) => {
      if (!modelId || args.model.id === modelId) {
        setLastUpdatedElement(args.element)
      }
    }

    const handleElementEvaluated = (args: any) => {
      if (!modelId || args.model.id === modelId) {
        setLastEvaluatedElement(args.element)
      }
    }

    const unsubscribeUpdated = subscribeToEvent("ELEMENT_UPDATED", handleElementUpdated)
    const unsubscribeEvaluated = subscribeToEvent("ELEMENT_EVALUATED", handleElementEvaluated)

    return () => {
      if (unsubscribeUpdated) unsubscribeUpdated()
      if (unsubscribeEvaluated) unsubscribeEvaluated()
    }
  }, [subscribeToEvent, modelId])

  return {
    lastUpdatedElement,
    lastEvaluatedElement,
    subscribeToEvent,
    fireElementUpdated,
    fireElementEvaluated,
  }
}

// Hook for Mode Events
export function useModeEvents(modelId?: string) {
  const [currentMode, setCurrentMode] = useState<string>("unset")
  const [previousMode, setPreviousMode] = useState<string | undefined>()

  const subscribeToEvent = useCallback((eventType: string, handler: (args: any) => void) => {
    return eventManager.subscribe(eventType, handler)
  }, [])

  const fireEditModeChanged = useCallback((mode: string, targetModelId: string, sender?: string) => {
    eventManager.emit({ type: "EDIT_MODE_CHANGED", mode, modelId: targetModelId, sender })
  }, [])

  useEffect(() => {
    const handleModeChanged = (args: any) => {
      if (!modelId || args.modelId === modelId) {
        setCurrentMode(args.mode)
        setPreviousMode(args.previousMode)
      }
    }

    const unsubscribe = subscribeToEvent("EDIT_MODE_CHANGED", handleModeChanged)

    // Initialize with global state
    setCurrentMode(eventManager.getCurrentMode())

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [subscribeToEvent, modelId])

  return {
    currentMode,
    previousMode,
    subscribeToEvent,
    fireEditModeChanged,
  }
}

// Hook for Validation Events
export function useValidationEvents(modelId?: string) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean
    issues: any[]
  }>({ isValid: true, issues: [] })

  const subscribeToEvent = useCallback((eventType: string, handler: (args: any) => void) => {
    return eventManager.subscribe(eventType, handler)
  }, [])

  const fireValidationChanged = useCallback(
    (targetModelId: string, isValid: boolean, issues: any[], sender?: string) => {
      eventManager.emit({ type: "VALIDATION_CHANGED", modelId: targetModelId, isValid, issues, sender })
    },
    [],
  )

  useEffect(() => {
    const handleValidationChanged = (args: any) => {
      if (!modelId || args.modelId === modelId) {
        setValidationState({
          isValid: args.isValid,
          issues: args.issues,
        })
      }
    }

    const unsubscribe = subscribeToEvent("VALIDATION_CHANGED", handleValidationChanged)

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [subscribeToEvent, modelId])

  return {
    isValid: validationState.isValid,
    issues: validationState.issues,
    subscribeToEvent,
    fireValidationChanged,
  }
}

// Hook for Progress Events
export function useProgressEvents(modelId?: string) {
  const [progress, setProgress] = useState<any | null>(null)

  const subscribeToEvent = useCallback((eventType: string, handler: (args: any) => void) => {
    return eventManager.subscribe(eventType, handler)
  }, [])

  const fireProgressUpdated = useCallback((targetModelId: string, progressData: any, sender?: string) => {
    eventManager.emit({ type: "PROGRESS_UPDATED", modelId: targetModelId, progress: progressData, sender })
  }, [])

  useEffect(() => {
    const handleProgressUpdated = (args: any) => {
      if (!modelId || args.modelId === modelId) {
        setProgress(args.progress)
      }
    }

    const unsubscribe = subscribeToEvent("PROGRESS_UPDATED", handleProgressUpdated)

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [subscribeToEvent, modelId])

  return {
    progress,
    subscribeToEvent,
    fireProgressUpdated,
  }
}

// Comprehensive Hook - Combines All Event Types
export function useTandTEvents(
  eventType: ModelEventType | "ALL",
  callback: (event: ModelEvent) => void,
  dependencies: any[] = [],
) {
  const subscriptionIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Subscribe to events
    subscriptionIdRef.current = eventManager.subscribe(eventType, callback)

    // Cleanup subscription on unmount or dependency change
    return () => {
      if (subscriptionIdRef.current) {
        eventManager.unsubscribe(subscriptionIdRef.current)
        subscriptionIdRef.current = null
      }
    }
  }, [eventType, ...dependencies])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionIdRef.current) {
        eventManager.unsubscribe(subscriptionIdRef.current)
      }
    }
  }, [])
}

/**
 * Hook for emitting TandT model events
 */
export function useEmitTandTEvent() {
  return (event: ModelEvent) => {
    eventManager.emit(event)
  }
}

/**
 * Hook for getting model event history
 */
export function useModelHistory(modelId: string) {
  return eventManager.getModelHistory(modelId)
}

/**
 * Hook for getting recent events
 */
export function useRecentEvents(limit = 50) {
  return eventManager.getRecentEvents(limit)
}
