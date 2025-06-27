"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, BarChart3, Clock, CheckCircle } from "lucide-react"
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
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error("Failed to fetch models:", error)
    } finally {
      setLoading(false)
    }
  }

  const getModelTypeLabel = (type: number) => {
    return type === 1 ? "Decision Making" : "Performance Review"
  }

  const getModelTypeIcon = (type: number) => {
    return type === 1 ? <FileText className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0
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
          <p className="text-muted-foreground">Think and Think - Digital Decision Making Framework</p>
        </div>
        <Link href="/models/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Model
          </Button>
        </Link>
      </div>

      {models.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first decision-making or performance review model to get started.
            </p>
            <Link href="/models/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Model
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getModelTypeIcon(model.digitalThinkingModelType)}
                    {getModelTypeLabel(model.digitalThinkingModelType)}
                  </Badge>
                  {model.decided && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <CardTitle className="line-clamp-2">{model.digitalTopic}</CardTitle>
                <CardDescription className="text-sm">Model: {model.modelName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Elements:</span>
                    <span className="font-medium">{model.elementCount}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {getCompletionPercentage(model.completedComparisons, model.totalComparisons)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${getCompletionPercentage(model.completedComparisons, model.totalComparisons)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(model.lastModified).toLocaleDateString()}
                  </div>

                  <Link href={`/models/${model.id}`} className="block">
                    <Button className="w-full mt-4">Open Model</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
