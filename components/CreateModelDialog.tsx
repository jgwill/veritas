"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type CreateModelRequest, DigitalThinkingModelType } from "@/lib/types"
import { createModel } from "@/lib/actions"
import { Target, TrendingUp, Loader2 } from "lucide-react"

interface CreateModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onModelCreated: () => void
}

export function CreateModelDialog({ open, onOpenChange, onModelCreated }: CreateModelDialogProps) {
  const [formData, setFormData] = useState<CreateModelRequest>({
    modelName: "",
    digitalTopic: "",
    digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING,
    note: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createModel(formData)
      if (result.success) {
        onModelCreated()
        resetForm()
      } else {
        setError(result.error || "Failed to create model")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      modelName: "",
      digitalTopic: "",
      digitalThinkingModelType: DigitalThinkingModelType.DECISION_MAKING,
      note: "",
    })
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Digital Thinking Model</DialogTitle>
          <DialogDescription>Choose the type of model that best fits your analysis needs</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Model Type</Label>
            <RadioGroup
              value={formData.digitalThinkingModelType.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  digitalThinkingModelType: Number.parseInt(value) as DigitalThinkingModelType,
                }))
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    formData.digitalThinkingModelType === DigitalThinkingModelType.DECISION_MAKING
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={DigitalThinkingModelType.DECISION_MAKING.toString()}
                        id="decision-making"
                      />
                      <Label htmlFor="decision-making" className="flex items-center gap-2 cursor-pointer">
                        <Target className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-blue-800">Digital Decision Making</CardTitle>
                      </Label>
                    </div>
                    <CardDescription>For binary YES/NO decisions with element hierarchy analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Binary acceptability evaluation (1/0)</li>
                      <li>• Pairwise element comparisons</li>
                      <li>• Dominance factor calculations</li>
                      <li>• Decision recommendation with confidence</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    formData.digitalThinkingModelType === DigitalThinkingModelType.PERFORMANCE_REVIEW
                      ? "ring-2 ring-green-500 bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={DigitalThinkingModelType.PERFORMANCE_REVIEW.toString()}
                        id="performance-review"
                      />
                      <Label htmlFor="performance-review" className="flex items-center gap-2 cursor-pointer">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-800">Digital Performance Review</CardTitle>
                      </Label>
                    </div>
                    <CardDescription>For continuous performance tracking and improvement analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Acceptability + performance trend tracking</li>
                      <li>• Historical performance data</li>
                      <li>• Improvement/decline identification</li>
                      <li>• Performance dashboard and recommendations</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modelName">Model Name *</Label>
              <Input
                id="modelName"
                value={formData.modelName}
                onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
                placeholder="e.g., Housing Decision Model"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="digitalTopic">Digital Topic *</Label>
              <Input
                id="digitalTopic"
                value={formData.digitalTopic}
                onChange={(e) => setFormData((prev) => ({ ...prev, digitalTopic: e.target.value }))}
                placeholder="e.g., Choosing the right apartment"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Additional context or requirements for this model..."
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.modelName || !formData.digitalTopic}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Model"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
