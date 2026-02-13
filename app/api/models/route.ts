import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

// Helper to get user from token
async function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  const sessions = await sql`
    SELECT u.id, u.email, u.display_name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `
  
  return sessions.length > 0 ? sessions[0] : null
}

// GET - List all models for user
export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request)
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
    const user = await getUserFromToken(request)
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
