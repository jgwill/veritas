import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/auth/test
 * 
 * Simple endpoint to test if authentication is working.
 * Returns the authenticated user info or an error.
 */
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No valid authentication found' 
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        display_name: user.display_name
      }
    })
  } catch (error: any) {
    console.error('[auth/test] Error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: error.message 
    }, { status: 500 })
  }
}
</content>
</invoke>
