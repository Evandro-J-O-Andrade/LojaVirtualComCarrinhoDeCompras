import { describe, it, expect } from 'vitest'
import {
  ADMIN_GRUPOS,
  ADMIN_MODULOS_ATIVOS,
  rotuloEstadoDados,
} from './admin'

describe('ADMIN_GRUPOS', () => {
  it('agrupa os módulos nas seis áreas', () => {
    expect(ADMIN_GRUPOS).toHaveLength(6)
    const grupos = ADMIN_GRUPOS.map((g) => g.grupo)
    expect(grupos).toEqual([
      'Visão geral',
      'Comercial',
      'Experiências',
      'Relacionamento',
      'Conteúdo',
      'Sistema',
    ])
  })

  it('todo módulo tem rótulo e ícone', () => {
    for (const grupo of ADMIN_GRUPOS) {
      for (const modulo of grupo.modulos) {
        expect(modulo.rotulo.length).toBeGreaterThan(0)
        expect(modulo.icon).toBeDefined()
      }
    }
  })

  it('módulos ativos têm rota real; em breve não', () => {
    for (const grupo of ADMIN_GRUPOS) {
      for (const modulo of grupo.modulos) {
        if (modulo.emBreve) {
          expect(modulo.href).toBeNull()
        } else {
          expect(modulo.href).toMatch(/^\/admin/)
        }
      }
    }
  })

  it('primeiro corte: dashboard e produtos são reais', () => {
    const hrefs = ADMIN_MODULOS_ATIVOS.map((m) => m.href)
    expect(hrefs).toContain('/admin')
    expect(hrefs).toContain('/admin/produtos')
    expect(ADMIN_MODULOS_ATIVOS).toHaveLength(2)
  })

  it('nenhuma rota duplicada', () => {
    const hrefs = ADMIN_MODULOS_ATIVOS.map((m) => m.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe('rotuloEstadoDados', () => {
  it('rotula os três estados honestamente', () => {
    expect(rotuloEstadoDados('conectado')).toBe(
      'Dados reais conectados',
    )
    expect(rotuloEstadoDados('nao-integrado')).toBe(
      'Dados disponíveis após integração',
    )
    expect(rotuloEstadoDados('erro')).toBe(
      'Não foi possível carregar os dados',
    )
  })
})
