"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react"

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

interface AnalyzingGridProps {
  model: DigitalModel
  onModelUpdate: (model: DigitalModel) => void
}

export default function AnalyzingGrid({ model, onModelUpdate }: AnalyzingGridProps) {
  const [loading, setLoading] = useState(false)

  const handleBinaryEvaluation = async (elementId: string, value: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twoFlag: value,
          twoFlagAnswered: true,
        }),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      } else {
        throw new Error("Failed to update evaluation")
      }
    } catch (error) {
      console.error("Error updating evaluation:", error)
      alert("Failed to update evaluation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePerformanceEvaluation = async (elementId: string, value: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threeFlag: value,
          threeFlagAnswered: true,
        }),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      } else {
        throw new Error("Failed to update performance evaluation")
      }
    } catch (error) {
      console.error("Error updating performance evaluation:", error)
      alert("Failed to update performance evaluation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceIcon = (value: number) => {
    switch (value) {
      case 1:
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 0:
        return <Minus className="w-4 h-4 text-yellow-600" />
      case -1:
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getPerformanceLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Getting Better"
      case 0:
        return "Staying Same"
      case -1:
        return "Getting Worse"
      default:
        return "Not Evaluated"
    }
  }

  const isDecisionMaking = model.digitalThinkingModelType === 1
  const isPerformanceReview = model.digitalThinkingModelType === 2

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analyzing Mode</h2>
          <p className="text-muted-foreground">
            {isDecisionMaking
              ? "Evaluate each element as Acceptable or Unacceptable for your decision"
              : "Evaluate acceptability and performance trend for each element"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {model.model.filter((el) => el.twoFlagAnswered).length} / {model.model.length} Evaluated
          </Badge>
          {isPerformanceReview && (
            <Badge variant="outline">
              {model.model.filter((el) => el.threeFlagAnswered).length} / {model.model.length} Performance Tracked
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {model.model.map((element) => (
          <Card key={element.idug} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">{element.displayName}</CardTitle>
                {element.dominantElementItIS && (
                  <Badge variant="default" className="text-xs ml-2">
                    Dominant
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {element.description || "No description provided"}
              </p>

              {/* Binary Evaluation (Acceptable/Unacceptable) */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Acceptability</div>
                <div className="flex gap-2">
                  <Button
                    variant={element.twoFlagAnswered && element.twoFlag ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-12"
                    onClick={() => handleBinaryEvaluation(element.idug, true)}
                    disabled={loading}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Acceptable
                  </Button>
                  <Button
                    variant={element.twoFlagAnswered && !element.twoFlag ? "destructive" : "outline"}
                    size="sm"
                    className="flex-1 h-12"
                    onClick={() => handleBinaryEvaluation(element.idug, false)}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Unacceptable
                  </Button>
                </div>
              </div>

              {/* Performance Evaluation (Only for Performance Review models) */}
              {isPerformanceReview && (
                <div className="space-y-2 border-t pt-3">
                  <div className="text-sm font-medium">Performance Trend</div>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      variant={element.threeFlagAnswered && element.threeFlag === 1 ? "default" : "outline"}
                      size="sm"
                      className="h-10 text-xs"
                      onClick={() => handlePerformanceEvaluation(element.idug, 1)}
                      disabled={loading}
                    >
                      <TrendingUp className="w-3 h-3 mb-1" />
                      Better
                    </Button>
                    <Button
                      variant={element.threeFlagAnswered && element.threeFlag === 0 ? "secondary" : "outline"}
                      size="sm"
                      className="h-10 text-xs"
                      onClick={() => handlePerformanceEvaluation(element.idug, 0)}
                      disabled={loading}
                    >
                      <Minus className="w-3 h-3 mb-1" />
                      Same
                    </Button>
                    <Button
                      variant={element.threeFlagAnswered && element.threeFlag === -1 ? "destructive" : "outline"}
                      size="sm"
                      className="h-10 text-xs"
                      onClick={() => handlePerformanceEvaluation(element.idug, -1)}
                      disabled={loading}
                    >
                      <TrendingDown className="w-3 h-3 mb-1" />
                      Worse
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Dominance: {element.dominanceFactor}</span>
                <div className="flex items-center gap-1">
                  {element.twoFlagAnswered && (
                    <Badge variant="outline" className="text-xs">
                      {element.twoFlag ? "✓" : "✗"}
                    </Badge>
                  )}
                  {isPerformanceReview && element.threeFlagAnswered && (
                    <Badge variant="outline" className="text-xs">
                      {getPerformanceIcon(element.threeFlag)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {model.model.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Elements to Analyze</h3>
            <p className="text-muted-foreground mb-4">Switch to Editing mode to add elements to your model.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
