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

// PUT - Update a note
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { noteId } = await params
    const { title, content, isPinned, noteType } = await request.json()
    
    const notes = await sql`
      UPDATE scratchpad_notes
      SET 
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        is_pinned = COALESCE(${isPinned}, is_pinned),
        note_type = COALESCE(${noteType}, note_type),
        updated_at = NOW()
      WHERE id = ${noteId} AND user_id = ${user.id}
      RETURNING id, model_id, title, content, element_id, note_type, is_pinned, created_at, updated_at
    `
    
    if (notes.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    return NextResponse.json({ note: notes[0] })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { noteId } = await params
    
    await sql`
      DELETE FROM scratchpad_notes WHERE id = ${noteId} AND user_id = ${user.id}
    `
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
