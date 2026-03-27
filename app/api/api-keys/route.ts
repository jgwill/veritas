import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

// Get user from session token (for API key management, we only allow session auth)
async function getUserFromSession(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.substring(7)
  
  // Don't allow API keys to manage API keys
  if (token.startsWith('vk_')) return null
  
  const rows = await sql`
    SELECT u.id, u.email, u.display_name
    FROM sessions s 
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `
  return rows.length > 0 ? rows[0] : null
}

// GET - List all API keys for the user
export async function GET(request: Request) {
  try {
    const user = await getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keys = await sql`
      SELECT id, name, key_prefix, is_active, created_at, last_used_at
      FROM api_keys
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ keys })
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

// POST - Generate a new API key
export async function POST(request: Request) {
  try {
    const user = await getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const name: string = body.name || 'API Key'

    // Generate key: vk_<32 random hex bytes>
    const rawKey = `vk_${randomBytes(32).toString('hex')}`
    const keyPrefix = rawKey.substring(0, 10) // "vk_xxxxxx"
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    
    console.log('[v0] Creating API key for user:', user.id)
    console.log('[v0] Key prefix:', keyPrefix)
    console.log('[v0] Key hash (first 16):', keyHash.substring(0, 16))

    const rows = await sql`
      INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, is_active)
      VALUES (gen_random_uuid(), ${user.id}, ${name}, ${keyHash}, ${keyPrefix}, true)
      RETURNING id, name, key_prefix, is_active, created_at
    `
    
    console.log('[v0] API key created successfully:', rows[0]?.id)

    // Return the full key ONCE - it cannot be retrieved again
    return NextResponse.json({ 
      key: rawKey, 
      meta: rows[0] 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}

// DELETE - Revoke an API key
export async function DELETE(request: Request) {
  try {
    const user = await getUserFromSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 })
    }

    await sql`
      DELETE FROM api_keys 
      WHERE id = ${keyId} AND user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
