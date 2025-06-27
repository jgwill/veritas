import { type NextRequest, NextResponse } from "next/server"

// This would be replaced with actual database operations
const models: any[] = []

export async function POST(request: NextRequest, { params }: { params: { id: string; elementId: string } }) {
  try {
    const modelId = params.id
    const elementId = params.elementId
    const body = await request.json()

    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const model = models[modelIndex]
    const elementIndex = model.model.findIndex((el: any) => el.idug === elementId)
    if (elementIndex === -1) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 })
    }

    // Update element evaluation
    const element = model.model[elementIndex]

    // Update binary evaluation (twoFlag)
    if (body.hasOwnProperty("twoFlag")) {
      element.twoFlag = body.twoFlag
      element.twoFlagAnswered = body.twoFlagAnswered || true
    }

    // Update performance evaluation (threeFlag) - only for Performance Review models
    if (body.hasOwnProperty("threeFlag") && !model.twoOnly) {
      element.threeFlag = body.threeFlag
      element.threeFlagAnswered = body.threeFlagAnswered || true
    }

    // Update element status
    element.status = 3 // Evaluated status

    // Save the updated model
    models[modelIndex] = model

    return NextResponse.json(model)
  } catch (error) {
    console.error("Error updating element evaluation:", error)
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 })
  }
}
