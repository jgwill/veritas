import { neon } from '@neondatabase/serverless';
import { NextRequest } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  display_name?: string;
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    // Get user from session token
    const result = await sql`
      SELECT u.id, u.email, u.name, u.display_name
      FROM users u
      INNER JOIN sessions s ON s.user_id = u.id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0] as AuthUser;
  } catch (error) {
    console.error('[v0] Auth error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
