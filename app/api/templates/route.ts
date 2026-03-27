import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

// GET - List all available templates (system templates + user's own templates)
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const templates = await sql`
      SELECT id, name, description, model_type, template_data, is_system, created_by, created_at
      FROM model_templates
      WHERE is_system = true OR created_by = ${user.id}
      ORDER BY is_system DESC, name ASC
    `
    
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST - Create a new template from an existing model
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { name, description, modelType, templateData } = await request.json()
    
    if (!name || !modelType || !templateData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const templates = await sql`
      INSERT INTO model_templates (name, description, model_type, template_data, is_system, created_by)
      VALUES (${name}, ${description || null}, ${modelType}, ${JSON.stringify(templateData)}, false, ${user.id})
      RETURNING id, name, description, model_type, template_data, is_system, created_by, created_at
    `
    
    return NextResponse.json({ template: templates[0] })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
