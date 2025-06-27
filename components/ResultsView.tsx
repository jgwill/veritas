"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from "lucide-react"

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

interface ResultsViewProps {
  model: DigitalModel
}

export default function ResultsView({ model }: ResultsViewProps) {
  const getSortedElements = () => {
    return [...model.model].sort((a, b) => {
      // First sort by dominance factor (descending)
      if (b.dominanceFactor !== a.dominanceFactor) {
        return b.dominanceFactor - a.dominanceFactor
      }
      // Then by evaluation preference if available
      if (model.twoOnly) {
        const aValue = a.twoFlagAnswered ? (a.twoFlag ? 1 : 0) : 0.5
        const bValue = b.twoFlagAnswered ? (b.twoFlag ? 1 : 0) : 0.5
        return bValue - aValue
      } else {
        const aValue = a.threeFlagAnswered ? a.threeFlag : 0
        const bValue = b.threeFlagAnswered ? b.threeFlag : 0
        return bValue - aValue
      }
    })
  }

  const getEvaluationIcon = (element: DigitalElement) => {
    if (model.twoOnly) {
      if (!element.twoFlagAnswered) return <Minus className="w-4 h-4 text-gray-400" />
      return element.twoFlag ? (
        <TrendingUp className="w-4 h-4 text-green-600" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-600" />
      )
    } else {
      if (!element.threeFlagAnswered) return <Minus className="w-4 h-4 text-gray-400" />
      switch (element.threeFlag) {
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
  }

  const getEvaluationLabel = (element: DigitalElement) => {
    if (model.twoOnly) {
      if (!element.twoFlagAnswered) return "Not Evaluated"
      return element.twoFlag ? "Positive" : "Negative"
    } else {
      if (!element.threeFlagAnswered) return "Not Evaluated"
      switch (element.threeFlag) {
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
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{index + 1}
          </span>
        )
    }
  }

  const getOverallRecommendation = () => {
    const sortedElements = getSortedElements()
    const topElements = sortedElements.slice(0, 3)
    const dominantElements = sortedElements.filter((el) => el.dominantElementItIS)

    if (model.digitalThinkingModelType === 1) {
      // Decision Making
      const positiveElements = model.twoOnly
        ? topElements.filter((el) => el.twoFlagAnswered && el.twoFlag)
        : topElements.filter((el) => el.threeFlagAnswered && el.threeFlag > 0)

      if (positiveElements.length > 0) {
        return {
          decision: "RECOMMENDED",
          confidence: "High",
          reason: `Top factors (${positiveElements.map((el) => el.displayName).join(", ")}) show positive evaluation with strong dominance.`,
        }
      } else {
        return {
          decision: "NOT RECOMMENDED",
          confidence: "Medium",
          reason: "Top dominant factors show negative or neutral evaluation.",
        }
      }
    } else {
      // Performance Review
      const improvingElements = model.twoOnly
        ? topElements.filter((el) => el.twoFlagAnswered && el.twoFlag)
        : topElements.filter((el) => el.threeFlagAnswered && el.threeFlag > 0)

      const decliningElements = model.twoOnly
        ? topElements.filter((el) => el.twoFlagAnswered && !el.twoFlag)
        : topElements.filter((el) => el.threeFlagAnswered && el.threeFlag < 0)

      if (improvingElements.length > decliningElements.length) {
        return {
          decision: "POSITIVE TREND",
          confidence: "High",
          reason: `More key factors are improving (${improvingElements.length}) than declining (${decliningElements.length}).`,
        }
      } else if (decliningElements.length > improvingElements.length) {
        return {
          decision: "NEGATIVE TREND",
          confidence: "High",
          reason: `More key factors are declining (${decliningElements.length}) than improving (${improvingElements.length}).`,
        }
      } else {
        return {
          decision: "STABLE",
          confidence: "Medium",
          reason: "Key factors show balanced performance with equal improving and declining elements.",
        }
      }
    }
  }

  const sortedElements = getSortedElements()
  const maxDominance = Math.max(...model.model.map((el) => el.dominanceFactor))
  const recommendation = getOverallRecommendation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Results & Analysis</h2>
        <p className="text-muted-foreground">Rankings and recommendations based on your comparisons and evaluations</p>
      </div>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Overall Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  recommendation.decision.includes("RECOMMENDED") || recommendation.decision.includes("POSITIVE")
                    ? "default"
                    : recommendation.decision.includes("NOT") || recommendation.decision.includes("NEGATIVE")
                      ? "destructive"
                      : "secondary"
                }
                className="text-lg px-4 py-2"
              >
                {recommendation.decision}
              </Badge>
              <Badge variant="outline">{recommendation.confidence} Confidence</Badge>
            </div>
            <p className="text-muted-foreground">{recommendation.reason}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Element Rankings</CardTitle>
          <CardDescription>Elements ranked by dominance factor and evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedElements.map((element, index) => (
              <div key={element.idug} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getRankIcon(index)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{element.displayName}</h3>
                      {element.dominantElementItIS && <Badge variant="default">Dominant</Badge>}
                      {element.question && <Badge variant="secondary">Question</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{element.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Dominance</div>
                    <div className="text-xl font-bold">{element.dominanceFactor}</div>
                    <Progress
                      value={maxDominance > 0 ? (element.dominanceFactor / maxDominance) * 100 : 0}
                      className="w-16 h-2 mt-1"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Evaluation</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getEvaluationIcon(element)}
                      <span className="text-sm font-medium">{getEvaluationLabel(element)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dominance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Highest Dominance:</span>
                <span className="font-medium">{maxDominance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dominant Elements:</span>
                <span className="font-medium">{model.model.filter((el) => el.dominantElementItIS).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Dominance:</span>
                <span className="font-medium">
                  {(model.model.reduce((sum, el) => sum + el.dominanceFactor, 0) / model.model.length).toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {model.twoOnly ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positive:</span>
                    <span className="font-medium text-green-600">
                      {model.model.filter((el) => el.twoFlagAnswered && el.twoFlag).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Negative:</span>
                    <span className="font-medium text-red-600">
                      {model.model.filter((el) => el.twoFlagAnswered && !el.twoFlag).length}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Getting Better:</span>
                    <span className="font-medium text-green-600">
                      {model.model.filter((el) => el.threeFlagAnswered && el.threeFlag > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staying Same:</span>
                    <span className="font-medium text-yellow-600">
                      {model.model.filter((el) => el.threeFlagAnswered && el.threeFlag === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Getting Worse:</span>
                    <span className="font-medium text-red-600">
                      {model.model.filter((el) => el.threeFlagAnswered && el.threeFlag < 0).length}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Not Evaluated:</span>
                <span className="font-medium text-gray-500">
                  {model.twoOnly
                    ? model.model.filter((el) => !el.twoFlagAnswered).length
                    : model.model.filter((el) => !el.threeFlagAnswered).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
