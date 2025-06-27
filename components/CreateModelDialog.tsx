"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, TrendingUp, Crown, Users } from "lucide-react"
import { DigitalThinkingModelType, type CreateModelRequest } from "@/lib/types"

interface CreateModelDialogProps {
  onCreateModel: (model: CreateModelRequest) => Promise<any>
  isLoading?: boolean
}

export default function CreateModelDialog({ onCreateModel, isLoading }: CreateModelDialogProps) {
  const [open, setOpen] = useState(false)
  const [modelName, setModelName] = useState("")
  const [digitalTopic, setDigitalTopic] = useState("")
  const [note, setNote] = useState("")
  const [selectedType, setSelectedType] = useState<DigitalThinkingModelType | null>(null)
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!modelName.trim() || !digitalTopic.trim() || selectedType === null) {
      return
    }

    setCreating(true)

    try {
      const createRequest: CreateModelRequest = {
        modelName: modelName.trim(),
        digitalTopic: digitalTopic.trim(),
        digitalThinkingModelType: selectedType,
        note: note.trim(),
      }

      await onCreateModel(createRequest)

      // Reset form
      setModelName("")
      setDigitalTopic("")
      setNote("")
      setSelectedType(null)
      setOpen(false)
    } catch (error) {
      console.error("Error creating model:", error)
    } finally {
      setCreating(false)
    }
  }

  const modelTypes = [
    {
      type: DigitalThinkingModelType.DECISION_MAKING,
      title: "Decision Making Model",
      description: "Binary decision analysis for YES/NO scenarios requiring element hierarchy determination",
      icon: <Target className="h-5 w-5" />,
      features: [
        "Pairwise element comparisons",
        "Dominance factor calculations",
        "Element hierarchy ranking",
        "Binary acceptability evaluation",
        "YES/NO decision output",
      ],
      useCases: ["Housing decisions", "Investment choices", "Strategic planning", "Hiring decisions"],
      badge: "Decision",
      color: "blue",
    },
    {
      type: DigitalThinkingModelType.PERFORMANCE_REVIEW,
      title: "Performance Review Model",
      description: "Performance tracking and trend analysis over time without dominance calculations",
      icon: <TrendingUp className="h-5 w-5" />,
      features: [
        "Performance trend tracking",
        "Priority identification",
        "Binary acceptability evaluation",
        "Performance dashboard output",
        "No pairwise comparisons",
      ],
      useCases: [
        "Employee performance reviews",
        "Project health monitoring",
        "System metrics tracking",
        "Business performance assessment",
      ],
      badge: "Performance",
      color: "green",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Model
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New TandT Model</DialogTitle>
          <DialogDescription>
            Choose a model type and provide basic information to get started with your thinking framework.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Model Type</Label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {modelTypes.map((modelType) => (
                <Card
                  key={modelType.type}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === modelType.type ? "ring-2 ring-primary border-primary" : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedType(modelType.type)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {modelType.icon}
                        <CardTitle className="text-lg">{modelType.title}</CardTitle>
                      </div>
                      <Badge variant={modelType.color === "blue" ? "default" : "secondary"}>{modelType.badge}</Badge>
                    </div>
                    <CardDescription className="text-sm">{modelType.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Key Features
                      </h4>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {modelType.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Use Cases
                      </h4>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {modelType.useCases.map((useCase, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedType === null && (
              <p className="text-sm text-muted-foreground">Please select a model type to continue.</p>
            )}
          </div>

          {/* Model Information */}
          {selectedType !== null && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Model Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelName">Model Name *</Label>
                  <Input
                    id="modelName"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g., Housing Decision v1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digitalTopic">Digital Topic *</Label>
                  <Input
                    id="digitalTopic"
                    value={digitalTopic}
                    onChange={(e) => setDigitalTopic(e.target.value)}
                    placeholder="e.g., Find suitable living space"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional description or notes about this model..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="border-t pt-6">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!modelName.trim() || !digitalTopic.trim() || selectedType === null || creating || isLoading}
          >
            {creating || isLoading ? "Creating..." : "Create Model"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
