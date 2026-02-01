import { neon } from '@neondatabase/serverless'

// Create a reusable SQL client
const getDatabaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  // For client-side, we'll use API routes
  return ''
}

export const sql = neon(getDatabaseUrl())

// Types for database operations
export interface DbUser {
  id: string
  email: string
  display_name: string | null
  created_at: string
  updated_at: string
}

export interface DbModel {
  id: string
  user_id: string
  template_id: string | null
  name: string
  description: string | null
  model_type: number
  model_data: any
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface DbModelTemplate {
  id: string
  name: string
  description: string | null
  model_type: number
  template_data: any
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DbAnalysisSnapshot {
  id: string
  model_id: string
  user_id: string
  snapshot_name: string | null
  snapshot_date: string
  elements_data: any
  summary_notes: string | null
  created_at: string
}

export interface DbScratchpadNote {
  id: string
  model_id: string
  user_id: string
  title: string | null
  content: string
  element_id: string | null
  note_type: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface DbSession {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}
