"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Clock, ArrowRight, CheckCircle2, FileText } from "lucide-react"
import Link from "next/link"
import CreateModelDialog from "@/components/CreateModelDialog"
import {
  type DigitalModel,
  type CreateModelRequest,
  isDecisionMakingModel,
  isPerformanceReviewModel,
} from "@/lib/types"
import { getModelStats } from "@/lib/models"
import { createModelAction, getModelsAction } from "@/lib/actions"

function ModelCard({ model }: { model: DigitalModel }) {
  const stats = getModelStats(model)
  const isDecisionMaking = isDecisionMakingModel(model)
  const isPerformanceReview = isPerformanceReviewModel(model)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDecisionMaking && <Target className="h-5 w-5 text-blue-600" />}
            {isPerformanceReview && <TrendingUp className="h-5 w-5 text-green-600" />}
            <CardTitle className="text-lg">{model.modelName}</CardTitle>
          </div>
          <Badge variant={isDecisionMaking ? "default" : "secondary"}>
            {isDecisionMaking ? "Decision" : "Performance"}
          </Badge>
        </div>
        <CardDescription className="text-sm">{model.digitalTopic}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{stats.totalElements} elements</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span>{stats.evaluatedElements} evaluated</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Evaluation Progress</span>
              <span>{Math.round(stats.evaluationProgress * 100)}%</span>
            </div>
            <Progress value={stats.evaluationProgress * 100} />
          </div>

          {/* Model-specific progress */}
          {isDecisionMaking && "comparisonProgress" in stats && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Comparisons</span>
                <span>{Math.round(stats.comparisonProgress * 100)}%</span>
              </div>
              <Progress value={stats.comparisonProgress * 100} className="h-2" />
            </div>
          )}

          {isPerformanceReview && "performanceProgress" in stats && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Performance Tracking</span>
                <span>{Math.round(stats.performanceProgress * 100)}%</span>
              </div>
              <Progress value={stats.performanceProgress * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* Model-specific indicators */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {isDecisionMaking && "consistencyScore" in stats && (
              <Badge variant="outline" className="text-xs">
                Consistency: {Math.round(stats.consistencyScore * 100)}%
              </Badge>
            )}
            {stats.isValid && (
              <Badge variant="outline" className="text-xs text-green-600">
                Valid
              </Badge>
            )}
          </div>

          <Link href={`/models/${model.id}`}>
            <Button size="sm" className="gap-1">
              Open
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelsGrid({ models }: { models: DigitalModel[] }) {
  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No models yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first thinking model to get started with systematic decision-making or performance tracking.
          </p>
          <CreateModelDialog onCreateModel={createModelAction} />
        </div>
      </div>
    )
  }

  const decisionModels = models.filter(isDecisionMakingModel)
  const performanceModels = models.filter(isPerformanceReviewModel)

  return (
    <div className="space-y-8">
      {/* Decision Making Models */}
      {decisionModels.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Decision Making Models</h2>
            <Badge variant="outline">{decisionModels.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decisionModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      )}

      {/* Performance Review Models */}
      {performanceModels.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Performance Review Models</h2>
            <Badge variant="outline">{performanceModels.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function HomePage() {
  const [models, setModels] = useState<DigitalModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      try {
        const fetchedModels = await getModelsAction()
        setModels(fetchedModels)
      } catch (error) {
        console.error("Error fetching models:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  const handleCreateModel = async (request: CreateModelRequest) => {
    try {
      const newModel = await createModelAction(request)
      setModels((prev) => [...prev, newModel])
      return newModel
    } catch (error) {
      console.error("Error creating model:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading models...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">TandT Dashboard</h1>
          <p className="text-muted-foreground mt-1">Systematic decision-making and performance tracking framework</p>
        </div>
        <CreateModelDialog onCreateModel={handleCreateModel} />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Models</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter(isDecisionMakingModel).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Models</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter(isPerformanceReviewModel).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.filter((m) => !m.decided).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      <ModelsGrid models={models} />
    </div>
  )
}
