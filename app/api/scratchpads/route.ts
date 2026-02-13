import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const sessions = await sql`
    SELECT u.id, u.email, u.display_name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  
  return sessions.length > 0 ? sessions[0] : null;
}

// GET - Get scratchpads for a model or snapshot
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const modelId = searchParams.get('modelId');
    const snapshotId = searchParams.get('snapshotId');
    
    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
    }
    
    let scratchpads;
    
    if (snapshotId) {
      scratchpads = await sql`
        SELECT id, model_id, snapshot_id, content, structuring_insights, created_at, updated_at
        FROM scratchpads
        WHERE user_id = ${user.id} AND model_id = ${modelId} AND snapshot_id = ${snapshotId}
        ORDER BY updated_at DESC
      `;
    } else {
      scratchpads = await sql`
        SELECT id, model_id, snapshot_id, content, structuring_insights, created_at, updated_at
        FROM scratchpads
        WHERE user_id = ${user.id} AND model_id = ${modelId}
        ORDER BY updated_at DESC
      `;
    }
    
    return NextResponse.json({ scratchpads });
  } catch (error) {
    console.error('[v0] Error fetching scratchpads:', error);
    return NextResponse.json({ error: 'Failed to fetch scratchpads' }, { status: 500 });
  }
}

// POST - Create a new scratchpad
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { modelId, snapshotId, content, structuringInsights } = body;
    
    if (!modelId || !content) {
      return NextResponse.json(
        { error: 'modelId and content are required' },
        { status: 400 }
      );
    }
    
    const scratchpads = await sql`
      INSERT INTO scratchpads (user_id, model_id, snapshot_id, content, structuring_insights)
      VALUES (
        ${user.id},
        ${modelId},
        ${snapshotId || null},
        ${content},
        ${structuringInsights ? JSON.stringify(structuringInsights) : null}
      )
      RETURNING id, model_id, snapshot_id, content, structuring_insights, created_at, updated_at
    `;
    
    return NextResponse.json({ scratchpad: scratchpads[0] }, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating scratchpad:', error);
    return NextResponse.json({ error: 'Failed to create scratchpad' }, { status: 500 });
  }
}
