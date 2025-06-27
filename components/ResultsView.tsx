"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type DigitalModel, isDecisionMakingModel, isPerformanceReviewModel, type DigitalElement } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react"

interface ResultsViewProps {
  model: DigitalModel
}

export default function ResultsView({ model }: ResultsViewProps) {
  const isDecision = isDecisionMakingModel(model)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{model.digitalTopic}</h2>
        <p className="text-muted-foreground">
          {isDecision
            ? "Results: Visualizing element dominance and hierarchy."
            : "Results: Review the prioritized performance dashboard."}
        </p>
      </div>

      {isDecision ? <DecisionDashboard model={model} /> : <PerformanceDashboard model={model} />}
    </div>
  )
}

// Component for Decision Making Model (Type 1)
const DecisionDashboard = ({ model }: { model: DigitalModel }) => {
  const chartData = useMemo(() => {
    return [...model.model].sort((a, b) => a.dominanceFactor - b.dominanceFactor).map((el) => ({
      name: el.displayName,
      Dominance: el.dominanceFactor,
    }))
  }, [model])

  const rankedElements = useMemo(() => {
    return [...model.model].sort((a, b) => b.dominanceFactor - a.dominanceFactor)
  }, [model])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Element Dominance Chart</CardTitle>
          <CardDescription>Visual representation of each element's calculated importance.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(400, model.model.length * 40)}>
            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} interval={0} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="Dominance" fill="hsl(var(--primary))">
                <LabelList dataKey="Dominance" position="right" className="fill-foreground" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dominant Mandatory Factors</CardTitle>
          <CardDescription>Elements ranked by their dominance factor.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {rankedElements.map((el, index) => (
              <li
                key={el.idug}
                className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center">
                  <span className="w-6 text-center text-muted-foreground mr-2">{index + 1}.</span>
                  <span className="font-medium">{el.displayName}</span>
                </div>
                <Badge variant="secondary">{el.dominanceFactor}</Badge>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

// Component for Performance Review Model (Type 2)
const PerformanceDashboard = ({ model }: { model: DigitalModel }) => {
  const sortedElements = useMemo(() => {
    return [...model.model].sort((a, b) => {
      const aIsUnacceptable = a.twoFlagAnswered && !a.twoFlag
      const bIsUnacceptable = b.twoFlagAnswered && !b.twoFlag
      if (aIsUnacceptable && !bIsUnacceptable) return -1
      if (!aIsUnacceptable && bIsUnacceptable) return 1

      const aTrend = a.threeFlagAnswered ? a.threeFlag : 0
      const bTrend = b.threeFlagAnswered ? b.threeFlag : 0
      if (aTrend !== bTrend) return aTrend - bTrend

      return 0
    })
  }, [model])

  const TrendIndicator = ({ element }: { element: DigitalElement }) => {
    if (!element.threeFlagAnswered) return <span className="text-muted-foreground">-</span>
    if (element.threeFlag === 1)
      return (
        <span className="text-green-600 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" /> Improving
        </span>
      )
    if (element.threeFlag === -1)
      return (
        <span className="text-red-600 flex items-center">
          <TrendingDown className="w-4 h-4 mr-1" /> Declining
        </span>
      )
    return (
      <span className="text-yellow-600 flex items-center">
        <Minus className="w-4 h-4 mr-1" /> Stable
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prioritized Action List</CardTitle>
        <CardDescription>
          Items are prioritized by their status (Unacceptable first) and then by their performance trend (Declining
          first).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedElements.map((el) => (
            <div key={el.idug} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{el.displayName}</p>
                <p className="text-xs text-muted-foreground">{el.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                {el.twoFlagAnswered ? (
                  !el.twoFlag ? (
                    <Badge variant="destructive">Unacceptable</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      Acceptable
                    </Badge>
                  )
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
                <TrendIndicator element={el} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
