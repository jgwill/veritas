import { type NextRequest, NextResponse } from "next/server"
import { getModelById, updateModel } from "@/lib/models"

export async function POST(request: NextRequest, { params }: { params: { id: string; elementId: string } }) {
  try {
    const modelId = params.id
    const elementId = params.elementId
    const body = await request.json()

    const { evaluationType, value } = body

    if (!evaluationType || value === undefined) {
      return NextResponse.json({ error: "Missing evaluation data" }, { status: 400 })
    }

    const model = getModelById(modelId)
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const elementIndex = model.model.findIndex((el) => el.idug === elementId)
    if (elementIndex === -1) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 })
    }

    // Update the element based on evaluation type
    const updatedModel = { ...model }
    const element = { ...updatedModel.model[elementIndex] }

    if (evaluationType === "acceptability") {
      element.twoFlag = Boolean(value)
      element.twoFlagAnswered = true
    } else if (evaluationType === "performance") {
      // Only allow performance evaluation for Performance Review models (type 2)
      if (model.digitalThinkingModelType !== 2) {
        return NextResponse.json({ error: "Performance evaluation not allowed for this model type" }, { status: 400 })
      }
      element.threeFlag = Number(value)
      element.threeFlagAnswered = true
    } else {
      return NextResponse.json({ error: "Invalid evaluation type" }, { status: 400 })
    }

    updatedModel.model[elementIndex] = element

    // Save the updated model
    const savedModel = updateModel(modelId, updatedModel)
    if (!savedModel) {
      return NextResponse.json({ error: "Failed to save model" }, { status: 500 })
    }

    return NextResponse.json(savedModel)
  } catch (error) {
    console.error("Error updating element evaluation:", error)
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 })
  }
}
