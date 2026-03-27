import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

// GET - List all snapshots for a model
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
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
    const user = await getUserFromRequest(request)
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
      INSERT INTO analysis_snapshots (model_id, user_id, snapshot_name, elements_data, summary_notes)
      VALUES (${modelId}, ${user.id}, ${snapshotName || null}, ${JSON.stringify(elementsData)}, ${summaryNotes || null})
      RETURNING id, model_id, snapshot_name, snapshot_date, elements_data, summary_notes, created_at
    `
    
    return NextResponse.json({ snapshot: snapshots[0] })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}
