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
 * Resolve a user from either:
 *  - Bearer <session_token>        (browser sessions)
 *  - Bearer tandt_sk_<api_key>     (LLM / programmatic access)
 */
export async function getUserFromRequest(request: NextRequest | Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);

    // --- API key path ---
    if (token.startsWith('tandt_sk_')) {
      const keyHash = createHash('sha256').update(token).digest('hex');
      const rows = await sql`
        SELECT u.id, u.email, u.name, u.display_name, ak.id as api_key_id
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        WHERE ak.key_hash = ${keyHash} AND ak.is_active = true
      `;
      if (rows.length === 0) return null;
      // Update last_used_at asynchronously
      sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${rows[0].api_key_id}`.catch(() => {});
      return rows[0] as AuthUser;
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

export async function requireAuth(request: NextRequest | Request): Promise<AuthUser> {
  const user = await getUserFromRequest(request);
  if (!user) throw new Error('Unauthorized');
  return user;
}
