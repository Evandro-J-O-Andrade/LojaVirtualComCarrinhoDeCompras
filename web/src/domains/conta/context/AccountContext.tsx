import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/AuthContext'
import {
  perfilDoUsuario,
  type PerfilCliente,
} from '../model/conta'
import { clientePerfilRepository } from '../repositories/cliente-perfil.repository'

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
  signUp: (
    email: string,
    senha: string,
    nome: string,
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
    signUp,
    signOut,
    alterarSenha,
  } = useAuth()

  const [telefone, setTelefone] = useState<string | null>(null)
  const [perfilCarregando, setPerfilCarregando] =
    useState(false)
  const [perfilErro, setPerfilErro] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!user) {
      setTelefone(null)
      setPerfilCarregando(false)
      setPerfilErro(null)
      return
    }
    let cancelado = false
    const email = user.email ?? ''
    setPerfilCarregando(true)
    setPerfilErro(null)
    clientePerfilRepository
      .buscarPorEmail(email)
      .then((resultado) => {
        if (cancelado) return
        setPerfilCarregando(false)
        if (resultado.error) {
          setPerfilErro(resultado.error)
          return
        }
        setTelefone(resultado.data?.telefone ?? null)
      })
    return () => {
      cancelado = true
    }
  }, [user])

  const profile = useMemo<PerfilCliente | null>(() => {
    const base = perfilDoUsuario(user)
    if (!base) return null
    return { ...base, telefone }
  }, [user, telefone])

  const value = useMemo<AccountContextType>(
    () => ({
      authenticated: user !== null,
      user,
      profile,
      loading: loading || perfilCarregando,
      error: error ?? perfilErro,
      configurado,
      signIn,
      signUp,
      signOut,
      alterarSenha,
    }),
    [
      user,
      profile,
      loading,
      perfilCarregando,
      error,
      perfilErro,
      configurado,
      signIn,
      signUp,
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
