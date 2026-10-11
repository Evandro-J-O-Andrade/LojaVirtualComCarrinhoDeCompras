import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

/**
 * O repositório administrativo lê o
 * banco REAL e reporta o estado
 * honesto: conectado, não integrado
 * (tabela ausente) ou erro. Nunca
 * fallback editorial no admin.
 */

const LINHA_PRODUTO = {
  id: 1,
  nome: 'Serum 30ml',
  slug: 'serum-30ml',
  preco_base: 129.9,
  ativo: true,
  produto_imagem: [
    {
      id: 1,
      url: '/img/serum.jpg',
      ordem: 0,
      principal: true,
    },
  ],
}

const mockState = vi.hoisted(() => ({
  modo: 'ok' as 'ok' | 'tabela-ausente' | 'falha',
  chamadas: 0,
}))

vi.mock('@/lib/supabase', () => {
  const builder = {
    select() {
      return builder
    },
    eq() {
      return builder
    },
    order() {
      return builder
    },
    ilike() {
      return builder
    },
    in() {
      return builder
    },
    then(
      resolver: (
        valor: unknown,
      ) => void,
    ) {
      mockState.chamadas++
      if (mockState.modo === 'falha') {
        throw new Error('conexão indisponível')
      }
      // Primeira consulta: a lista
      // principal. As demais (composição)
      // voltam vazias.
      if (mockState.chamadas === 1) {
        resolver(
          mockState.modo === 'tabela-ausente'
            ? {
                data: null,
                error: {
                  code: '42P01',
                  message: 'relation does not exist',
                },
              }
            : {
                data: [LINHA_PRODUTO],
                error: null,
              },
        )
        return
      }
      resolver({ data: [], error: null })
    },
  }
  return {
    supabase: {
      from() {
        return builder
      },
    },
  }
})

import { useAdminProdutos } from './useAdminProdutos'

function wrapper({ children }: { children: ReactNode }) {
  const cliente = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={cliente}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAdminProdutos', () => {
  beforeEach(() => {
    mockState.modo = 'ok'
    mockState.chamadas = 0
  })

  it('conectado: lista real do banco', async () => {
    const { result } = renderHook(
      () => useAdminProdutos(),
      { wrapper },
    )
    await waitFor(() =>
      expect(result.current.isSuccess).toBe(true),
    )
    expect(result.current.data?.estado).toBe('conectado')
    expect(result.current.data?.produtos).toHaveLength(1)
    const produto = result.current.data?.produtos[0]
    expect(produto?.id).toBe('1')
    expect(produto?.nome).toBe('Serum 30ml')
    expect(produto?.precoBase).toBe(129.9)
    expect(produto?.source).toBe('supabase')
  })

  it('tabela ausente: não integrado, nunca fallback', async () => {
    mockState.modo = 'tabela-ausente'
    const { result } = renderHook(
      () => useAdminProdutos(),
      { wrapper },
    )
    await waitFor(() =>
      expect(result.current.isSuccess).toBe(true),
    )
    expect(result.current.data?.estado).toBe('nao-integrado')
    expect(result.current.data?.produtos).toEqual([])
  })

  it('falha de conexão: erro real com retry', async () => {
    mockState.modo = 'falha'
    const { result } = renderHook(
      () => useAdminProdutos(),
      { wrapper },
    )
    await waitFor(() =>
      expect(result.current.isError).toBe(true),
    )
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
