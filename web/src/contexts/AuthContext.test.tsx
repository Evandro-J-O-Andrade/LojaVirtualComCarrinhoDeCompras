import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

/**
 * Contrato do provedor de identidade.
 *
 * O `AuthContext` é a ÚNICA fonte de
 * identidade. Aqui verificamos os quatro
 * estados que a conta precisa suportar:
 * configurado e silencioso, configurado
 * com falha, não configurado e carregando.
 */

type AuthModule = typeof import('./AuthContext')

const MENSAGEM =
  'O serviço da Angel não está configurado neste ambiente.'

const estado = vi.hoisted(() => ({
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
}))

/**
 * Carrega o módulo com um provedor
 * configurado ou não. O módulo é
 * recarregado a cada chamada porque a
 * configuração é lida na importação.
 */
async function carregarAuth(
  configurado: boolean,
): Promise<AuthModule> {
  vi.resetModules()
  vi.doMock('@/lib/supabase', () => ({
    supabaseConfigurado: configurado,
    MENSAGEM_SEM_CONFIGURACAO: MENSAGEM,
    ErroSupabaseNaoConfigurado: class ErroSupabaseNaoConfigurado extends Error {},
    supabase: {
      auth: {
        getUser: estado.getUser,
        onAuthStateChange: estado.onAuthStateChange,
        signInWithPassword: estado.signInWithPassword,
        signOut: estado.signOut,
        updateUser: estado.updateUser,
      },
    },
  }))
  return await import('./AuthContext')
}

function wrapperDe(AuthModule: AuthModule, children: ReactNode) {
  return (
    <AuthModule.AuthProvider>{children}</AuthModule.AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    estado.getUser.mockReset()
    estado.onAuthStateChange.mockReset()
    estado.signInWithPassword.mockReset()
    estado.signOut.mockReset()
    estado.updateUser.mockReset()
    estado.onAuthStateChange.mockReturnValue({
      data: {
        subscription: { unsubscribe: () => {} },
      },
    })
  })

  afterEach(() => {
    vi.doUnmock('@/lib/supabase')
    vi.resetModules()
  })

  it('configurado: resolve o usuário e libera o loading', async () => {
    estado.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'ana@email.com',
          user_metadata: { name: 'Ana Paula' },
        },
      },
    })
    const Auth = await carregarAuth(true)

    const { result } = renderHook(
      () => Auth.useAuth(),
      { wrapper: ({ children }) => wrapperDe(Auth, children) },
    )

    await waitFor(() =>
      expect(result.current.loading).toBe(false),
    )
    expect(result.current.user?.email).toBe('ana@email.com')
    expect(result.current.error).toBeNull()
    expect(result.current.configurado).toBe(true)
  })

  it('configurado: falha do provedor vira erro, sem loading travado', async () => {
    estado.getUser.mockRejectedValue(
      new Error('Falha de rede ao consultar a sessão.'),
    )
    const Auth = await carregarAuth(true)

    const { result } = renderHook(
      () => Auth.useAuth(),
      { wrapper: ({ children }) => wrapperDe(Auth, children) },
    )

    await waitFor(() =>
      expect(result.current.loading).toBe(false),
    )
    expect(result.current.error).toBe(
      'Falha de rede ao consultar a sessão.',
    )
    expect(result.current.user).toBeNull()
  })

  it('não configurado: erro explícito e nenhuma chamada ao provedor', async () => {
    const Auth = await carregarAuth(false)

    const { result } = renderHook(
      () => Auth.useAuth(),
      { wrapper: ({ children }) => wrapperDe(Auth, children) },
    )

    await waitFor(() =>
      expect(result.current.loading).toBe(false),
    )
    expect(result.current.configurado).toBe(false)
    expect(result.current.error).toBe(MENSAGEM)
    expect(estado.getUser).not.toHaveBeenCalled()
    expect(estado.onAuthStateChange).not.toHaveBeenCalled()
  })

  it('não configurado: entrar responde com o erro, sem simular', async () => {
    const Auth = await carregarAuth(false)

    const { result } = renderHook(
      () => Auth.useAuth(),
      { wrapper: ({ children }) => wrapperDe(Auth, children) },
    )

    const retorno = await result.current.signIn(
      'ana@email.com',
      'certa',
    )
    expect(retorno.error).toBe(MENSAGEM)
    expect(estado.signInWithPassword).not.toHaveBeenCalled()
  })

  it('entrar devolve a mensagem real do provedor', async () => {
    estado.getUser.mockResolvedValue({ data: { user: null } })
    estado.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })
    const Auth = await carregarAuth(true)

    const { result } = renderHook(
      () => Auth.useAuth(),
      { wrapper: ({ children }) => wrapperDe(Auth, children) },
    )

    await waitFor(() =>
      expect(result.current.loading).toBe(false),
    )

    const retorno = await result.current.signIn(
      'ana@email.com',
      'errada',
    )
    expect(retorno.error).toBe('Invalid login credentials')
  })

  it('alterar senha sem provedor configurado não chama o Auth', async () => {
    const Auth = await carregarAuth(false)

    const { result } = renderHook(
      () => Auth.useAuth(),
      { wrapper: ({ children }) => wrapperDe(Auth, children) },
    )

    const retorno = await result.current.alterarSenha(
      'senha-nova',
    )
    expect(retorno.error).toBe(MENSAGEM)
    expect(estado.updateUser).not.toHaveBeenCalled()
  })
})
