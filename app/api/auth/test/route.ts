import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { createHash } from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

/**
 * GET /api/auth/test
 * 
 * Test endpoint with detailed debug info for API key authentication.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  
  const debug: Record<string, any> = {
    hasAuthHeader: !!authHeader,
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      authenticated: false, 
      error: 'No Bearer token',
      debug 
    }, { status: 401 })
  }

  const token = authHeader.substring(7).trim()
  debug.tokenLength = token.length
  debug.tokenPrefix = token.substring(0, 12)
  debug.startsWithVk = token.startsWith('vk_')
  
  if (token.startsWith('vk_')) {
    const keyHash = createHash('sha256').update(token).digest('hex')
    debug.computedHash = keyHash
    
    // Direct database lookup with the computed hash
    const rows = await sql`
      SELECT ak.id, ak.key_hash, ak.key_prefix, ak.is_active, u.id as user_id, u.email
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.key_hash = ${keyHash}
    `
    
    debug.dbLookupRows = rows.length
    
    if (rows.length > 0) {
      debug.foundKey = {
        id: rows[0].id,
        prefix: rows[0].key_prefix,
        isActive: rows[0].is_active,
        hashMatch: rows[0].key_hash === keyHash
      }
      
      if (rows[0].is_active) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: rows[0].user_id,
            email: rows[0].email
          },
          debug
        })
      } else {
        debug.error = 'Key found but is_active=false'
      }
    } else {
      // Show what hashes exist in DB for comparison
      const allKeys = await sql`SELECT key_prefix, key_hash FROM api_keys LIMIT 3`
      debug.existingHashes = allKeys.map((k: any) => ({
        prefix: k.key_prefix,
        hash: k.key_hash.substring(0, 20) + '...'
      }))
      debug.error = 'No matching hash found in database'
    }
  }

  return NextResponse.json({ 
    authenticated: false, 
    error: debug.error || 'Authentication failed',
    debug 
  }, { status: 401 })
}
