"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"

import { type DigitalModel, type DigitalElement, isDecisionMakingModel, DecisionMakingElement, isPerformanceReviewModel, PerformanceReviewElement } from "@/lib/types"
import ElementCard from "@/components/cards/ElementCard"
import ComparisonModal from "@/components/ComparisonModal"
import EditElementDialog from "@/components/EditElementDialog"
import { ModelMode } from "@/lib/constants"

interface ElementManagerProps {
  model: DigitalModel
  onModelUpdate: (updates: Partial<DigitalModel>) => void
}

const GeminiAssistant = dynamic(() => import("@/components/GeminiAssistant"), { ssr: false })

export default function ElementManager({ model, onModelUpdate }: ElementManagerProps) {
  const [editingElement, setEditingElement] = useState<DigitalElement | null>(null)
  const [comparingElement, setComparingElement] = useState<DecisionMakingElement | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [elementToEdit, setElementToEdit] = useState<DigitalElement | null>(null)

  const handleUpdateElement = async (element: DigitalElement, updates: Partial<DigitalElement>) => {
    // Optimistic UI update
    const originalModel = { ...model }
    const updatedElements = model.model.map((el) => (el.idug === element.idug ? { ...el, ...updates } : el))
    onModelUpdate({ ...model, model: updatedElements })

    // API call
    try {
      const response = await fetch(`/api/models/${model.id}/elements/${element.idug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        onModelUpdate(originalModel) // Revert on failure
      } else {
        const finalModel = await response.json()
        onModelUpdate(finalModel) // Sync with server state
      }
    } catch (error) {
      console.error("Error updating element:", error)
      onModelUpdate(originalModel)
    }
  }

  const handleStartCompare = (element: DigitalElement) => {
    if (isDecisionMakingModel(model)) {
      setComparingElement(element as DecisionMakingElement)
    }
  }

  const handleComparisonComplete = async (
    baseElement: DecisionMakingElement,
    results: Record<string, number>,
  ) => {
    setComparingElement(null)
    setLoading(true)

    // In a real app, this logic would likely live in a backend service
    // For now, mimic the logic of updating all related elements
    let updatedModel = { ...model }
    for (const otherId of Object.keys(results)) {
      const value = results[otherId]
      const response = await fetch(`/api/models/${model.id}/comparisons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          element1Id: baseElement.idug,
          element2Id: otherId,
          value: value,
        }),
      })
      if (response.ok) {
        updatedModel = await response.json()
      }
    }
    onModelUpdate({ model: updatedModel.model as DigitalElement[] })
    setLoading(false)
  }

  const handleAddElementFromSuggestion = async (el: { nameElement: string; displayName: string; description: string }) => {
    try {
      const response = await fetch(`/api/models/${model.id}/elements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(el),
      })
      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate({ model: updatedModel.model as DigitalElement[] })
      }
    } catch (error) {
      console.error("Error adding suggested element:", error)
    }
  }

  const handleOpenEditModal = (element: DigitalElement) => {
    setElementToEdit(element)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setElementToEdit(null)
    setEditModalOpen(false)
  }

  const handleSaveElement = (updatedElement: DigitalElement) => {
    const updatedElements = model.model.map((el) => (el.idug === updatedElement.idug ? updatedElement : el))
    onModelUpdate({ model: updatedElements as DigitalElement[] })
    handleCloseEditModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Elements</h2>
          <p className="text-muted-foreground">
            {isDecisionMakingModel(model)
              ? "Build your dominance hierarchy. Click 'Compare' on an element to begin."
              : "Define the elements you want to evaluate in your performance review."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Element
          </Button>
          <GeminiAssistant
            onAddElements={(elements) => {
              elements.forEach(async (el) => {
                await handleAddElementFromSuggestion(el)
              })
            }}
          />
        </div>
      </div>

      {showNewForm && (
        <NewElementForm
          onAdd={(newElement) => {
            handleAddElementFromSuggestion(newElement)
            setShowNewForm(false)
          }}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {model.model.map((element) => (
          <ElementCard
            key={element.idug}
            element={element}
            mode={ModelMode.EDITING}
            modelType={model.digitalThinkingModelType}
            onCompare={handleStartCompare}
            onEdit={handleOpenEditModal}
            onUpdate={handleUpdateElement}
            isComparing={comparingElement?.idug === element.idug}
          />
        ))}
      </div>

      {isDecisionMakingModel(model) && (
        <ComparisonModal
          isOpen={!!comparingElement}
          onClose={() => setComparingElement(null)}
          comparingElement={comparingElement}
          otherElements={model.model.filter((el) => el.idug !== comparingElement?.idug) as DecisionMakingElement[]}
          onComplete={handleComparisonComplete}
        />
      )}

      <EditElementDialog
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        element={elementToEdit}
        onSave={handleSaveElement}
      />
    </div>
  )
}

// Sub-component for the new element form to keep the main component cleaner
function NewElementForm({
  onAdd,
  onCancel,
}: {
  onAdd: (element: { nameElement: string; displayName: string; description: string; question: boolean }) => void
  onCancel: () => void
}) {
  const [newElement, setNewElement] = useState({
    nameElement: "",
    displayName: "",
    description: "",
    question: false,
  })

  const handleAdd = () => {
    if (!newElement.displayName.trim()) {
      alert("Display Name is required.")
      return
    }
    // Auto-generate nameElement if empty
    const finalElement = {
      ...newElement,
      nameElement: newElement.nameElement.trim() || newElement.displayName.replace(/\s+/g, ""),
    }
    onAdd(finalElement)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Element</CardTitle>
        <CardDescription>Create a new decision factor or criterion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={newElement.displayName}
              onChange={(e) => setNewElement((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., Kitchen Functionality"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameElement">Element Name (auto-generated if blank)</Label>
            <Input
              id="nameElement"
              value={newElement.nameElement}
              onChange={(e) => setNewElement((prev) => ({ ...prev, nameElement: e.target.value }))}
              placeholder="e.g., KitchenFunctionality"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newElement.description}
            onChange={(e) => setNewElement((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this element in detail..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="question"
            checked={newElement.question}
            onCheckedChange={(checked) => setNewElement((prev) => ({ ...prev, question: checked }))}
          />
          <Label htmlFor="question">Mark as Question</Label>
        </div>

        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            <Save className="w-4 h-4 mr-2" />
            Add Element
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
