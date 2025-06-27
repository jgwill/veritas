"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, BarChart3, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ModelSummary {
  id: string
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: number
  elementCount: number
  completedComparisons: number
  totalComparisons: number
  decided: boolean
  lastModified: string
}

export default function Dashboard() {
  const [models, setModels] = useState<ModelSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models")
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      } else {
        throw new Error("Failed to fetch models")
      }
    } catch (error) {
      console.error("Error fetching models:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModelTypeIcon = (type: number) => {
    return type === 1 ? <FileText className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />
  }

  const getModelTypeLabel = (type: number) => {
    return type === 1 ? "Decision Making" : "Performance Review"
  }

  const getModelTypeDescription = (type: number) => {
    return type === 1
      ? "Binary decision-making with acceptable/unacceptable evaluation"
      : "Performance tracking with trend analysis"
  }

  const getCompletionBadge = (model: ModelSummary) => {
    const percentage = model.totalComparisons > 0 ? (model.completedComparisons / model.totalComparisons) * 100 : 0

    if (percentage === 100) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Complete
        </Badge>
      )
    } else if (percentage > 0) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {Math.round(percentage)}% Done
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Not Started
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">TandT Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Think and Think - Systematic Decision Making & Performance Review
          </p>
        </div>
        <Link href="/models/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Model
          </Button>
        </Link>
      </div>

      {/* Model Type Explanation */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Decision Making Models
            </CardTitle>
            <CardDescription>
              Make binary decisions about real-world situations by evaluating critical elements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Binary evaluation: Acceptable ✅ or Unacceptable ❌</li>
              <li>• Pairwise comparison for element hierarchy</li>
              <li>• Clear YES/NO recommendations</li>
              <li>• Use cases: Housing, jobs, investments</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Performance Review Models
            </CardTitle>
            <CardDescription>Track performance changes over time across multiple criteria.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Dual evaluation: Acceptability + Performance trend</li>
              <li>• Track: Getting Better ⬆️, Same ➡️, Worse ⬇️</li>
              <li>• Performance evolution analysis</li>
              <li>• Use cases: Business reviews, project assessments</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Models</h2>

        {models.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mb-4">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first decision-making or performance review model to get started.
              </p>
              <Link href="/models/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Model
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getModelTypeIcon(model.digitalThinkingModelType)}
                        <h3 className="text-xl font-semibold">{model.digitalTopic}</h3>
                        <Badge variant="secondary">{getModelTypeLabel(model.digitalThinkingModelType)}</Badge>
                        {getCompletionBadge(model)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {getModelTypeDescription(model.digitalThinkingModelType)}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>{model.elementCount} elements</span>
                        <span>
                          {model.completedComparisons}/{model.totalComparisons} comparisons
                        </span>
                        <span>Modified {new Date(model.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/models/${model.id}`}>
                        <Button>Open Model</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
