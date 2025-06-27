"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Edit3, 
  BarChart3, 
  Target, 
  TrendingUp,
  Settings,
  Play,
  Crown,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react"
import { 
  DigitalModel, 
  isDecisionMakingModel, 
  isPerformanceReviewModel,
  DecisionMakingModel,
  PerformanceReviewModel
} from "@/lib/types"
import { getModelById, getModelStats, updateModel } from "@/lib/models"
import ComparisonMatrix from "@/components/ComparisonMatrix"
import PerformanceDashboard from "@/components/PerformanceDashboard"
import AnalyzingGrid from "@/components/enhanced/AnalyzingGrid"
import ElementManager from "@/components/ElementManager"

type ModelViewMode = 'editing' | 'analyzing'

export default function ModelPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  const [model, setModel] = useState<DigitalModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ModelViewMode>('editing')

  // Load model data
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true)
        const modelData = getModelById(modelId)
        if (!modelData) {
          setError('Model not found')
          return
        }
        setModel(modelData)
      } catch (err) {
        setError('Failed to load model')
        console.error('Error loading model:', err)
      } finally {
        setLoading(false)
      }
    }

    if (modelId) {
      loadModel()
    }
  }, [modelId])

  const handleModelUpdate = (updatedModel: DigitalModel) => {
    setModel(updatedModel)
    updateModel(updatedModel)
  }

  const stats = useMemo(() => 
    model ? getModelStats(model) : null, 
    [model]
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-4 animate-pulse" />
            <p>Loading model...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600">{error || 'Model not found'}</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isDecisionMaking = isDecisionMakingModel(model)
  const isPerformanceReview = isPerformanceReviewModel(model)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            {isDecisionMaking && <Target className="h-6 w-6 text-blue-600" />}
            {isPerformanceReview && <TrendingUp className="h-6 w-6 text-green-600" />}
            <div>
              <h1 className="text-2xl font-bold">{model.modelName}</h1>
              <p className="text-muted-foreground">{model.digitalTopic}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isDecisionMaking ? "default" : "secondary"}>
            {isDecisionMaking ? "Decision Making" : "Performance Review"}
          </Badge>
          
          {/* Mode Toggle */}
          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === 'editing' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('editing')}
              className="gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Editing
            </Button>
            <Button
              variant={viewMode === 'analyzing' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('analyzing')}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              Analyzing
            </Button>
          </div>
        </div>
      </div>

      {/* Model Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Model Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              {stats?.isValid && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Valid
                </Badge>
              )}
              {model.decided && (
                <Badge variant="default" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Decided
                </Badge>
              )}
            </div>
          </div>
          {model.note && (
            <CardDescription>{model.note}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.totalElements || 0}</div>
              <div className="text-sm text-muted-foreground">Total Elements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.evaluatedElements || 0}</div>
              <div className="text-sm text-muted-foreground">Evaluated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round((stats?.evaluationProgress || 0) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            <div className="text-center">
              {isDecisionMaking && 'comparisonProgress' in stats! && (
                <>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.comparisonProgress * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Comparisons</div>
                </>
              )}
              {isPerformanceReview && 'performanceProgress' in stats! && (
                <>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.performanceProgress * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Performance Tracked</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode-Specific Content */}
      {viewMode === 'editing' ? (
        <EditingModeContent 
          model={model} 
          onModelUpdate={handleModelUpdate}
        />
      ) : (
        <AnalyzingModeContent 
          model={model} 
          onModelUpdate={handleModelUpdate}
        />
      )}
    </div>
  )
}

interface ModeContentProps {
  model: DigitalModel
  onModelUpdate: (model: DigitalModel) => void
}

function EditingModeContent({ model, onModelUpdate }: ModeContentProps) {
  const isDecisionMaking = isDecisionMakingModel(model)
  const isPerformanceReview = isPerformanceReviewModel(model)

  return (
    <Tabs defaultValue="elements" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="elements" className="gap-2">
          <Flag className="h-4 w-4" />
          Elements
        </TabsTrigger>
        <TabsTrigger value="structure" className="gap-2">
          <Settings className="h-4 w-4" />
          Structure
        </TabsTrigger>
        {isDecisionMaking && (
          <TabsTrigger value="comparisons" className="gap-2">
            <Target className="h-4 w-4" />
            Comparisons
          </TabsTrigger>
        )}
        {isPerformanceReview && (
          <TabsTrigger value="tracking" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Tracking Setup
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="elements" className="space-y-6">
        <ElementManager 
          model={model} 
          onModelUpdate={onModelUpdate}
        />
      </TabsContent>

      <TabsContent value="structure" className="space-y-6">
        <ModelStructureEditor 
          model={model} 
          onModelUpdate={onModelUpdate}
        />
      </TabsContent>

      {isDecisionMaking && (
        <TabsContent value="comparisons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparison Matrix Setup</CardTitle>
              <CardDescription>
                Configure pairwise comparisons for Decision Making analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonMatrix 
                model={model as DecisionMakingModel} 
                onModelUpdate={onModelUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {isPerformanceReview && (
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Tracking Setup</CardTitle>
              <CardDescription>
                Configure performance evaluation criteria and baseline settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Performance Review models track trends over time without requiring pairwise comparisons.
                  Elements are evaluated on both acceptability and performance trends.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Acceptability Evaluation</h4>
                    <p className="text-sm text-muted-foreground">
                      Binary assessment: Acceptable (1) or Unacceptable (0)
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Performance Trend</h4>
                    <p className="text-sm text-muted-foreground">
                      Trend tracking: Getting Better (1), Staying Same (0), Getting Worse (-1)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  )
}

function AnalyzingModeContent({ model, onModelUpdate }: ModeContentProps) {
  const isDecisionMaking = isDecisionMakingModel(model)
  const isPerformanceReview = isPerformanceReviewModel(model)

  return (
    <div className="space-y-6">
      {/* Analysis Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {isDecisionMaking ? "Decision Analysis" : "Performance Analysis"}
          </CardTitle>
          <CardDescription>
            {isDecisionMaking 
              ? "Evaluate element acceptability to determine the optimal decision"
              : "Track performance trends and identify improvement priorities"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyzingGrid 
            model={model} 
            onModelUpdate={onModelUpdate}
          />
        </CardContent>
      </Card>

      {/* Model-Specific Analysis Tools */}
      {isDecisionMaking && (
        <ComparisonMatrix 
          model={model as DecisionMakingModel} 
          onModelUpdate={onModelUpdate}
          readonly={false}
        />
      )}

      {isPerformanceReview && (
        <PerformanceDashboard 
          model={model as PerformanceReviewModel} 
          onModelUpdate={onModelUpdate}
        />
      )}
    </div>
  )
}

function ModelStructureEditor({ model, onModelUpdate }: ModeContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Configuration</CardTitle>
        <CardDescription>
          Adjust model settings and metadata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Name</label>
              <div className="p-2 border rounded bg-gray-50 text-sm">
                {model.modelName}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Digital Topic</label>
              <div className="p-2 border rounded bg-gray-50 text-sm">
                {model.digitalTopic}
              </div>
            </div>
          </div>
          
          {model.note && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <div className="p-2 border rounded bg-gray-50 text-sm">
                {model.note}
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Auto Save:</span>
              <span className={`ml-2 ${model.autoSaveModel ? 'text-green-600' : 'text-red-600'}`}>
                {model.autoSaveModel ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="font-medium">Two Only:</span>
              <span className={`ml-2 ${model.twoOnly ? 'text-blue-600' : 'text-gray-600'}`}>
                {model.twoOnly ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Valid:</span>
              <span className={`ml-2 ${model.valid ? 'text-green-600' : 'text-red-600'}`}>
                {model.valid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <div>
              <span className="font-medium">Has Issues:</span>
              <span className={`ml-2 ${model.hasIssue ? 'text-red-600' : 'text-green-600'}`}>
                {model.hasIssue ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
