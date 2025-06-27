// Performance Dashboard for Performance Review Models

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  Flag,
  ArrowUp,
  ArrowDown,
  Equal
} from "lucide-react"
import { PerformanceReviewModel, PerformanceReviewElement, PriorityLevel } from "@/lib/types"
import { PerformanceReviewService } from "@/lib/services/performance-review"

interface PerformanceDashboardProps {
  model: PerformanceReviewModel
  onModelUpdate: (updatedModel: PerformanceReviewModel) => void
  readonly?: boolean
}

export default function PerformanceDashboard({ model, onModelUpdate, readonly = false }: PerformanceDashboardProps) {
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'ALL'>('ALL')
  
  const stats = useMemo(() => 
    PerformanceReviewService.getEvaluationStats(model), 
    [model]
  )

  const dashboard = useMemo(() => 
    PerformanceReviewService.generatePerformanceDashboard(model), 
    [model]
  )

  const improvementPlan = useMemo(() => 
    PerformanceReviewService.generateImprovementPlan(model), 
    [model]
  )

  const handleAcceptabilityChange = (elementId: string, isAcceptable: boolean) => {
    const updatedModel = PerformanceReviewService.evaluateElementAcceptability(
      model, 
      elementId, 
      isAcceptable
    )
    onModelUpdate(updatedModel)
  }

  const handlePerformanceChange = (elementId: string, trend: number) => {
    const updatedModel = PerformanceReviewService.evaluateElementPerformance(
      model, 
      elementId, 
      trend
    )
    onModelUpdate(updatedModel)
  }

  const filteredElements = useMemo(() => {
    if (filterPriority === 'ALL') {
      return model.model
    }
    return model.model.filter(element => element.priorityLevel === filterPriority)
  }, [model.model, filterPriority])

  const getTrendIcon = (trend: number) => {
    switch (trend) {
      case 1: return <TrendingUp className="h-4 w-4 text-green-600" />
      case -1: return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendLabel = (trend: number) => {
    switch (trend) {
      case 1: return "Getting Better"
      case -1: return "Getting Worse"  
      default: return "Staying Same"
    }
  }

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.CRITICAL: return "destructive"
      case PriorityLevel.HIGH: return "outline"
      case PriorityLevel.MEDIUM: return "secondary"
      case PriorityLevel.LOW: return "outline"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle>Performance Dashboard</CardTitle>
            </div>
            <Badge variant="outline">
              {stats.performanceEvaluated} / {stats.totalElements} tracked
            </Badge>
          </div>
          <CardDescription>
            Track performance trends and identify improvement priorities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Acceptability Evaluation</span>
                <span>{Math.round(stats.evaluationProgress * 100)}%</span>
              </div>
              <Progress value={stats.evaluationProgress * 100} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Performance Tracking</span>
                <span>{Math.round(stats.performanceProgress * 100)}%</span>
              </div>
              <Progress value={stats.performanceProgress * 100} className="h-2" />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{dashboard.improving}</div>
              <div className="text-xs text-muted-foreground">Improving</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-600">{dashboard.stable}</div>
              <div className="text-xs text-muted-foreground">Stable</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">{dashboard.declining}</div>
              <div className="text-xs text-muted-foreground">Declining</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">{dashboard.criticalItems}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Plan */}
      {improvementPlan.actionItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <CardTitle>Improvement Plan</CardTitle>
            </div>
            <CardDescription>
              Recommended actions based on current performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {improvementPlan.actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.element}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.action}</div>
                    <div className="text-xs text-muted-foreground">Reason: {item.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Filter by Priority:</span>
        {['ALL', ...Object.values(PriorityLevel)].map((priority) => (
          <Button
            key={priority}
            variant={filterPriority === priority ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPriority(priority as PriorityLevel | 'ALL')}
          >
            {priority}
          </Button>
        ))}
      </div>

      {/* Elements Performance Grid */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Element Performance</h3>
          <span className="text-sm text-muted-foreground">
            {filteredElements.length} element{filteredElements.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredElements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No elements match the current filter
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredElements.map((element) => (
              <PerformanceElementCard
                key={element.idug}
                element={element}
                onAcceptabilityChange={handleAcceptabilityChange}
                onPerformanceChange={handlePerformanceChange}
                readonly={readonly}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface PerformanceElementCardProps {
  element: PerformanceReviewElement
  onAcceptabilityChange: (elementId: string, isAcceptable: boolean) => void
  onPerformanceChange: (elementId: string, trend: number) => void
  readonly?: boolean
}

function PerformanceElementCard({ 
  element, 
  onAcceptabilityChange, 
  onPerformanceChange, 
  readonly = false 
}: PerformanceElementCardProps) {
  const getTrendIcon = (trend: number) => {
    switch (trend) {
      case 1: return <ArrowUp className="h-4 w-4 text-green-600" />
      case -1: return <ArrowDown className="h-4 w-4 text-red-600" />
      default: return <Equal className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: number) => {
    switch (trend) {
      case 1: return "text-green-600"
      case -1: return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.CRITICAL: return "destructive"
      case PriorityLevel.HIGH: return "outline"
      case PriorityLevel.MEDIUM: return "secondary"
      case PriorityLevel.LOW: return "outline"
      default: return "outline"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Element Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{element.displayName}</span>
            </div>
            <div className="flex items-center gap-2">
              {element.priorityLevel && (
                <Badge variant={getPriorityColor(element.priorityLevel)} className="text-xs">
                  {element.priorityLevel}
                </Badge>
              )}
              {element.threeFlagAnswered && (
                <div className={`flex items-center gap-1 ${getTrendColor(element.threeFlag)}`}>
                  {getTrendIcon(element.threeFlag)}
                  <span className="text-sm font-medium">
                    {element.threeFlag === 1 ? "Improving" : 
                     element.threeFlag === -1 ? "Declining" : "Stable"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {element.description && (
            <p className="text-sm text-muted-foreground">{element.description}</p>
          )}

          {/* Evaluation Controls */}
          {!readonly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Acceptability */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Acceptability</label>
                <div className="flex gap-2">
                  <Button
                    variant={element.twoFlag ? "default" : "outline"}
                    size="sm"
                    onClick={() => onAcceptabilityChange(element.idug, true)}
                    className="flex-1 gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Acceptable
                  </Button>
                  <Button
                    variant={element.twoFlagAnswered && !element.twoFlag ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onAcceptabilityChange(element.idug, false)}
                    className="flex-1 gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Unacceptable
                  </Button>
                </div>
              </div>

              {/* Performance Trend */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Performance Trend</label>
                <div className="flex gap-1">
                  <Button
                    variant={element.threeFlag === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPerformanceChange(element.idug, 1)}
                    className="flex-1 gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Better
                  </Button>
                  <Button
                    variant={element.threeFlag === 0 ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onPerformanceChange(element.idug, 0)}
                    className="flex-1 gap-1"
                  >
                    <Minus className="h-3 w-3" />
                    Same
                  </Button>
                  <Button
                    variant={element.threeFlag === -1 ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onPerformanceChange(element.idug, -1)}
                    className="flex-1 gap-1"
                  >
                    <TrendingDown className="h-3 w-3" />
                    Worse
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Current Status Display */}
          {readonly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                {element.twoFlagAnswered ? (
                  <Badge variant={element.twoFlag ? "default" : "destructive"} className="text-xs">
                    {element.twoFlag ? "Acceptable" : "Unacceptable"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Not Evaluated</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Trend:</span>
                {element.threeFlagAnswered ? (
                  <Badge variant="outline" className={`text-xs ${getTrendColor(element.threeFlag)}`}>
                    {element.threeFlag === 1 ? "Improving" : 
                     element.threeFlag === -1 ? "Declining" : "Stable"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Not Tracked</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
