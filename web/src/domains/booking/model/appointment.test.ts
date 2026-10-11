import { describe, expect, it } from 'vitest'
import {
  emptyDraft,
  isEmailValid,
  isPhoneValid,
  isProtocolo,
} from './appointment'

describe('protocolo', () => {
  it('aceita o formato fechado AG-YYYYMMDD-NNNNNN', () => {
    expect(isProtocolo('AG-20261003-000123')).toBe(true)
  })

  it('rejeita formatos inválidos', () => {
    expect(isProtocolo('AG-20261003-123')).toBe(false)
    expect(isProtocolo('ag-20261003-000123')).toBe(false)
    expect(isProtocolo('AG-20261003-0001234')).toBe(false)
    expect(isProtocolo('20261003-000123')).toBe(false)
    expect(isProtocolo('')).toBe(false)
  })
})

describe('validação de contato', () => {
  it('aceita telefone com 10 ou 11 dígitos', () => {
    expect(isPhoneValid('(11) 96320-5776')).toBe(true)
    expect(isPhoneValid('11963205776')).toBe(true)
    expect(isPhoneValid('1133334444')).toBe(true)
  })

  it('rejeita telefone incompleto ou longo demais', () => {
    expect(isPhoneValid('1234')).toBe(false)
    expect(isPhoneValid('')).toBe(false)
    expect(isPhoneValid('111111111111')).toBe(false)
  })

  it('valida e-mail', () => {
    expect(isEmailValid('contato@angelcosmeticos.com.br')).toBe(true)
    expect(isEmailValid('invalido')).toBe(false)
    expect(isEmailValid('')).toBe(false)
  })

  it('cria rascunho vazio', () => {
    const draft = emptyDraft()
    expect(draft.servicoId).toBeNull()
    expect(draft.profissionalId).toBeNull()
    expect(draft.data).toBeNull()
    expect(draft.horarioInicio).toBeNull()
    expect(draft.contatoNome).toBe('')
    expect(draft.contatoTelefone).toBe('')
  })
})
