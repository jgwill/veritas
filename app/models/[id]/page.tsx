"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Settings, BarChart3, Table, Edit, Eye } from "lucide-react"
import Link from "next/link"
import ElementManager from "@/components/ElementManager"
import ComparisonMatrix from "@/components/ComparisonMatrix"
import ResultsView from "@/components/ResultsView"
import AnalyzingGrid from "@/components/AnalyzingGrid"

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
  model: DigitalElement[]
}

interface DigitalElement {
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
}

type AppMode = "editing" | "analyzing"

export default function ModelEditor() {
  const params = useParams()
  const modelId = params.id as string
  const [model, setModel] = useState<DigitalModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("elements")
  const [appMode, setAppMode] = useState<AppMode>("editing")

  useEffect(() => {
    if (modelId) {
      fetchModel()
    }
  }, [modelId])

  const fetchModel = async () => {
    try {
      const response = await fetch(`/api/models/${modelId}`)
      if (response.ok) {
        const data = await response.json()
        setModel(data)
      } else {
        throw new Error("Failed to fetch model")
      }
    } catch (error) {
      console.error("Error fetching model:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleModelUpdate = (updatedModel: DigitalModel) => {
    setModel(updatedModel)
  }

  const getModelTypeLabel = (type: number) => {
    return type === 1 ? "Decision Making" : "Performance Review"
  }

  const getModelTypeDescription = (type: number) => {
    return type === 1
      ? "Binary decision-making with acceptable/unacceptable evaluation"
      : "Performance tracking with trend analysis and acceptability evaluation"
  }

  const getCompletionStats = () => {
    if (!model) return { completed: 0, total: 0 }

    const completedElements = model.model.filter((el) => el.comparationCompleted).length
    const totalElements = model.model.length
    const totalComparisons = (totalElements * (totalElements - 1)) / 2
    const completedComparisons =
      model.model.reduce((sum, el) => {
        return sum + Object.values(el.comparationTableData).filter((val) => val !== 0).length
      }, 0) / 2 // Divide by 2 since each comparison is counted twice

    return {
      completed: completedComparisons,
      total: totalComparisons,
      elements: totalElements,
      completedElements,
    }
  }

  const toggleMode = () => {
    setAppMode(appMode === "editing" ? "analyzing" : "editing")
    if (appMode === "editing") {
      setActiveTab("analyzing")
    } else {
      setActiveTab("elements")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading model...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Model Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested model could not be found.</p>
            <Link href="/">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getCompletionStats()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{model.digitalTopic}</h1>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{getModelTypeLabel(model.digitalThinkingModelType)}</Badge>
              {model.twoOnly && <Badge variant="outline">Binary Mode</Badge>}
              {model.decided && <Badge variant="default">Decided</Badge>}
              {model.hasIssue && <Badge variant="destructive">Has Issues</Badge>}
              <Badge variant={appMode === "editing" ? "default" : "secondary"}>
                {appMode === "editing" ? "Editing Mode" : "Analyzing Mode"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getModelTypeDescription(model.digitalThinkingModelType)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={appMode === "editing" ? "default" : "outline"} size="sm" onClick={toggleMode}>
              {appMode === "editing" ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {appMode === "editing" ? "Switch to Analyzing" : "Switch to Editing"}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.elements}</div>
                <div className="text-sm text-muted-foreground">Elements</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Comparisons</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{model.model.filter((el) => el.dominantElementItIS).length}</div>
                <div className="text-sm text-muted-foreground">Dominant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {appMode === "editing" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="elements" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Elements
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Comparisons
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="elements" className="mt-6">
            <ElementManager model={model} onModelUpdate={handleModelUpdate} />
          </TabsContent>

          <TabsContent value="comparisons" className="mt-6">
            <ComparisonMatrix model={model} onModelUpdate={handleModelUpdate} />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <ResultsView model={model} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-6">
          <AnalyzingGrid model={model} onModelUpdate={handleModelUpdate} />
        </div>
      )}
    </div>
  )
}
