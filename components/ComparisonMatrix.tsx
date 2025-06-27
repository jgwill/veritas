"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Check, 
  X, 
  Crown, 
  Target, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react"
import { DecisionMakingModel, DecisionMakingElement } from "@/lib/types"
import { DecisionMakingService } from "@/lib/services/decision-making"

interface ComparisonMatrixProps {
  model: DecisionMakingModel
  onModelUpdate: (updatedModel: DecisionMakingModel) => void
  readonly?: boolean
}

export default function ComparisonMatrix({ model, onModelUpdate, readonly = false }: ComparisonMatrixProps) {
  const [showCompletedOnly, setShowCompletedOnly] = useState(false)
  
  const matrix = useMemo(() => 
    DecisionMakingService.generateComparisonMatrix(model), 
    [model]
  )

  const handleComparison = (element1Id: string, element2Id: string, decision: 'YES' | 'NO') => {
    const updatedModel = DecisionMakingService.processComparison(
      model, 
      element1Id, 
      element2Id, 
      decision
    )
    onModelUpdate(updatedModel)
  }

  const handleCalculateDominance = () => {
    DecisionMakingService.calculateDominanceFactors(model)
    onModelUpdate({ ...model })
  }

  const filteredComparisons = useMemo(() => {
    if (showCompletedOnly) {
      return matrix.comparisons.filter(comp => comp.isCompleted)
    }
    return matrix.comparisons
  }, [matrix.comparisons, showCompletedOnly])

  const incompletePairs = matrix.comparisons.filter(comp => !comp.isCompleted)
  const nextComparison = incompletePairs[0]

  return (
    <div className="space-y-6">
      {/* Matrix Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Pairwise Comparison Matrix</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {matrix.completedComparisons} / {matrix.totalComparisons}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompletedOnly(!showCompletedOnly)}
                className="gap-1"
              >
                {showCompletedOnly ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {showCompletedOnly ? 'Show All' : 'Completed Only'}
              </Button>
            </div>
          </div>
          <CardDescription>
            Compare elements pairwise to determine hierarchy and dominance factors
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Comparison Progress</span>
              <span>{Math.round((matrix.completedComparisons / matrix.totalComparisons) * 100)}%</span>
            </div>
            <Progress value={(matrix.completedComparisons / matrix.totalComparisons) * 100} />
          </div>

          {/* Consistency Score */}
          {matrix.completedComparisons > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Consistency Score</span>
              <Badge 
                variant={matrix.consistencyScore > 0.8 ? "default" : "destructive"}
                className="gap-1"
              >
                {matrix.consistencyScore > 0.8 ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {Math.round(matrix.consistencyScore * 100)}%
              </Badge>
            </div>
          )}

          {/* Calculate Dominance Button */}
          {matrix.completedComparisons === matrix.totalComparisons && !readonly && (
            <Button 
              onClick={handleCalculateDominance}
              className="w-full gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Calculate Dominance Factors
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Next Comparison Highlight */}
      {nextComparison && !readonly && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Next Comparison</CardTitle>
            <CardDescription>
              Decide which element would make the decision "YES" if you had it but not the other
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonCard 
              comparison={nextComparison}
              onDecision={handleComparison}
              highlighted={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Comparison Grid */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {showCompletedOnly ? 'Completed Comparisons' : 'All Comparisons'}
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredComparisons.length} comparison{filteredComparisons.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredComparisons.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {showCompletedOnly 
                ? "No completed comparisons yet" 
                : "No comparisons available"
              }
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredComparisons.map((comparison, index) => (
              <ComparisonCard
                key={`${comparison.element1.idug}-${comparison.element2.idug}`}
                comparison={comparison}
                onDecision={handleComparison}
                readonly={readonly || comparison.isCompleted}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ComparisonCardProps {
  comparison: {
    element1: DecisionMakingElement
    element2: DecisionMakingElement
    isCompleted: boolean
    currentValue?: 'YES' | 'NO'
  }
  onDecision: (element1Id: string, element2Id: string, decision: 'YES' | 'NO') => void
  readonly?: boolean
  highlighted?: boolean
  index?: number
}

function ComparisonCard({ 
  comparison, 
  onDecision, 
  readonly = false, 
  highlighted = false,
  index 
}: ComparisonCardProps) {
  const { element1, element2, isCompleted, currentValue } = comparison

  return (
    <Card className={`${highlighted ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Comparison Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {index && (
                <Badge variant="outline" className="text-xs">
                  {index}
                </Badge>
              )}
              <span className="font-medium">
                {highlighted ? 'Current Comparison' : 'Element Comparison'}
              </span>
            </div>
            {isCompleted && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>

          {/* Question Framework */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Decision Question:</p>
            <p className="text-sm text-gray-600">
              "If you have <strong>{element1.displayName}</strong> but don't have{" "}
              <strong>{element2.displayName}</strong>, would the decision be YES or NO?"
            </p>
          </div>

          {/* Elements Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{element1.displayName}</span>
                {element1.dominantElementItIS && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-gray-600">{element1.description}</p>
              {element1.dominanceFactor > 0 && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Dominance: {element1.dominanceFactor}
                </Badge>
              )}
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">{element2.displayName}</span>
                {element2.dominantElementItIS && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-gray-600">{element2.description}</p>
              {element2.dominanceFactor > 0 && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Dominance: {element2.dominanceFactor}
                </Badge>
              )}
            </div>
          </div>

          {/* Decision Buttons */}
          {!readonly && (
            <div className="flex gap-2 justify-center">
              <Button
                variant={currentValue === 'YES' ? "default" : "outline"}
                onClick={() => onDecision(element1.idug, element2.idug, 'YES')}
                className="gap-2 flex-1"
              >
                <Check className="h-4 w-4" />
                YES - Choose {element1.displayName}
              </Button>
              <Button
                variant={currentValue === 'NO' ? "destructive" : "outline"}
                onClick={() => onDecision(element1.idug, element2.idug, 'NO')}
                className="gap-2 flex-1"
              >
                <X className="h-4 w-4" />
                NO - Choose {element2.displayName}
              </Button>
            </div>
          )}

          {/* Current Decision Display */}
          {readonly && isCompleted && currentValue && (
            <div className="text-center">
              <Badge 
                variant={currentValue === 'YES' ? "default" : "destructive"}
                className="gap-1"
              >
                {currentValue === 'YES' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                Decision: {currentValue} - {currentValue === 'YES' ? element1.displayName : element2.displayName}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
