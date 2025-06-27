// TandT Individual Model API - Type-Safe Model Operations

import { NextRequest, NextResponse } from "next/server"
import { 
  getModelById, 
  addElementToModel,
  evaluateElementAcceptability,
  evaluateElementPerformance,
  processComparison,
  calculateDominanceFactors,
  getModelStats
} from "@/lib/models"
import { 
  isDecisionMakingModel,
  isPerformanceReviewModel
} from "@/lib/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const model = getModelById(params.id)
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    const modelWithStats = {
      ...model,
      stats: getModelStats(model)
    }

    return NextResponse.json(modelWithStats)
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    const model = getModelById(params.id)
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    let updatedModel

    switch (action) {
      case 'addElement':
        const { nameElement, displayName, description } = body
        if (!nameElement || !displayName) {
          return NextResponse.json(
            { error: 'nameElement and displayName are required' },
            { status: 400 }
          )
        }
        updatedModel = addElementToModel(params.id, nameElement, displayName, description || '')
        break

      case 'evaluateAcceptability':
        const { elementId, isAcceptable } = body
        if (!elementId || typeof isAcceptable !== 'boolean') {
          return NextResponse.json(
            { error: 'elementId and isAcceptable (boolean) are required' },
            { status: 400 }
          )
        }
        updatedModel = evaluateElementAcceptability(params.id, elementId, isAcceptable)
        break

      case 'evaluatePerformance':
        if (!isPerformanceReviewModel(model)) {
          return NextResponse.json(
            { error: 'Performance evaluation only available for Performance Review models' },
            { status: 400 }
          )
        }
        const { elementId: perfElementId, performanceTrend } = body
        if (!perfElementId || typeof performanceTrend !== 'number' || ![-1, 0, 1].includes(performanceTrend)) {
          return NextResponse.json(
            { error: 'elementId and performanceTrend (-1, 0, or 1) are required' },
            { status: 400 }
          )
        }
        updatedModel = evaluateElementPerformance(params.id, perfElementId, performanceTrend)
        break

      case 'processComparison':
        if (!isDecisionMakingModel(model)) {
          return NextResponse.json(
            { error: 'Pairwise comparison only available for Decision Making models' },
            { status: 400 }
          )
        }
        const { element1Id, element2Id, decisionValue } = body
        if (!element1Id || !element2Id || !decisionValue || !['YES', 'NO'].includes(decisionValue)) {
          return NextResponse.json(
            { error: 'element1Id, element2Id, and decisionValue (YES/NO) are required' },
            { status: 400 }
          )
        }
        updatedModel = processComparison(params.id, element1Id, element2Id, decisionValue)
        break

      case 'calculateDominance':
        if (!isDecisionMakingModel(model)) {
          return NextResponse.json(
            { error: 'Dominance calculation only available for Decision Making models' },
            { status: 400 }
          )
        }
        updatedModel = calculateDominanceFactors(params.id)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: addElement, evaluateAcceptability, evaluatePerformance, processComparison, calculateDominance' },
          { status: 400 }
        )
    }

    const modelWithStats = {
      ...updatedModel,
      stats: getModelStats(updatedModel)
    }

    return NextResponse.json(modelWithStats)
  } catch (error) {
    console.error('Error processing model action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
