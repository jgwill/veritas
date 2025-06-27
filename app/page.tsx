"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3, Target, TrendingUp, Users, Clock } from "lucide-react"
import Link from "next/link"

interface DigitalModel {
  id: string
  modelName: string
  digitalTopic: string
  digitalThinkingModelType: number
  twoOnly: boolean
  decided: boolean
  valid: boolean
  autoSaveModel: boolean
  hasIssue: boolean
  note?: string
  model: Array<{
    idug: string
    nameElement: string
    displayName: string
    description: string
    sortNo: number
    status: number
    twoFlag: boolean
    twoFlagAnswered: boolean
    threeFlag: number
    threeFlagAnswered: boolean
    dominanceFactor: number
    dominantElementItIS: boolean
    comparationCompleted: boolean
    question: boolean
    comparationTableData: Record<string, number>
  }>
}

export default function Dashboard() {
  const [models, setModels] = useState<DigitalModel[]>([])
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

  const getModelTypeInfo = (type: number) => {
    return type === 1
      ? {
          label: "Decision Making",
          description: "Binary decision analysis with acceptability evaluation",
          icon: Target,
          color: "bg-blue-500",
        }
      : {
          label: "Performance Review",
          description: "Performance tracking with trend analysis",
          icon: TrendingUp,
          color: "bg-green-500",
        }
  }

  const getModelStats = (model: DigitalModel) => {
    const totalElements = model.model.length
    const evaluatedElements = model.model.filter((el) => el.twoFlagAnswered).length
    const performanceTracked = model.model.filter((el) => el.threeFlagAnswered).length
    const dominantElements = model.model.filter((el) => el.dominantElementItIS).length

    const totalComparisons = (totalElements * (totalElements - 1)) / 2
    const completedComparisons =
      model.model.reduce((sum, el) => {
        return sum + Object.values(el.comparationTableData).filter((val) => val !== 0).length
      }, 0) / 2

    return {
      totalElements,
      evaluatedElements,
      performanceTracked,
      dominantElements,
      completionPercentage: totalComparisons > 0 ? Math.round((completedComparisons / totalComparisons) * 100) : 0,
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">TandT Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Thinking and Tracking - Decision Making & Performance Review Platform
          </p>
        </div>
        <Link href="/models/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create New Model
          </Button>
        </Link>
      </div>

      {/* Model Type Explanations */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Digital Decision Making</CardTitle>
                <CardDescription className="text-blue-700">
                  Binary decision analysis for YES/NO scenarios
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• Evaluate elements as Acceptable or Unacceptable</li>
              <li>• Identify mandatory vs optional criteria</li>
              <li>• Perfect for housing, investment, or hiring decisions</li>
              <li>• Framework: "If you have X but not Y, would the decision be YES or NO?"</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-900">Digital Performance Review</CardTitle>
                <CardDescription className="text-green-700">Performance tracking with trend analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-green-800">
            <ul className="space-y-2 text-sm">
              <li>• Dual evaluation: Acceptability + Performance trends</li>
              <li>• Track Getting Better, Staying Same, or Getting Worse</li>
              <li>• Ideal for employee reviews, project health, system metrics</li>
              <li>• Historical performance data and trend visualization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Models</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="w-3 h-3" />
              {models.length} Total Models
            </Badge>
          </div>
        </div>

        {models.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mb-4">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Models Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get started by creating your first decision-making or performance review model. Choose from our two
                  powerful evaluation methodologies.
                </p>
              </div>
              <Link href="/models/new">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Model
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => {
              const typeInfo = getModelTypeInfo(model.digitalThinkingModelType)
              const stats = getModelStats(model)
              const IconComponent = typeInfo.icon

              return (
                <Card key={model.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${typeInfo.color} rounded-lg`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg leading-tight">{model.digitalTopic}</CardTitle>
                          <CardDescription>{model.modelName}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo.label}
                        </Badge>
                        {model.decided && (
                          <Badge variant="default" className="text-xs">
                            Decided
                          </Badge>
                        )}
                        {model.hasIssue && (
                          <Badge variant="destructive" className="text-xs">
                            Issues
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{typeInfo.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{stats.totalElements}</div>
                        <div className="text-xs text-muted-foreground">Elements</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>
                          Evaluated: {stats.evaluatedElements}/{stats.totalElements}
                        </span>
                        <span>{Math.round((stats.evaluatedElements / stats.totalElements) * 100) || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stats.evaluatedElements / stats.totalElements) * 100 || 0}%` }}
                        />
                      </div>

                      {model.digitalThinkingModelType === 2 && (
                        <>
                          <div className="flex justify-between text-xs">
                            <span>
                              Performance Tracked: {stats.performanceTracked}/{stats.totalElements}
                            </span>
                            <span>{Math.round((stats.performanceTracked / stats.totalElements) * 100) || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(stats.performanceTracked / stats.totalElements) * 100 || 0}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/models/${model.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full">
                          Open Model
                        </Button>
                      </Link>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="w-3 h-3" />
                      <span>Model ID: {model.id.slice(0, 8)}...</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
