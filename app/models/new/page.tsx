"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function NewModel() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    modelName: "",
    digitalTopic: "",
    digitalThinkingModelType: "1",
    twoOnly: true,
    note: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          digitalThinkingModelType: Number.parseInt(formData.digitalThinkingModelType),
        }),
      })

      if (response.ok) {
        const model = await response.json()
        router.push(`/models/${model.id}`)
      } else {
        throw new Error("Failed to create model")
      }
    } catch (error) {
      console.error("Error creating model:", error)
      alert("Failed to create model. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Model</CardTitle>
          <CardDescription>Set up a new decision-making or performance review model</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                value={formData.modelName}
                onChange={(e) => handleInputChange("modelName", e.target.value)}
                placeholder="e.g., HousingDecision2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="digitalTopic">Digital Topic</Label>
              <Input
                id="digitalTopic"
                value={formData.digitalTopic}
                onChange={(e) => handleInputChange("digitalTopic", e.target.value)}
                placeholder="e.g., Choosing the best housing option"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Model Type</Label>
              <RadioGroup
                value={formData.digitalThinkingModelType}
                onValueChange={(value) => handleInputChange("digitalThinkingModelType", value)}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="1" id="decision" />
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <Label htmlFor="decision" className="font-medium">
                        Decision Making
                      </Label>
                      <p className="text-sm text-muted-foreground">Compare options to make a decision</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="2" id="performance" />
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <div>
                      <Label htmlFor="performance" className="font-medium">
                        Performance Review
                      </Label>
                      <p className="text-sm text-muted-foreground">Evaluate performance across multiple criteria</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="twoOnly" className="font-medium">
                  Binary Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use only binary (Yes/No) evaluations instead of tri-state
                </p>
              </div>
              <Switch
                id="twoOnly"
                checked={formData.twoOnly}
                onCheckedChange={(checked) => handleInputChange("twoOnly", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notes (Optional)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                placeholder="Additional notes about this model..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Model"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
