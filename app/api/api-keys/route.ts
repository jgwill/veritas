import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

async function getUserFromSession(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  // API key management endpoints only accept session tokens
  if (token.startsWith('tandt_sk_')) return null
  const rows = await sql`
    SELECT u.id, u.email, u.display_name
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `
  return rows.length > 0 ? rows[0] : null
}

// GET - list all API keys for user (never returns full key, only prefix)
export async function GET(request: Request) {
  const user = await getUserFromSession(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await sql`
    SELECT id, name, key_prefix, last_used_at, is_active, created_at
    FROM api_keys
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `
  return NextResponse.json({ keys })
}

// POST - generate a new API key (returns full key ONCE)
export async function POST(request: Request) {
  const user = await getUserFromSession(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name: string = body.name || 'API Key'

  // Generate: tandt_sk_<32 random hex bytes>
  const rawKey = `tandt_sk_${randomBytes(32).toString('hex')}`
  const keyPrefix = rawKey.substring(0, 14) // "tandt_sk_xxxxxx"
  const keyHash = createHash('sha256').update(rawKey).digest('hex')

  const rows = await sql`
    INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
    VALUES (${user.id}, ${name}, ${keyHash}, ${keyPrefix})
    RETURNING id, name, key_prefix, is_active, created_at
  `

  // Return the full key ONCE — it will not be retrievable again
  return NextResponse.json({ key: rawKey, meta: rows[0] }, { status: 201 })
}

// DELETE - revoke an API key
export async function DELETE(request: Request) {
  const user = await getUserFromSession(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const keyId = searchParams.get('id')
  if (!keyId) return NextResponse.json({ error: 'Missing key id' }, { status: 400 })

  await sql`
    DELETE FROM api_keys WHERE id = ${keyId} AND user_id = ${user.id}
  `
  return NextResponse.json({ success: true })
}
