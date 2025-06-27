// TandT Models API - Enhanced with Type-Safe Model Management

import { NextRequest, NextResponse } from "next/server"
import { 
  loadModelsFromSamples, 
  createModel, 
  updateModel, 
  deleteModel,
  getModelStats
} from "@/lib/models"
import { 
  CreateModelRequest, 
  DigitalThinkingModelType,
  DigitalModel 
} from "@/lib/types"

export async function GET() {
  try {
    const models = loadModelsFromSamples()
    
    // Add statistics to each model
    const modelsWithStats = models.map(model => ({
      ...model,
      stats: getModelStats(model)
    }))
    
    return NextResponse.json({ 
      models: modelsWithStats,
      total: models.length 
    })
  } catch (error) {
    console.error('Error loading models:', error)
    return NextResponse.json(
      { error: 'Failed to load models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { modelName, digitalTopic, digitalThinkingModelType } = body
    
    if (!modelName || !digitalTopic || digitalThinkingModelType === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: modelName, digitalTopic, digitalThinkingModelType' },
        { status: 400 }
      )
    }

    // Validate model type
    if (!Object.values(DigitalThinkingModelType).includes(digitalThinkingModelType)) {
      return NextResponse.json(
        { error: 'Invalid digitalThinkingModelType. Must be 0 (Decision Making) or 1 (Performance Review)' },
        { status: 400 }
      )
    }

    const createRequest: CreateModelRequest = {
      modelName,
      digitalTopic,
      digitalThinkingModelType,
      note: body.note || ''
    }

    const newModel = createModel(createRequest)
    const modelWithStats = {
      ...newModel,
      stats: getModelStats(newModel)
    }

    return NextResponse.json(modelWithStats, { status: 201 })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    const updatedModel = updateModel(body as DigitalModel)
    const modelWithStats = {
      ...updatedModel,
      stats: getModelStats(updatedModel)
    }

    return NextResponse.json(modelWithStats)
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    const success = deleteModel(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}
