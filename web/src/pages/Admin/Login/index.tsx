import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { verificarAdmin } from '@/domains/admin/services/adminAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

export function AdminLogin() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const { signIn, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    // A identidade existe, mas o privilégio
    // administrativo vem do backend. Sem ele,
    // não há painel.
    const admin = await verificarAdmin()
    if (!admin) {
      await signOut()
      setError(
        'Sua conta não tem acesso ao painel administrativo.',
      )
      setLoading(false)
      return
    }
    navigate('/admin', { replace: true })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-deep-rose to-coral flex items-center justify-center text-white font-display font-bold text-2xl">
              A
            </div>
            <span className="font-display font-bold text-3xl text-ivory">ANGEL</span>
          </div>
          <p className="text-warm-gray">Painel de Administração</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="font-display font-bold text-2xl text-soft-black mb-6">
            Entrar no painel
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-coral text-sm">{error}</p>
            )}

            <Button variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-warm-gray hover:text-deep-rose">
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}