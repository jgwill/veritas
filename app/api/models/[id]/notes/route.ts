import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

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

// GET - List all notes for a model
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: modelId } = await params
    
    // Verify model ownership
    const models = await sql`
      SELECT id FROM models WHERE id = ${modelId} AND user_id = ${user.id}
    `
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }
    
    const notes = await sql`
      SELECT id, model_id, title, content, element_id, note_type, is_pinned, created_at, updated_at
      FROM scratchpad_notes
      WHERE model_id = ${modelId} AND user_id = ${user.id}
      ORDER BY is_pinned DESC, updated_at DESC
    `
    
    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST - Create a new note
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: modelId } = await params
    const { title, content, elementId, noteType } = await request.json()
    
    // Verify model ownership
    const models = await sql`
      SELECT id FROM models WHERE id = ${modelId} AND user_id = ${user.id}
    `
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    
    const notes = await sql`
      INSERT INTO scratchpad_notes (model_id, user_id, title, content, element_id, note_type)
      VALUES (${modelId}, ${user.id}, ${title || null}, ${content}, ${elementId || null}, ${noteType || 'general'})
      RETURNING id, model_id, title, content, element_id, note_type, is_pinned, created_at, updated_at
    `
    
    return NextResponse.json({ note: notes[0] })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
