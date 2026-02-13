'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { 
  type AuthUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  validateSession,
  getStoredUser,
  isAuthenticated as checkIsAuthenticated
} from '../services/authService'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = getStoredUser()
      if (storedUser) {
        // Validate session with server
        const result = await validateSession()
        if (result.success && result.user) {
          setUser(result.user)
        } else {
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    
    checkSession()
  }, [])
  
  const login = useCallback(async (email: string, password: string) => {
    const result = await authLogin(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      return { success: true }
    }
    return { success: false, error: result.error }
  }, [])
  
  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const result = await authRegister(email, password, displayName)
    if (result.success && result.user) {
      setUser(result.user)
      return { success: true }
    }
    return { success: false, error: result.error }
  }, [])
  
  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
  }, [])
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
