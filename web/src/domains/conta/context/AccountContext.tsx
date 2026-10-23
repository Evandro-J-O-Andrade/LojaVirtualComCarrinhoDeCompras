import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/AuthContext'
import {
  perfilDoUsuario,
  type PerfilCliente,
} from '../model/conta'

/**
 * AccountContext — o seam da conta.
 *
 * A UI consome isto, não o Supabase
 * diretamente. Quando a Etapa 8 entrar,
 * `profile` passa a resolver
 * auth.users → cliente → pedidos,
 * orçamentos e agendamentos sem
 * alterar uma página.
 */
interface AccountContextType {
  /** Identidade real: só verdadeira com Supabase Auth. */
  authenticated: boolean
  user: User | null
  profile: PerfilCliente | null
  loading: boolean
  /** Falha do provedor de identidade, se houver. */
  error: string | null
  /**
   * O provedor de identidade está configurado
   * neste ambiente. Quando falso, a conta
   * mostra o que falta em vez de simular.
   */
  configurado: boolean
  signIn: (
    email: string,
    senha: string,
  ) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  /** Alteração de senha via Supabase Auth (não é própria). */
  alterarSenha: (novaSenha: string) => Promise<{
    error?: string
  }>
}

const AccountContext =
  createContext<AccountContextType | undefined>(
    undefined,
  )

export function AccountProvider({
  children,
}: {
  children: ReactNode
}) {
  const {
    user,
    loading,
    error,
    configurado,
    signIn,
    signOut,
    alterarSenha,
  } = useAuth()

  const value = useMemo<AccountContextType>(
    () => ({
      authenticated: user !== null,
      user,
      profile: perfilDoUsuario(user),
      loading,
      // O erro vem do provedor de identidade
      // (configuração ausente ou falha de rede):
      // a conta autenticada não carrega erro
      // próprio.
      error,
      configurado,
      signIn,
      signOut,
      alterarSenha,
    }),
    [
      user,
      loading,
      error,
      configurado,
      signIn,
      signOut,
      alterarSenha,
    ],
  )

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount(): AccountContextType {
  const context = useContext(AccountContext)
  if (!context)
    throw new Error(
      'useAccount deve ser usado dentro de AccountProvider',
    )
  return context
}
