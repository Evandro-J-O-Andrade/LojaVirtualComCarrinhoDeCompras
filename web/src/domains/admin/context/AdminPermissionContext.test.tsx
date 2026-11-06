import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  AdminPermissionProvider,
  useAdminPermissao,
} from './AdminPermissionContext'
import type { AdminAcao } from '../model/admin'
import type { ReactNode } from 'react'
import { verificarAdmin } from '../services/adminAuth'

vi.mock('../services/adminAuth', () => ({ verificarAdmin: vi.fn() }))

const ACOES: AdminAcao[] = [
  'produto.criar', 'produto.editar', 'produto.excluir',
  'categoria.criar', 'categoria.editar',
  'orcamento.ler', 'orcamento.editar', 'pedido.ler',
  'pedido.editar', 'agendamento.ler', 'cliente.ler',
  'cliente.editar', 'atendimento.ler', 'auditoria.ler',
  'configuracao.editar',
]

function wrapper({ children }: { children: ReactNode }) {
  return <AdminPermissionProvider>{children}</AdminPermissionProvider>
}

describe('AdminPermissionContext', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mantém as ações bloqueadas enquanto carrega a autorização', () => {
    vi.mocked(verificarAdmin).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    expect(result.current.estado).toBe('carregando')
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(false)
    expect(result.current.motivo).toBe('Carregando permissões...')
  })

  it('libera ações quando o Supabase confirma o administrador', async () => {
    vi.mocked(verificarAdmin).mockResolvedValue(true)
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    await vi.waitFor(() => expect(result.current.estado).toBe('autorizado'))
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(true)
    expect(result.current.motivo).toBe('')
  })

  it('nega ações quando o Supabase não confirma administrador', async () => {
    vi.mocked(verificarAdmin).mockResolvedValue(false)
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    await vi.waitFor(() => expect(result.current.estado).toBe('negado'))
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(false)
    expect(result.current.motivo).toContain('Acesso negado')
  })

  it('trata erro de rede como negação com mensagem adequada', async () => {
    vi.mocked(verificarAdmin).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useAdminPermissao(), { wrapper })
    await vi.waitFor(() => expect(result.current.estado).toBe('negado'))
    for (const acao of ACOES) expect(result.current.pode(acao)).toBe(false)
    expect(result.current.motivo).toContain('Erro ao verificar')
  })

  it('exige o provider', () => {
    const consoleErro = console.error
    console.error = () => {}
    expect(() => renderHook(() => useAdminPermissao())).toThrow(/AdminPermissionProvider/)
    console.error = consoleErro
  })
})