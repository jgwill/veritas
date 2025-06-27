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

interface ElementManagerProps {
  model: DigitalModel
  onModelUpdate: (model: DigitalModel) => void
}

export default function ElementManager({ model, onModelUpdate }: ElementManagerProps) {
  const [editingElement, setEditingElement] = useState<string | null>(null)
  const [newElement, setNewElement] = useState({
    nameElement: "",
    displayName: "",
    description: "",
    question: false,
  })
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddElement = async () => {
    if (!newElement.nameElement.trim() || !newElement.displayName.trim()) {
      alert("Please fill in the required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/models/${model.id}/elements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newElement),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
        setNewElement({
          nameElement: "",
          displayName: "",
          description: "",
          question: false,
        })
        setShowNewForm(false)
      } else {
        throw new Error("Failed to add element")
      }
    } catch (error) {
      console.error("Error adding element:", error)
      alert("Failed to add element. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateElement = async (elementId: string, updates: Partial<DigitalElement>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
        setEditingElement(null)
      } else {
        throw new Error("Failed to update element")
      }
    } catch (error) {
      console.error("Error updating element:", error)
      alert("Failed to update element. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteElement = async (elementId: string) => {
    if (!confirm("Are you sure you want to delete this element? This will also remove all its comparisons.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/models/${model.id}/elements/${elementId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedModel = await response.json()
        onModelUpdate(updatedModel)
      } else {
        throw new Error("Failed to delete element")
      }
    } catch (error) {
      console.error("Error deleting element:", error)
      alert("Failed to delete element. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (element: DigitalElement) => {
    if (element.comparationCompleted) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Complete
        </Badge>
      )
    }
    if (element.question) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Question
        </Badge>
      )
    }
    return <Badge variant="outline">Pending</Badge>
  }

  const getEvaluationValue = (element: DigitalElement) => {
    if (model.twoOnly) {
      return element.twoFlagAnswered ? (element.twoFlag ? "Yes" : "No") : "Not Set"
    } else {
      if (!element.threeFlagAnswered) return "Not Set"
      switch (element.threeFlag) {
        case 1:
          return "Getting Better"
        case 0:
          return "Staying Same"
        case -1:
          return "Getting Worse"
        default:
          return "Not Set"
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Elements</h2>
          <p className="text-muted-foreground">Manage the decision factors or criteria for your model</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Element
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Element</CardTitle>
            <CardDescription>Create a new decision factor or criterion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameElement">Element Name *</Label>
                  <Input
                    id="nameElement"
                    value={newElement.nameElement}
                    onChange={(e) => setNewElement((prev) => ({ ...prev, nameElement: e.target.value }))}
                    placeholder="e.g., KitchenFunctionality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={newElement.displayName}
                    onChange={(e) => setNewElement((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Kitchen Functionality"
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

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="question" className="font-medium">
                    Mark as Question
                  </Label>
                  <p className="text-sm text-muted-foreground">This element requires user input or clarification</p>
                </div>
                <Switch
                  id="question"
                  checked={newElement.question}
                  onCheckedChange={(checked) => setNewElement((prev) => ({ ...prev, question: checked }))}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setShowNewForm(false)} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleAddElement} className="flex-1" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Adding..." : "Add Element"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {model.model.map((element) => (
          <Card key={element.idug}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{element.displayName}</h3>
                    {getStatusBadge(element)}
                    {element.dominantElementItIS && <Badge variant="default">Dominant</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {element.description || "No description provided"}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dominance Factor:</span>
                      <div className="font-medium">{element.dominanceFactor}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Evaluation:</span>
                      <div className="font-medium">{getEvaluationValue(element)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="font-medium">
                        {element.status === 1 ? "Active" : element.status === 3 ? "Evaluated" : "Unknown"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Comparisons:</span>
                      <div className="font-medium">
                        {Object.values(element.comparationTableData).filter((v) => v !== 0).length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => setEditingElement(element.idug)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteElement(element.idug)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {model.model.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Elements Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first element to start building your decision model.</p>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Element
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
