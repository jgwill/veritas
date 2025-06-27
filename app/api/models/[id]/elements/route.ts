import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Mock data storage - in production, use a database
const models: any[] = []

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const body = await request.json()
    const { nameElement, displayName, description, question } = body

    // Find the model
    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Create new element
    const newElement = {
      idug: uuidv4(),
      nameElement,
      displayName,
      description: description || null,
      sortNo: models[modelIndex].model.length,
      status: 1, // Active
      twoFlag: false,
      twoFlagAnswered: false,
      threeFlag: 0,
      threeFlagAnswered: false,
      dominanceFactor: 0,
      dominantElementItIS: false,
      comparationCompleted: false,
      question: question || false,
      comparationTableData: {},
    }

    // Initialize comparison table with existing elements
    models[modelIndex].model.forEach((existingElement: any) => {
      newElement.comparationTableData[existingElement.idug] = 0
      existingElement.comparationTableData[newElement.idug] = 0
    })

    // Add element to model
    models[modelIndex].model.push(newElement)

    return NextResponse.json(models[modelIndex])
  } catch (error) {
    console.error("Error adding element:", error)
    return NextResponse.json({ error: "Failed to add element" }, { status: 500 })
  }
}
