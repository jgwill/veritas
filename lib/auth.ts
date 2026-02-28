import { neon } from '@neondatabase/serverless';
import { NextRequest } from 'next/server';

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
 *  - Bearer <VERITAS_API_KEY>   (LLM / programmatic access via env var)
 */
export async function getUserFromRequest(request: NextRequest | Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);

    // --- VERITAS_API_KEY path (simple env var check) ---
    const envApiKey = process.env.VERITAS_API_KEY;
    if (envApiKey && token === envApiKey) {
      // Return a system user for API key access
      // Get or create a default API user
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
 * Get or create a dedicated API user for VERITAS_API_KEY access
 */
async function getOrCreateApiUser(): Promise<AuthUser> {
  const apiEmail = 'api@veritas.local';
  
  // Check if API user exists
  const existing = await sql`
    SELECT id, email, name, display_name FROM users WHERE email = ${apiEmail}
  `;
  
  if (existing.length > 0) {
    return existing[0] as AuthUser;
  }
  
  // Create API user
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
