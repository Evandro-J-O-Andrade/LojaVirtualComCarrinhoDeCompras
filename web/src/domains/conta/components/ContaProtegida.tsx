import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAccount } from '../context/AccountContext'

/**
 * Porta da conta: tudo em /conta
 * (exceto favoritos do visitante)
 * exige identidade real. Anônimo é
 * redirecionado para /entrar com o
 * destino de volta — nada de conta
 * fake via localStorage.
 */
export function ContaProtegida({
  children,
}: {
  children: ReactNode
}) {
  const { authenticated, loading } =
    useAccount()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-deep-rose border-t-transparent" />
      </div>
    )
  }

  if (!authenticated) {
    const destino = encodeURIComponent(
      `${location.pathname}${location.search}`,
    )
    return (
      <Navigate
        to={`/entrar?destino=${destino}`}
        replace
      />
    )
  }

  return <>{children}</>
}
