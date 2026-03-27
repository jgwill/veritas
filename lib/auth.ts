import { neon } from '@neondatabase/serverless';
import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  display_name?: string;
}

/**
 * Resolve a user from:
 *  - Bearer <session_token>     (browser sessions)
 *  - Bearer vk_<api_key>        (user-generated API keys from database)
 *  - Bearer <VERITAS_API_KEY>   (fallback env var for system access)
 */
export async function getUserFromRequest(request: NextRequest | Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);

    // --- User API key path (vk_ prefix) ---
    if (token.startsWith('vk_')) {
      const keyHash = createHash('sha256').update(token).digest('hex');
      const rows = await sql`
        SELECT u.id, u.email, u.name, u.display_name, ak.id as api_key_id
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        WHERE ak.key_hash = ${keyHash} AND ak.is_active = true
      `;
      
      if (rows.length === 0) return null;
      
      // Update last_used_at in background
      sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${rows[0].api_key_id}`.catch(() => {});
      
      return rows[0] as AuthUser;
    }

    // --- VERITAS_API_KEY fallback (env var for system/admin access) ---
    const envApiKey = process.env.VERITAS_API_KEY;
    if (envApiKey && token === envApiKey) {
      const apiUser = await getOrCreateApiUser();
      return apiUser;
    }

    // --- Session token path ---
    const result = await sql`
      SELECT u.id, u.email, u.name, u.display_name
      FROM users u
      INNER JOIN sessions s ON s.user_id = u.id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
    `;

    return result.length > 0 ? (result[0] as AuthUser) : null;
  } catch (error) {
    console.error('[auth] Error resolving user:', error);
    return null;
  }
}

/**
 * Get or create a dedicated API user for VERITAS_API_KEY env var access
 */
async function getOrCreateApiUser(): Promise<AuthUser> {
  const apiEmail = 'api@veritas.local';
  
  const existing = await sql`
    SELECT id, email, name, display_name FROM users WHERE email = ${apiEmail}
  `;
  
  if (existing.length > 0) {
    return existing[0] as AuthUser;
  }
  
  const created = await sql`
    INSERT INTO users (id, email, name, display_name, password_hash)
    VALUES (gen_random_uuid(), ${apiEmail}, 'API User', 'API User', 'api-key-auth')
    RETURNING id, email, name, display_name
  `;
  
  return created[0] as AuthUser;
}

export async function requireAuth(request: NextRequest | Request): Promise<AuthUser> {
  const user = await getUserFromRequest(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}
