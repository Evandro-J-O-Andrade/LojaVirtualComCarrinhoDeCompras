import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  AdminPermissionProvider,
  useAdminPermissao,
} from './AdminPermissionContext'
import type { AdminAcao } from '../model/admin'

/**
 * O seam de permissões NÃO afirma
 * autorização real enquanto o
 * backend não está conectado.
 */

const ACOES: AdminAcao[] = [
  'produto.criar',
  'produto.editar',
  'produto.excluir',
  'orcamento.ler',
  'orcamento.editar',
  'pedido.ler',
  'pedido.editar',
  'agendamento.ler',
  'cliente.ler',
  'cliente.editar',
  'atendimento.ler',
  'auditoria.ler',
  'configuracao.editar',
]

describe('AdminPermissionContext', () => {
  it('estado pendente até o RBAC real', () => {
    const { result } = renderHook(
      () => useAdminPermissao(),
      { wrapper: AdminPermissionProvider },
    )
    expect(result.current.estado).toBe('pendente')
  })

  it('nega toda ação enquanto pendente', () => {
    const { result } = renderHook(
      () => useAdminPermissao(),
      { wrapper: AdminPermissionProvider },
    )
    for (const acao of ACOES) {
      expect(result.current.pode(acao)).toBe(false)
    }
  })

  it('explica por que a ação está indisponível', () => {
    const { result } = renderHook(
      () => useAdminPermissao(),
      { wrapper: AdminPermissionProvider },
    )
    expect(result.current.motivo).toContain('RBAC')
    expect(result.current.motivo.length).toBeGreaterThan(0)
  })

  it('exige o provider', () => {
    const consoleErro = console.error
    console.error = () => {}
    expect(() =>
      renderHook(() => useAdminPermissao()),
    ).toThrow(/AdminPermissionProvider/)
    console.error = consoleErro
  })
})
