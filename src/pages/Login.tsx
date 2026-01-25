import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-safari-cream px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-safari-brown mb-2">Welcome Back</h1>
              <p className="text-safari-brown/70">Log in to access your safari adventures</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-safari-brown mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-safari-brown/50" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 border-safari-sand focus:border-safari-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-safari-brown mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-safari-brown/50" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 border-safari-sand focus:border-safari-gold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="safari"
                className="w-full bg-safari-terracotta hover:bg-safari-terracotta/90"
                disabled={loading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-safari-brown/70">
                Don't have an account?{' '}
                <Link to="/signup" className="text-safari-gold hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}