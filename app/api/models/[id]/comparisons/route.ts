import { type NextRequest, NextResponse } from "next/server"

// Mock data storage
const models: any[] = []

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id
    const body = await request.json()
    const { element1Id, element2Id, value } = body

    // Find the model
    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Find both elements
    const element1Index = models[modelIndex].model.findIndex((el: any) => el.idug === element1Id)
    const element2Index = models[modelIndex].model.findIndex((el: any) => el.idug === element2Id)

    if (element1Index === -1 || element2Index === -1) {
      return NextResponse.json({ error: "Element not found" }, { status: 404 })
    }

    // Update comparison values (symmetric)
    models[modelIndex].model[element1Index].comparationTableData[element2Id] = value
    models[modelIndex].model[element2Index].comparationTableData[element1Id] = -value

    // Recalculate dominance factors
    models[modelIndex].model.forEach((element: any) => {
      element.dominanceFactor = Object.values(element.comparationTableData).filter((val: any) => val === 1).length
    })

    // Update dominant element flags
    const maxDominance = Math.max(...models[modelIndex].model.map((el: any) => el.dominanceFactor))
    models[modelIndex].model.forEach((element: any) => {
      element.dominantElementItIS = element.dominanceFactor === maxDominance && maxDominance > 0
    })

    // Check if comparisons are complete for each element
    models[modelIndex].model.forEach((element: any) => {
      const totalComparisons = models[modelIndex].model.length - 1
      const completedComparisons = Object.values(element.comparationTableData).filter((val: any) => val !== 0).length
      element.comparationCompleted = completedComparisons === totalComparisons
    })

    return NextResponse.json(models[modelIndex])
  } catch (error) {
    console.error("Error saving comparison:", error)
    return NextResponse.json({ error: "Failed to save comparison" }, { status: 500 })
  }
}
