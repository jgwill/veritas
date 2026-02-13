// Client-side auth service that calls API routes
import type { DbUser } from './db'

const AUTH_TOKEN_KEY = 'tandt_auth_token'
const AUTH_USER_KEY = 'tandt_auth_user'

export interface AuthUser {
  id: string
  email: string
  displayName: string | null
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
}

// Get stored auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Get stored user
export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null
  const userJson = localStorage.getItem(AUTH_USER_KEY)
  if (userJson) {
    try {
      return JSON.parse(userJson)
    } catch {
      return null
    }
  }
  return null
}

// Store auth data
const storeAuth = (token: string, user: AuthUser): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

// Clear auth data
export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

// Register a new user
export const register = async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Registration failed' }
    }
    
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.display_name
    }
    
    storeAuth(data.token, user)
    return { success: true, user, token: data.token }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Login
export const login = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' }
    }
    
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.display_name
    }
    
    storeAuth(data.token, user)
    return { success: true, user, token: data.token }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Logout
export const logout = async (): Promise<void> => {
  const token = getAuthToken()
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  clearAuth()
}

// Validate session
export const validateSession = async (): Promise<AuthResult> => {
  const token = getAuthToken()
  if (!token) {
    return { success: false, error: 'No session' }
  }
  
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      clearAuth()
      return { success: false, error: 'Session expired' }
    }
    
    const data = await response.json()
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.display_name
    }
    
    // Update stored user data
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    
    return { success: true, user, token }
  } catch (error) {
    console.error('Session validation error:', error)
    return { success: false, error: 'Network error' }
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getStoredUser()
}
