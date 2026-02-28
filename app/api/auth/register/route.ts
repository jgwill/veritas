import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function POST(request: Request) {
  try {
    // Check if registration is open
    const registrationOpen = process.env.VERITAS_REGISTRATION_OPEN === 'true'
    if (!registrationOpen) {
      return NextResponse.json(
        { error: 'Registration is currently closed' },
        { status: 403 }
      )
    }

    const { email, password, displayName } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create user with hashed password
    const users = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${email.toLowerCase()}, crypt(${password}, gen_salt('bf')), ${displayName || null})
      RETURNING id, email, display_name, created_at
    `
    
    const user = users[0]
    
    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
