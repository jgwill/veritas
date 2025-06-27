"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, TrendingUp, Minus, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [evaluating, setEvaluating] = useState<string | null>(null)

  const handleEvaluation = async (
    elementId: string,
    evaluationType: "acceptability" | "performance",
    value: boolean | number,
  ) => {
    setEvaluating(elementId)

    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evaluationType,
          value,
        }),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      } else {
        console.error("Failed to update evaluation")
      }
    } catch (error) {
      console.error("Error updating evaluation:", error)
    } finally {
      setEvaluating(null)
    }
  }

  const getAcceptabilityStatus = (element: DigitalElement) => {
    if (!element.twoFlagAnswered) return "unanswered"
    return element.twoFlag ? "acceptable" : "unacceptable"
  }

  const getPerformanceStatus = (element: DigitalElement) => {
    if (!element.threeFlagAnswered) return "unanswered"
    if (element.threeFlag === 1) return "improving"
    if (element.threeFlag === 0) return "stable"
    return "declining"
  }

  const isPerformanceReviewModel = model.digitalThinkingModelType === 2

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analyzing Mode</h2>
          <p className="text-muted-foreground">
            {isPerformanceReviewModel
              ? "Evaluate acceptability and performance trends for each element"
              : "Evaluate acceptability for each element to make your decision"}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {model.model.filter((el) => el.twoFlagAnswered).length} / {model.model.length} Evaluated
          </Badge>
          {isPerformanceReviewModel && (
            <Badge variant="outline">
              {model.model.filter((el) => el.threeFlagAnswered).length} / {model.model.length} Performance Tracked
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {model.model
          .sort((a, b) => a.sortNo - b.sortNo)
          .map((element) => {
            const acceptabilityStatus = getAcceptabilityStatus(element)
            const performanceStatus = getPerformanceStatus(element)
            const isEvaluating = evaluating === element.idug

            return (
              <Card
                key={element.idug}
                className={cn(
                  "relative transition-all duration-200 hover:shadow-md",
                  acceptabilityStatus === "acceptable" && "border-green-200 bg-green-50/50",
                  acceptabilityStatus === "unacceptable" && "border-red-200 bg-red-50/50",
                  element.dominantElementItIS && "ring-2 ring-blue-200",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">
                      {element.displayName || element.nameElement}
                    </CardTitle>
                    {element.dominantElementItIS && (
                      <Badge variant="secondary" className="text-xs">
                        Dominant
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{element.description}</p>

                  {/* Acceptability Evaluation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Acceptability</span>
                      {acceptabilityStatus !== "unanswered" && (
                        <Badge
                          variant={acceptabilityStatus === "acceptable" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {acceptabilityStatus === "acceptable" ? "Acceptable" : "Unacceptable"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={acceptabilityStatus === "acceptable" ? "default" : "outline"}
                        className={cn(
                          "flex-1 h-10",
                          acceptabilityStatus === "acceptable" && "bg-green-600 hover:bg-green-700",
                        )}
                        disabled={isEvaluating}
                        onClick={() => handleEvaluation(element.idug, "acceptability", true)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant={acceptabilityStatus === "unacceptable" ? "destructive" : "outline"}
                        className="flex-1 h-10"
                        disabled={isEvaluating}
                        onClick={() => handleEvaluation(element.idug, "acceptability", false)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {/* Performance Evaluation (Performance Review models only) */}
                  {isPerformanceReviewModel && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Performance</span>
                        {performanceStatus !== "unanswered" && (
                          <Badge
                            variant={
                              performanceStatus === "improving"
                                ? "default"
                                : performanceStatus === "stable"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {performanceStatus === "improving"
                              ? "Improving"
                              : performanceStatus === "stable"
                                ? "Stable"
                                : "Declining"}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          variant={performanceStatus === "improving" ? "default" : "outline"}
                          className={cn(
                            "h-8 px-2",
                            performanceStatus === "improving" && "bg-green-600 hover:bg-green-700",
                          )}
                          disabled={isEvaluating}
                          onClick={() => handleEvaluation(element.idug, "performance", 1)}
                        >
                          <TrendingUp className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant={performanceStatus === "stable" ? "secondary" : "outline"}
                          className="h-8 px-2"
                          disabled={isEvaluating}
                          onClick={() => handleEvaluation(element.idug, "performance", 0)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant={performanceStatus === "declining" ? "destructive" : "outline"}
                          className="h-8 px-2"
                          disabled={isEvaluating}
                          onClick={() => handleEvaluation(element.idug, "performance", -1)}
                        >
                          <TrendingDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Dominance Factor Display */}
                  {element.dominanceFactor > 0 && (
                    <div className="text-xs text-muted-foreground">Dominance: {element.dominanceFactor.toFixed(2)}</div>
                  )}
                </CardContent>
              </Card>
            )
          })}
      </div>

      {model.model.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Elements to Analyze</h3>
            <p className="text-muted-foreground mb-4">Switch to Editing mode to add elements to this model.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
