import { describe, expect, it } from 'vitest'
import {
  buildMonthMatrix,
  formatDateBR,
  formatTimeBR,
  isPastDate,
  toISODate,
  todayInSaoPaulo,
} from './availability'

describe('datas em America/Sao_Paulo', () => {
  it('converte Date para ISO no formato yyyy-mm-dd', () => {
    expect(toISODate(new Date(Date.UTC(2026, 9, 3)))).toBe('2026-10-03')
  })

  it('detecta datas passadas', () => {
    expect(isPastDate('2000-01-01')).toBe(true)
    expect(isPastDate('2099-12-31')).toBe(false)
    expect(isPastDate(todayInSaoPaulo())).toBe(false)
  })

  it('monta a matriz de semanas do mês', () => {
    const weeks = buildMonthMatrix(2026, 9)
    expect(weeks.length).toBe(5)
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      null,
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ])
    expect(weeks[4]).toEqual([
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ])
  })

  it('formata data para exibição em pt-BR', () => {
    expect(formatDateBR('2026-10-03')).toBe('03 de outubro de 2026')
  })

  it('formata horário absoluto em America/Sao_Paulo', () => {
    expect(formatTimeBR('2026-10-03T12:00:00Z')).toBe('09:00')
  })
})
