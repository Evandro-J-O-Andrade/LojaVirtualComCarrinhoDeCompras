import { Navigate, Outlet } from 'react-router-dom'
import { useAccount } from '@/domains/conta/context/AccountContext'
import { useIsAdmin } from '@/domains/admin/services/adminAuth'

/**
 * Porta do painel administrativo.
 *
 * Três condições, em ordem:
 *   1. sessão carregando  -> espera
 *   2. anônima            -> /admin/login
 *   3. autenticada, mas sem
 *      privilégio admin       -> acesso negado
 *   4. admin real          -> conteúdo
 *
 * A decisão de "quem é admin" vem do
 * backend (is_admin()), nunca do frontend.
 */
export function ProtectedRoute() {
  const { authenticated, loading: authLoading } =
    useAccount()
  const {
    data: isAdmin,
    isLoading: adminLoading,
  } = useIsAdmin()

  if (authLoading || (authenticated && adminLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-deep-rose border-t-transparent" />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (isAdmin !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <div className="max-w-md rounded-2xl border border-champagne bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-bold text-soft-black">
            Acesso negado
          </h1>
          <p className="mt-3 text-sm text-content-muted">
            Sua conta está autenticada, mas não
            possui privilégio administrativo. Se
            você acredita que isso é um erro,
            fale com o atendimento.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-deep-rose underline-offset-4 hover:underline"
          >
            Voltar para a loja
          </a>
        </div>
      </div>
    )
  }

  return <Outlet />
}
