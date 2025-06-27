import { type NextRequest, NextResponse } from "next/server"
import { getModelById, updateModel, deleteModel } from "@/lib/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const model = getModelById(modelId)

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json(model)
  } catch (error) {
    console.error("Error fetching model:", error)
    return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const body = await request.json()

    const updatedModel = updateModel(modelId, body)

    if (!updatedModel) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json(updatedModel)
  } catch (error) {
    console.error("Error updating model:", error)
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const deleted = deleteModel(modelId)

    if (!deleted) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Model deleted successfully" })
  } catch (error) {
    console.error("Error deleting model:", error)
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 })
  }
}
