"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Crown,
  Timer
} from 'lucide-react'
import {
  DigitalModel,
  DecisionMakingModel,
  PerformanceReviewModel,
  DecisionMakingElement,
  PerformanceReviewElement,
  DigitalThinkingModelType,
  PerformanceTrend,
  PriorityLevel,
  isDecisionMakingModel,
  isPerformanceReviewModel
} from '@/lib/types'

interface EnhancedAnalyzingGridProps {
  model: DigitalModel
  onModelUpdate: (model: DigitalModel) => void
}

export default function EnhancedAnalyzingGrid({ model, onModelUpdate }: EnhancedAnalyzingGridProps) {
  
  const handleAcceptabilityEvaluation = async (elementId: string, isAcceptable: boolean) => {
    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationType: 'acceptability',
          value: isAcceptable
        })
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      }
    } catch (error) {
      console.error('Error evaluating acceptability:', error)
    }
  }

  const handlePerformanceEvaluation = async (elementId: string, trend: PerformanceTrend) => {
    if (!isPerformanceReviewModel(model)) return

    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationType: 'performance',
          value: trend
        })
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      }
    } catch (error) {
      console.error('Error evaluating performance:', error)
    }
  }

  const getEvaluationProgress = () => {
    const totalElements = model.model.length
    const acceptabilityEvaluated = model.model.filter(e => e.twoFlagAnswered).length
    
    if (isPerformanceReviewModel(model)) {
      const performanceEvaluated = model.model.filter(e => e.threeFlagAnswered).length
      return {
        acceptabilityProgress: totalElements > 0 ? (acceptabilityEvaluated / totalElements) * 100 : 0,
        performanceProgress: totalElements > 0 ? (performanceEvaluated / totalElements) * 100 : 0,
        overallProgress: totalElements > 0 ? (Math.min(acceptabilityEvaluated, performanceEvaluated) / totalElements) * 100 : 0
      }
    } else {
      return {
        acceptabilityProgress: totalElements > 0 ? (acceptabilityEvaluated / totalElements) * 100 : 0,
        overallProgress: totalElements > 0 ? (acceptabilityEvaluated / totalElements) * 100 : 0
      }
    }
  }

  const progress = getEvaluationProgress()

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analyzing Mode</h3>
            <p className="text-sm text-gray-600">
              {isDecisionMakingModel(model) 
                ? "Evaluate each element's acceptability to make your decision"
                : "Assess current acceptability and performance trends"
              }
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {isDecisionMakingModel(model) ? "Decision Making" : "Performance Review"}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Acceptability Evaluation</span>
              <span>{Math.round(progress.acceptabilityProgress)}%</span>
            </div>
            <Progress value={progress.acceptabilityProgress} className="h-2" />
          </div>
          
          {isPerformanceReviewModel(model) && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Performance Trend Assessment</span>
                <span>{Math.round(progress.performanceProgress)}%</span>
              </div>
              <Progress value={progress.performanceProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {model.model.map((element) => (
          <ElementAnalysisCard
            key={element.idug}
            element={element}
            modelType={model.digitalThinkingModelType}
            onAcceptabilityEvaluation={handleAcceptabilityEvaluation}
            onPerformanceEvaluation={handlePerformanceEvaluation}
          />
        ))}
      </div>

      {/* Summary Panel */}
      {progress.overallProgress > 0 && (
        <AnalysisSummary model={model} />
      )}
    </div>
  )
}

interface ElementAnalysisCardProps {
  element: DecisionMakingElement | PerformanceReviewElement
  modelType: DigitalThinkingModelType
  onAcceptabilityEvaluation: (elementId: string, isAcceptable: boolean) => void
  onPerformanceEvaluation: (elementId: string, trend: PerformanceTrend) => void
}

function ElementAnalysisCard({ 
  element, 
  modelType, 
  onAcceptabilityEvaluation, 
  onPerformanceEvaluation 
}: ElementAnalysisCardProps) {
  const isDecisionMaking = modelType === DigitalThinkingModelType.DECISION_MAKING
  const isPerformanceReview = modelType === DigitalThinkingModelType.PERFORMANCE_REVIEW

  return (
    <Card className="relative overflow-hidden">
      {isDecisionMaking && (element as DecisionMakingElement).dominantElementItIS && (
        <div className="absolute top-2 right-2">
          <Crown className="h-4 w-4 text-yellow-500" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium leading-tight">
              {element.displayName}
            </CardTitle>
            {element.description && (
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {element.description}
              </CardDescription>
            )}
          </div>
        </div>
        
        {isDecisionMaking && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Dominance: {(element as DecisionMakingElement).dominanceFactor}</span>
            {(element as DecisionMakingElement).dominantElementItIS && (
              <Badge variant="secondary" className="text-xs">Dominant</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Acceptability Evaluation */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">
            Acceptability in Current Reality
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={element.twoFlagAnswered && element.twoFlag ? "default" : "outline"}
              onClick={() => onAcceptabilityEvaluation(element.idug, true)}
              className="flex-1 text-xs"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Acceptable
            </Button>
            <Button
              size="sm"
              variant={element.twoFlagAnswered && !element.twoFlag ? "destructive" : "outline"}
              onClick={() => onAcceptabilityEvaluation(element.idug, false)}
              className="flex-1 text-xs"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Unacceptable
            </Button>
          </div>
        </div>

        {/* Performance Trend Evaluation (Performance Review only) */}
        {isPerformanceReview && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">
              Performance Trend
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant={element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_BETTER ? "default" : "outline"}
                onClick={() => onPerformanceEvaluation(element.idug, PerformanceTrend.GETTING_BETTER)}
                className="text-xs p-2"
              >
                <TrendingUp className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={element.threeFlagAnswered && element.threeFlag === PerformanceTrend.STAY_SAME ? "secondary" : "outline"}
                onClick={() => onPerformanceEvaluation(element.idug, PerformanceTrend.STAY_SAME)}
                className="text-xs p-2"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_WORSE ? "destructive" : "outline"}
                onClick={() => onPerformanceEvaluation(element.idug, PerformanceTrend.GETTING_WORSE)}
                className="text-xs p-2"
              >
                <TrendingDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-center text-gray-500 mt-1">
              Better • Same • Worse
            </div>
          </div>
        )}

        {/* Priority Indicator (Performance Review only) */}
        {isPerformanceReview && element.twoFlagAnswered && element.threeFlagAnswered && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Priority:</span>
            <PriorityBadge 
              priority={(element as PerformanceReviewElement).priorityLevel} 
              requiresAction={(element as PerformanceReviewElement).improvementRequired}
            />
          </div>
        )}

        {/* Evaluation Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {element.twoFlagAnswered ? "Evaluated" : "Pending"}
            {isPerformanceReview && element.threeFlagAnswered && " • Trend Set"}
          </span>
          {element.status === 3 && (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PriorityBadge({ priority, requiresAction }: { priority?: PriorityLevel, requiresAction?: boolean }) {
  if (!priority) return null

  const variants = {
    [PriorityLevel.HIGH]: "destructive",
    [PriorityLevel.MEDIUM]: "secondary", 
    [PriorityLevel.LOW]: "outline"
  } as const

  return (
    <div className="flex items-center gap-1">
      <Badge variant={variants[priority]} className="text-xs">
        {priority}
      </Badge>
      {requiresAction && (
        <AlertTriangle className="h-3 w-3 text-orange-500" />
      )}
    </div>
  )
}

function AnalysisSummary({ model }: { model: DigitalModel }) {
  if (isDecisionMakingModel(model)) {
    return <DecisionMakingSummary model={model} />
  } else if (isPerformanceReviewModel(model)) {
    return <PerformanceReviewSummary model={model} />
  }
  return null
}

function DecisionMakingSummary({ model }: { model: DecisionMakingModel }) {
  const acceptableElements = model.model.filter(e => e.twoFlagAnswered && e.twoFlag)
  const unacceptableElements = model.model.filter(e => e.twoFlagAnswered && !e.twoFlag)
  const mandatoryElements = acceptableElements.filter(e => e.dominanceFactor > 0)
  const hasUnacceptableMandatory = model.model.some(e => e.dominantElementItIS && e.twoFlagAnswered && !e.twoFlag)
  
  const decision = hasUnacceptableMandatory ? 'NO' : 'YES'
  
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-lg">Decision Analysis Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{acceptableElements.length}</div>
            <div className="text-gray-600">Acceptable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{unacceptableElements.length}</div>
            <div className="text-gray-600">Unacceptable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mandatoryElements.length}</div>
            <div className="text-gray-600">Mandatory</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${decision === 'YES' ? 'text-green-600' : 'text-red-600'}`}>
              {decision}
            </div>
            <div className="text-gray-600">Decision</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceReviewSummary({ model }: { model: PerformanceReviewModel }) {
  const evaluatedElements = model.model.filter(e => e.twoFlagAnswered && e.threeFlagAnswered)
  const improvingElements = evaluatedElements.filter(e => e.threeFlag === PerformanceTrend.GETTING_BETTER)
  const decliningElements = evaluatedElements.filter(e => e.threeFlag === PerformanceTrend.GETTING_WORSE)
  const highPriorityElements = evaluatedElements.filter(e => e.priorityLevel === PriorityLevel.HIGH)
  
  const overallScore = evaluatedElements.length > 0 
    ? (evaluatedElements.filter(e => e.twoFlag).length / evaluatedElements.length) * 100 
    : 0

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg">Performance Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(overallScore)}%</div>
            <div className="text-gray-600">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{improvingElements.length}</div>
            <div className="text-gray-600">Improving</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{decliningElements.length}</div>
            <div className="text-gray-600">Declining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{highPriorityElements.length}</div>
            <div className="text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{evaluatedElements.length}</div>
            <div className="text-gray-600">Evaluated</div>
          </div>
        </div>
        
        {highPriorityElements.length > 0 && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Immediate Attention Required
            </div>
            <div className="text-xs text-orange-700">
              {highPriorityElements.map(e => e.displayName).join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
