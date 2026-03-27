import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

// GET - List all models for user
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const models = await sql`
      SELECT id, name, description, model_type, is_archived, template_id, created_at, updated_at
      FROM models
      WHERE user_id = ${user.id} AND is_archived = false
      ORDER BY updated_at DESC
    `
    
    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

// POST - Create a new model
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { name, description, modelType, modelData, templateId } = await request.json()
    
    if (!name || !modelType || !modelData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const models = await sql`
      INSERT INTO models (user_id, template_id, name, description, model_type, model_data)
      VALUES (${user.id}, ${templateId || null}, ${name}, ${description || null}, ${modelType}, ${JSON.stringify(modelData)})
      RETURNING id, user_id, template_id, name, description, model_type, model_data, is_archived, created_at, updated_at
    `
    
    return NextResponse.json({ model: models[0] })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
}
