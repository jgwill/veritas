import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

// GET - Get a specific model
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const models = await sql`
      SELECT id, user_id, template_id, name, description, model_type, model_data, is_archived, created_at, updated_at
      FROM models
      WHERE id = ${id} AND user_id = ${user.id}
    `
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }
    
    return NextResponse.json({ model: models[0] })
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 })
  }
}

// PUT - Update a model
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const { name, description, modelData, isArchived } = await request.json()
    
    // Verify ownership
    const existing = await sql`
      SELECT id FROM models WHERE id = ${id} AND user_id = ${user.id}
    `
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }
    
    const models = await sql`
      UPDATE models
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        model_data = COALESCE(${modelData ? JSON.stringify(modelData) : null}, model_data),
        is_archived = COALESCE(${isArchived}, is_archived),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id, user_id, template_id, name, description, model_type, model_data, is_archived, created_at, updated_at
    `
    
    return NextResponse.json({ model: models[0] })
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 })
  }
}

// DELETE - Delete a model
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    await sql`
      DELETE FROM models WHERE id = ${id} AND user_id = ${user.id}
    `
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
  }
}
