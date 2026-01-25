import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type User = {
  id: number
  email: string
  name: string
  role: 'guest' | 'admin'
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, adminCode?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      setToken(token)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }
    
    const { token, user } = await response.json()
        localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
        setToken(token)
  }

  const signup = async (email: string, password: string, name: string, adminCode?: string) => {
    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, adminCode })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }
  }

  const logout = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}