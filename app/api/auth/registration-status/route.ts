import { NextResponse } from 'next/server'

export async function GET() {
  const registrationOpen = process.env.VERITAS_REGISTRATION_OPEN === 'true'
  return NextResponse.json({ registrationOpen })
}
