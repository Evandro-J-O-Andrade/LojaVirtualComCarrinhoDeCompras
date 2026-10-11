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
  error: string | null
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
  const { user, loading, signIn, signOut, alterarSenha } =
    useAuth()

  const value = useMemo<AccountContextType>(
    () => ({
      authenticated: user !== null,
      user,
      profile: perfilDoUsuario(user),
      loading,
      // Erros de auth são expostos onde
      // acontecem (entrar); a conta
      // autenticada não carrega erro.
      error: null,
      signIn,
      signOut,
      alterarSenha,
    }),
    [user, loading, signIn, signOut, alterarSenha],
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
