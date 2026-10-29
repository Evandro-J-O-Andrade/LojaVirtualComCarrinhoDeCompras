import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  AdminPermissionProvider,
  useAdminPermissao,
} from './AdminPermissionContext'
import type { AdminAcao } from '../model/admin'
import { useIsAdmin } from '../services/adminAuth'

vi.mock('../services/adminAuth', () => ({ useIsAdmin: vi.fn() }))

const ACOES: AdminAcao[] = [
  'produto.criar', 'produto.editar', 'produto.excluir',
  'orcamento.ler', 'orcamento.editar', 'pedido.ler',
  'pedido.editar', 'agendamento.ler', 'cliente.ler',
  'cliente.editar', 'atendimento.ler', 'auditoria.ler',
  'configuracao.editar',
]

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}><AdminPermissionProvider>{children}</AdminPermissionProvider></QueryClientProvider>
}

describe('AdminPermissionContext', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mantém as ações bloqueadas enquanto verifica a autorização', () => {
    vi.mocked(useIsAdmin).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useIsAdmin>)
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    expect(result.current.estado).toBe('pendente')
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(false)
  })

  it('libera ações quando o Supabase confirma o administrador', () => {
    vi.mocked(useIsAdmin).mockReturnValue({ data: true, isLoading: false } as ReturnType<typeof useIsAdmin>)
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    expect(result.current.estado).toBe('conectado')
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(true)
    expect(result.current.motivo).toBe('')
  })

  it('nega ações quando o Supabase não confirma administrador', () => {
    vi.mocked(useIsAdmin).mockReturnValue({ data: false, isLoading: false } as ReturnType<typeof useIsAdmin>)
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    expect(result.current.estado).toBe('conectado')
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(false)
    expect(result.current.motivo).toContain('autorização administrativa')
  })

  it('exige o provider', () => {
    const consoleErro = console.error
    console.error = () => {}
    expect(() => renderHook(() => useAdminPermissao())).toThrow(/AdminPermissionProvider/)
    console.error = consoleErro
  })
})
