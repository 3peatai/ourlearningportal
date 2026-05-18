import { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '../lib/shared'

const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  'admin@ourlearningportal.com':   { password: 'admin123',   user: { id: 'u0', name: 'Admin User',  email: 'admin@ourlearningportal.com',   role: 'ADMIN'                      } },
  'beverly@ourlearningportal.com': { password: 'teacher123', user: { id: 'u1', name: 'Beverly Wong', email: 'beverly@ourlearningportal.com', role: 'TEACHER', profileId: 't1'   } },
  'sarah.lam@hkmail.com':         { password: 'parent123',  user: { id: 'u2', name: 'Sarah Lam',    email: 'sarah.lam@hkmail.com',          role: 'PARENT',  profileId: 'par1' } },
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('olp_mock_user')
    if (stored) {
      try { setUser(JSON.parse(stored) as AuthUser) } catch { localStorage.removeItem('olp_mock_user') }
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const entry = MOCK_USERS[email.toLowerCase().trim()]
    if (!entry || entry.password !== password) throw new Error('Invalid credentials')
    localStorage.setItem('olp_mock_user', JSON.stringify(entry.user))
    setUser(entry.user)
  }

  function logout() {
    localStorage.removeItem('olp_mock_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
