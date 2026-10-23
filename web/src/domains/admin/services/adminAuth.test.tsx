import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import {
  renderHook,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

function criarWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    )
  }
}

/**
 * Contrato de autorização administrativa.
 *
 * O privilégio vem do backend (is_admin()).
 * Sem configuração, sem rede ou com erro,
 * ninguém ganha acesso.
 */

type AdminAuthModule = typeof import('./adminAuth')

const estado = vi.hoisted(() => ({
  configurado: true,
  rpc: vi.fn(),
}))

async function carregar(configurado: boolean) {
  vi.resetModules()
  estado.configurado = configurado
  vi.doMock('@/lib/supabase', () => ({
    supabaseConfigurado: configurado,
    MENSAGEM_SEM_CONFIGURACAO: 'sem config',
    ErroSupabaseNaoConfigurado: class extends Error {},
    supabase: {
      rpc: estado.rpc,
    },
  }))
  return await import('./adminAuth')
}

describe('adminAuth', () => {
  beforeEach(() => {
    estado.rpc.mockReset()
  })

  afterEach(() => {
    vi.doUnmock('@/lib/supabase')
    vi.resetModules()
  })

  it('sem configuração: ninguém é admin', async () => {
    const modulo = await carregar(false)
    expect(await modulo.verificarAdmin()).toBe(false)
    expect(estado.rpc).not.toHaveBeenCalled()
  })

  it('backend diz true: é admin', async () => {
    estado.rpc.mockResolvedValue({ data: true, error: null })
    const modulo = await carregar(true)
    expect(await modulo.verificarAdmin()).toBe(true)
    expect(estado.rpc).toHaveBeenCalledWith('is_admin')
  })

  it('backend diz false: não é admin', async () => {
    estado.rpc.mockResolvedValue({ data: false, error: null })
    const modulo = await carregar(true)
    expect(await modulo.verificarAdmin()).toBe(false)
  })

  it('erro do backend: ninguém é admin', async () => {
    estado.rpc.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' },
    })
    const modulo = await carregar(true)
    expect(await modulo.verificarAdmin()).toBe(false)
  })

  it('exceção de rede: ninguém é admin', async () => {
    estado.rpc.mockRejectedValue(new Error('network'))
    const modulo = await carregar(true)
    expect(await modulo.verificarAdmin()).toBe(false)
  })

  it('useIsAdmin reflete o resultado do backend', async () => {
    estado.rpc.mockResolvedValue({ data: true, error: null })
    const modulo = await carregar(true)
    const { result } = renderHook(() => modulo.useIsAdmin(), {
      wrapper: criarWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe(true)
  })
})
