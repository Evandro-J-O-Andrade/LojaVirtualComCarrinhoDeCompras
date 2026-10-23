import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import {
  supabase,
  supabaseConfigurado,
  MENSAGEM_SEM_CONFIGURACAO,
} from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  /**
   * Falha ao inicializar o provedor de
   * identidade (configuração ausente ou
   * rede). Nunca fica em silêncio.
   */
  error: string | null
  /** O provedor de identidade está configurado neste ambiente. */
  configurado: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  /** Alteração de senha via Supabase Auth — nunca implementação própria. */
  alterarSenha: (novaSenha: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error && erro.message) return erro.message
  return 'Não foi possível falar com o serviço de identidade agora.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Sem provedor configurado, o estado já
  // nasce resolvido: nada de loading eterno.
  const [loading, setLoading] = useState(
    supabaseConfigurado,
  )
  const [error, setError] = useState<string | null>(
    supabaseConfigurado ? null : MENSAGEM_SEM_CONFIGURACAO,
  )

  useEffect(() => {
    if (!supabaseConfigurado) return

    let ativo = true

    // `getUser` pode rejeitar (rede, token
    // inválido). Sem este tratamento o
    // `loading` ficaria travado para sempre e
    // a conta ficaria em spinner eterno.
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!ativo) return
        setUser(data.user)
        setLoading(false)
      })
      .catch((erro: unknown) => {
        if (!ativo) return
        setError(mensagemDeErro(erro))
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!ativo) return
      setUser(session?.user ?? null)
      setError(null)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabaseConfigurado) {
        return { error: MENSAGEM_SEM_CONFIGURACAO }
      }
      const { error: erro } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (erro) return { error: erro.message }
      return {}
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (!supabaseConfigurado) return
    await supabase.auth.signOut()
  }, [])

  const alterarSenha = useCallback(
    async (novaSenha: string) => {
      if (!supabaseConfigurado) {
        return { error: MENSAGEM_SEM_CONFIGURACAO }
      }
      const { error: erro } = await supabase.auth.updateUser({
        password: novaSenha,
      })
      if (erro) return { error: erro.message }
      return {}
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        configurado: supabaseConfigurado,
        signIn,
        signOut,
        alterarSenha,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
