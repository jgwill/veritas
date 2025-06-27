import { type NextRequest, NextResponse } from "next/server"

// Mock data storage
const models: any[] = []

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const modelId = params.id

    // Find the model
    const modelIndex = models.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    const model = models[modelIndex]

    // Recalculate dominance factors
    model.model.forEach((element: any) => {
      element.dominanceFactor = Object.values(element.comparationTableData).filter((val: any) => val === 1).length
    })

    // Update dominant element flags
    const maxDominance = Math.max(...model.model.map((el: any) => el.dominanceFactor))
    model.model.forEach((element: any) => {
      element.dominantElementItIS = element.dominanceFactor === maxDominance && maxDominance > 0
    })

    // Check if all comparisons are complete
    const totalElements = model.model.length
    const totalComparisons = (totalElements * (totalElements - 1)) / 2
    const completedComparisons =
      model.model.reduce((sum: number, element: any) => {
        return sum + Object.values(element.comparationTableData).filter((val: any) => val !== 0).length
      }, 0) / 2

    // Update model status
    model.decided = completedComparisons === totalComparisons
    model.valid = true
    model.hasIssue = false

    return NextResponse.json(model)
  } catch (error) {
    console.error("Error calculating dominance:", error)
    return NextResponse.json({ error: "Failed to calculate dominance" }, { status: 500 })
  }
}
