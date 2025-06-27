"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type DigitalElement,
  DigitalThinkingModelType,
  isDecisionMakingElement,
  isPerformanceReviewElement,
} from "@/lib/types"
import { ModelMode, PerformanceTrend } from "@/lib/constants"
import { Pencil, TrendingUp, TrendingDown, Minus, Check, X } from "lucide-react"

interface ElementCardProps {
  element: DigitalElement
  mode: ModelMode
  modelType: DigitalThinkingModelType
  onUpdate?: (element: DigitalElement, updates: Partial<DigitalElement>) => void
  onCompare?: (element: DigitalElement) => void
  onEdit?: (element: DigitalElement) => void
  isComparing?: boolean
}

export default function ElementCard({
  element,
  mode,
  modelType,
  onUpdate,
  onCompare,
  onEdit,
  isComparing,
}: ElementCardProps) {
  const handleAcceptability = (isAcceptable: boolean) => {
    if (onUpdate) {
      onUpdate(element, { twoFlag: isAcceptable, twoFlagAnswered: true })
    }
  }

  const handleTrend = (trend: PerformanceTrend) => {
    if (onUpdate && isPerformanceReviewElement(element)) {
      onUpdate(element, { threeFlag: trend, threeFlagAnswered: true })
    }
  }

  const isPerformanceReview = modelType === DigitalThinkingModelType.PERFORMANCE_REVIEW

  const cardBorderColor = isComparing ? "border-primary" : "border-border"

  return (
    <Card className={`transition-all duration-200 flex flex-col ${cardBorderColor}`}>
      <CardHeader className="flex-row items-center justify-between p-3">
        <CardTitle className="text-sm font-semibold truncate leading-tight">{element.displayName}</CardTitle>
        {mode === ModelMode.EDITING && onEdit && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(element)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-3 text-sm text-muted-foreground flex-grow">
        <p className="h-20 overflow-y-auto">{element.description || "No description provided."}</p>
      </CardContent>

      <CardFooter className="p-2 border-t flex-col items-stretch space-y-2">
        {mode === ModelMode.EDITING && isDecisionMakingElement(element) && (
          <div className="flex items-center justify-between h-9">
            <span className="text-xs font-medium text-muted-foreground">Dominance:</span>
            <Badge variant="secondary">{element.dominanceFactor}</Badge>
            <Button
              onClick={() => onCompare && onCompare(element)}
              size="sm"
              variant={isComparing ? "default" : "outline"}
              disabled={isComparing}
            >
              {isComparing ? "Comparing..." : "Compare"}
            </Button>
          </div>
        )}

        {mode === ModelMode.ANALYZING && (
          <div className="space-y-2">
            <div className="flex items-center justify-around">
              <Button
                size="icon"
                variant={element.twoFlagAnswered && element.twoFlag ? "default" : "outline"}
                className="h-8 w-8"
                onClick={() => handleAcceptability(true)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={element.twoFlagAnswered && !element.twoFlag ? "destructive" : "outline"}
                className="h-8 w-8"
                onClick={() => handleAcceptability(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isPerformanceReview && isPerformanceReviewElement(element) && (
              <>
                <div className="border-b w-full" />
                <div className="flex items-center justify-around">
                  <Button
                    size="icon"
                    variant={element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_BETTER ? "default" : "outline"}
                    className="h-8 w-8"
                    onClick={() => handleTrend(PerformanceTrend.GETTING_BETTER)}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={element.threeFlagAnswered && element.threeFlag === PerformanceTrend.STAYING_SAME ? "secondary" : "outline"}
                    className="h-8 w-8"
                    onClick={() => handleTrend(PerformanceTrend.STAYING_SAME)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={element.threeFlagAnswered && element.threeFlag === PerformanceTrend.GETTING_WORSE ? "destructive" : "outline"}
                    className="h-8 w-8"
                    onClick={() => handleTrend(PerformanceTrend.GETTING_WORSE)}
                  >
                    <TrendingDown className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {mode === ModelMode.EDITING && isPerformanceReview && (
          <div className="text-center text-xs text-muted-foreground py-1 h-9 flex items-center justify-center">
            Define performance criteria.
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
