import { type NextRequest, NextResponse } from "next/server"

// Mock data storage
const models: any[] = []

export async function PUT(request: NextRequest, { params }: { params: { id: string; elementId: string } }) {
  try {
    const { id: modelId, elementId } = params
    const body = await request.json()

    // Find the model
    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Find the element
    const elementIndex = models[modelIndex].model.findIndex((el: any) => el.idug === elementId)
    if (elementIndex === -1) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 })
    }

    // Update element
    models[modelIndex].model[elementIndex] = {
      ...models[modelIndex].model[elementIndex],
      ...body,
    }

    return NextResponse.json(models[modelIndex])
  } catch (error) {
    console.error("Error updating element:", error)
    return NextResponse.json({ error: "Failed to update element" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; elementId: string } }) {
  try {
    const { id: modelId, elementId } = params

    // Find the model
    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Find the element
    const elementIndex = models[modelIndex].model.findIndex((el: any) => el.idug === elementId)
    if (elementIndex === -1) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 })
    }

    // Remove element from all comparison tables
    models[modelIndex].model.forEach((element: any) => {
      delete element.comparationTableData[elementId]
    })

    // Remove the element
    models[modelIndex].model.splice(elementIndex, 1)

    return NextResponse.json(models[modelIndex])
  } catch (error) {
    console.error("Error deleting element:", error)
    return NextResponse.json({ error: "Failed to delete element" }, { status: 500 })
  }
}
