"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Minus } from "lucide-react"

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

interface ComparisonMatrixProps {
  model: DigitalModel
  onModelUpdate: (model: DigitalModel) => void
}

interface ComparisonPair {
  element1: DigitalElement
  element2: DigitalElement
  value: number
  completed: boolean
}

export default function ComparisonMatrix({ model, onModelUpdate }: ComparisonMatrixProps) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [comparisonPairs, setComparisonPairs] = useState<ComparisonPair[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateComparisonPairs()
  }, [model])

  const generateComparisonPairs = () => {
    const pairs: ComparisonPair[] = []
    const elements = model.model

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const element1 = elements[i]
        const element2 = elements[j]
        const value = element1.comparationTableData[element2.idug] || 0

        pairs.push({
          element1,
          element2,
          value,
          completed: value !== 0,
        })
      }
    }

    setComparisonPairs(pairs)

    // Find first incomplete comparison
    const firstIncomplete = pairs.findIndex((pair) => !pair.completed)
    if (firstIncomplete !== -1) {
      setCurrentPairIndex(firstIncomplete)
    }
  }

  const handleComparison = async (value: number) => {
    const currentPair = comparisonPairs[currentPairIndex]
    if (!currentPair) return

    setLoading(true)
    try {
      const response = await fetch(`/api/models/${model.id}/comparisons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          element1Id: currentPair.element1.idug,
          element2Id: currentPair.element2.idug,
          value: value,
        }),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)

        // Move to next incomplete comparison
        const nextIncomplete = comparisonPairs.findIndex((pair, index) => index > currentPairIndex && !pair.completed)
        if (nextIncomplete !== -1) {
          setCurrentPairIndex(nextIncomplete)
        } else {
          // All comparisons complete, calculate dominance
          await calculateDominance()
        }
      } else {
        throw new Error("Failed to save comparison")
      }
    } catch (error) {
      console.error("Error saving comparison:", error)
      alert("Failed to save comparison. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const calculateDominance = async () => {
    try {
      const response = await fetch(`/api/models/${model.id}/calculate`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      }
    } catch (error) {
      console.error("Error calculating dominance:", error)
    }
  }

  const getCompletionStats = () => {
    const completed = comparisonPairs.filter((pair) => pair.completed).length
    const total = comparisonPairs.length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }

  const getComparisonIcon = (value: number) => {
    switch (value) {
      case 1:
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case -1:
        return <Circle className="w-4 h-4 text-red-600" />
      case 0:
        return <Minus className="w-4 h-4 text-gray-400" />
      default:
        return <Circle className="w-4 h-4 text-gray-300" />
    }
  }

  if (model.model.length < 2) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Circle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Need More Elements</h3>
          <p className="text-muted-foreground">Add at least 2 elements to start making comparisons.</p>
        </CardContent>
      </Card>
    )
  }

  const stats = getCompletionStats()
  const currentPair = comparisonPairs[currentPairIndex]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Pairwise Comparisons</h2>
        <p className="text-muted-foreground">Compare each element against others to determine relative importance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>
            {stats.completed} of {stats.total} comparisons completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={stats.percentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">{Math.round(stats.percentage)}% complete</p>
        </CardContent>
      </Card>

      {stats.completed < stats.total && currentPair && (
        <Card>
          <CardHeader>
            <CardTitle>Current Comparison</CardTitle>
            <CardDescription>
              Comparison {currentPairIndex + 1} of {stats.total}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 text-center p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{currentPair.element1.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{currentPair.element1.description}</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">VS</div>
                </div>

                <div className="flex-1 text-center p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{currentPair.element2.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{currentPair.element2.description}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Which element is more important or dominant?</p>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => handleComparison(1)}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 max-w-xs"
                  >
                    {currentPair.element1.displayName} Dominates
                  </Button>

                  <Button onClick={() => handleComparison(0)} disabled={loading} variant="outline" className="px-8">
                    Equal
                  </Button>

                  <Button
                    onClick={() => handleComparison(-1)}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 max-w-xs"
                  >
                    {currentPair.element2.displayName} Dominates
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comparison Matrix</CardTitle>
          <CardDescription>Overview of all pairwise comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left border-b">Element</th>
                  {model.model.map((element) => (
                    <th key={element.idug} className="p-2 text-center border-b text-xs">
                      {element.displayName.substring(0, 10)}...
                    </th>
                  ))}
                  <th className="p-2 text-center border-b">Dominance</th>
                </tr>
              </thead>
              <tbody>
                {model.model.map((element1) => (
                  <tr key={element1.idug}>
                    <td className="p-2 border-b font-medium">
                      <div className="flex items-center gap-2">
                        {element1.displayName}
                        {element1.dominantElementItIS && (
                          <Badge variant="default" className="text-xs">
                            Dom
                          </Badge>
                        )}
                      </div>
                    </td>
                    {model.model.map((element2) => (
                      <td key={element2.idug} className="p-2 text-center border-b">
                        {element1.idug === element2.idug ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          getComparisonIcon(element1.comparationTableData[element2.idug] || 0)
                        )}
                      </td>
                    ))}
                    <td className="p-2 text-center border-b font-bold">{element1.dominanceFactor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {stats.completed === stats.total && stats.total > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">All Comparisons Complete!</h3>
                <p className="text-sm text-green-700">You can now view the results and rankings in the Results tab.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
