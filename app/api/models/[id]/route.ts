import { type NextRequest, NextResponse } from "next/server"

// Import the models array from the main route
// In production, this would be replaced with database queries
const models: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const model = models.find((m) => m.id === modelId)

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

    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Update model
    models[modelIndex] = { ...models[modelIndex], ...body }

    return NextResponse.json(models[modelIndex])
  } catch (error) {
    console.error("Error updating model:", error)
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const modelIndex = models.findIndex((m) => m.id === modelId)

    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Remove model
    models.splice(modelIndex, 1)

    return NextResponse.json({ message: "Model deleted successfully" })
  } catch (error) {
    console.error("Error deleting model:", error)
    return NextResponse.json({ error: "Failed to delete model" }, { status: 500 })
  }
}
