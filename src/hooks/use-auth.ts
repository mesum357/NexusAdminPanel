import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/config'

interface User {
  _id: string
  username: string
  email: string
  fullName?: string
  isAdmin: boolean
  verified: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        setAuthState({
          user: userData.user,
          loading: false,
          error: null
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: 'Not authenticated'
        })
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to check authentication'
      })
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const responseData = await response.json()
        setAuthState({
          user: responseData.user,
          loading: false,
          error: null
        })
        return { success: true }
      } else {
        const errorData = await response.json()
        setAuthState(prev => ({
          ...prev,
          error: errorData.error || 'Login failed'
        }))
        return { success: false, error: errorData.error }
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Network error'
      }))
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null
      })
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    checkAuthStatus
  }
}
