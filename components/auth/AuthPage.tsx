'use client';

import React, { useState, useEffect } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth/registration-status')
      .then(res => res.json())
      .then(data => setRegistrationOpen(data.registrationOpen))
      .catch(() => setRegistrationOpen(false))
  }, [])

  const handleSwitchToRegister = () => {
    if (registrationOpen) {
      setMode('register')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg">
          {mode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={handleSwitchToRegister} 
              registrationOpen={registrationOpen ?? false}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            TandT - Twos and Threes Decision Framework
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on Robert Fritz's work
          </p>
        </div>
      </div>
    </div>
  )
}
