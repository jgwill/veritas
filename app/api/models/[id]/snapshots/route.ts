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

// GET - List all snapshots for a model
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
    
    const snapshots = await sql`
      SELECT id, model_id, snapshot_name, snapshot_date, elements_data, summary_notes, created_at
      FROM analysis_snapshots
      WHERE model_id = ${modelId} AND user_id = ${user.id}
      ORDER BY snapshot_date DESC
    `
    
    return NextResponse.json({ snapshots })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 })
  }
}

// POST - Create a new snapshot (save current analysis state)
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
    const { snapshotName, elementsData, summaryNotes } = await request.json()
    
    // Verify model ownership
    const models = await sql`
      SELECT id FROM models WHERE id = ${modelId} AND user_id = ${user.id}
    `
    
    if (models.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }
    
    if (!elementsData) {
      return NextResponse.json({ error: 'Elements data is required' }, { status: 400 })
    }
    
    const snapshots = await sql`
      INSERT INTO analysis_snapshots (model_id, user_id, snapshot_name, elements_data, summary_notes, data)
      VALUES (${modelId}, ${user.id}, ${snapshotName || null}, ${JSON.stringify(elementsData)}, ${summaryNotes || null}, ${JSON.stringify(elementsData)})
      RETURNING id, model_id, snapshot_name, snapshot_date, elements_data, summary_notes, created_at
    `
    
    return NextResponse.json({ snapshot: snapshots[0] })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}
