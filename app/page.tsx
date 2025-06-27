"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreateModelDialog } from "@/components/CreateModelDialog"
import { type DigitalModel, isDecisionMakingModel, isPerformanceReviewModel } from "@/lib/types"
import { fetchAllModels } from "@/lib/actions"
import { Brain, Target, TrendingUp, CheckCircle, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"

interface ModelStats {
  total: number
  decisionMaking: number
  performanceReview: number
  completed: number
  inProgress: number
}

export default function HomePage() {
  const [models, setModels] = useState<DigitalModel[]>([])
  const [stats, setStats] = useState<ModelStats>({
    total: 0,
    decisionMaking: 0,
    performanceReview: 0,
    completed: 0,
    inProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setLoading(true)
    try {
      const result = await fetchAllModels()
      if (result.success && result.models) {
        setModels(result.models)
        calculateStats(result.models)
      }
    } catch (error) {
      console.error("Error loading models:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (modelList: DigitalModel[]) => {
    const stats: ModelStats = {
      total: modelList.length,
      decisionMaking: modelList.filter((m) => isDecisionMakingModel(m)).length,
      performanceReview: modelList.filter((m) => isPerformanceReviewModel(m)).length,
      completed: modelList.filter((m) => m.decided).length,
      inProgress: modelList.filter((m) => !m.decided).length,
    }
    setStats(stats)
  }

  const getModelProgress = (model: DigitalModel): number => {
    if (!model.model || model.model.length === 0) return 0

    const evaluatedElements = model.model.filter((element) => element.twoFlagAnswered).length
    return Math.round((evaluatedElements / model.model.length) * 100)
  }

  const getModelStatusBadge = (model: DigitalModel) => {
    const progress = getModelProgress(model)
    if (progress === 100) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Complete
        </Badge>
      )
    } else if (progress > 0) {
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      )
    } else {
      return <Badge variant="outline">Not Started</Badge>
    }
  }

  const handleModelCreated = () => {
    setShowCreateDialog(false)
    loadModels()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading models...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">TandT Digital Thinking Platform</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced decision-making and performance review framework using structured digital thinking methodologies
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active thinking models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Making</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.decisionMaking}</div>
            <p className="text-xs text-muted-foreground">Binary decision models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Review</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.performanceReview}</div>
            <p className="text-xs text-muted-foreground">Performance tracking models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Fully evaluated models</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Types Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="h-5 w-5" />
              Digital Decision Making
            </CardTitle>
            <CardDescription className="text-blue-700">
              Binary evaluation framework for complex decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>
                • <strong>Purpose:</strong> Determine YES/NO decisions through element analysis
              </li>
              <li>
                • <strong>Evaluation:</strong> Acceptable (1) or Unacceptable (0) for each element
              </li>
              <li>
                • <strong>Method:</strong> Pairwise comparisons to establish element hierarchy
              </li>
              <li>
                • <strong>Output:</strong> Recommendation with dominance factors and confidence score
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Digital Performance Review
            </CardTitle>
            <CardDescription className="text-green-700">
              Continuous performance tracking and improvement framework
            </CardDescription>
          </CardHeader>
          <CardContent className="text-green-800">
            <ul className="space-y-2 text-sm">
              <li>
                • <strong>Purpose:</strong> Track performance trends over time
              </li>
              <li>
                • <strong>Evaluation:</strong> Acceptability + Performance trend (-1, 0, +1)
              </li>
              <li>
                • <strong>Method:</strong> Historical tracking and trend analysis
              </li>
              <li>
                • <strong>Output:</strong> Performance dashboard with improvement recommendations
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Models</h2>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Model
          </Button>
        </div>

        {models.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No models yet</h3>
              <p className="text-gray-600 mb-4">Create your first digital thinking model to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>Create Your First Model</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{model.modelName}</CardTitle>
                      <CardDescription>{model.digitalTopic}</CardDescription>
                    </div>
                    {getModelStatusBadge(model)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {isDecisionMakingModel(model) ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Target className="w-3 h-3 mr-1" />
                        Decision Making
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Performance Review
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getModelProgress(model)}%</span>
                    </div>
                    <Progress value={getModelProgress(model)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{model.model?.length || 0} elements</span>
                    <span>Modified {new Date(model.dtModified).toLocaleDateString()}</span>
                  </div>

                  <Link href={`/models/${model.id}`}>
                    <Button className="w-full">
                      {getModelProgress(model) === 0 ? "Start Building" : "Continue Working"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateModelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onModelCreated={handleModelCreated}
      />
    </div>
  )
}
