import { describe, expect, it } from 'vitest'
import {
  isCustomerStepComplete,
  professionalStepOutcome,
  stepIndex,
  timeStepOutcome,
  BOOKING_STEPS,
} from './booking-state'
import {
  emptyDraft,
  type AppointmentDraft,
  type ServiceProfessionalLink,
} from './appointment'
import type { AvailabilityState } from './availability'

const knownLinkage: ServiceProfessionalLink = {
  kind: 'known',
  professionals: [{ id: '1', nome: 'Grasiely' }],
}

describe('etapa do profissional', () => {
  it('aguarda dados enquanto carrega', () => {
    expect(professionalStepOutcome(undefined, emptyDraft()).kind).toBe('loading')
  })

  it('permite continuar sem seleção quando o vínculo é desconhecido', () => {
    const linkage: ServiceProfessionalLink = { kind: 'unknown' }
    expect(professionalStepOutcome(linkage, emptyDraft()).kind).toBe('allowed')
  })

  it('bloqueia serviço sem profissional habilitado', () => {
    const linkage: ServiceProfessionalLink = { kind: 'known', professionals: [] }
    expect(professionalStepOutcome(linkage, emptyDraft()).kind).toBe('blocked')
  })

  it('exige seleção quando há profissionais vinculados', () => {
    expect(professionalStepOutcome(knownLinkage, emptyDraft()).kind).toBe(
      'select-required',
    )
  })

  it('libera com profissional selecionado', () => {
    const draft: AppointmentDraft = {
      ...emptyDraft(),
      profissionalId: '1',
      profissionalNome: 'Grasiely',
    }
    expect(professionalStepOutcome(knownLinkage, draft).kind).toBe('allowed')
  })
})

describe('etapa do horário', () => {
  it('aguarda o cálculo enquanto carrega', () => {
    expect(timeStepOutcome(undefined, emptyDraft()).kind).toBe('loading')
  })

  it('nunca fabrica slots quando a disponibilidade é desconhecida', () => {
    const state: AvailabilityState = { kind: 'unknown' }
    expect(timeStepOutcome(state, emptyDraft()).kind).toBe('unknown')
  })

  it('informa quando não há slots na data', () => {
    const state: AvailabilityState = { kind: 'unavailable' }
    expect(timeStepOutcome(state, emptyDraft()).kind).toBe('no-slots')
  })

  it('exige a escolha de um slot real', () => {
    const state: AvailabilityState = {
      kind: 'available',
      slots: [{ inicio: '2026-10-03T12:00:00Z', fim: '2026-10-03T13:00:00Z' }],
    }
    expect(timeStepOutcome(state, emptyDraft()).kind).toBe('select-slot')
  })

  it('libera somente com slot selecionado', () => {
    const state: AvailabilityState = {
      kind: 'available',
      slots: [{ inicio: '2026-10-03T12:00:00Z', fim: '2026-10-03T13:00:00Z' }],
    }
    const draft: AppointmentDraft = {
      ...emptyDraft(),
      horarioInicio: '2026-10-03T12:00:00Z',
    }
    expect(timeStepOutcome(state, draft).kind).toBe('ready')
  })
})

describe('etapa de dados do cliente', () => {
  it('exige nome e telefone válidos', () => {
    const draft: AppointmentDraft = {
      ...emptyDraft(),
      contatoNome: 'Mariana',
      contatoTelefone: '(11) 96320-5776',
    }
    expect(isCustomerStepComplete(draft)).toBe(true)
    expect(isCustomerStepComplete(emptyDraft())).toBe(false)
  })

  it('aceita e-mail em branco, mas não inválido', () => {
    const draft: AppointmentDraft = {
      ...emptyDraft(),
      contatoNome: 'Mariana',
      contatoTelefone: '11963205776',
      contatoEmail: 'mariana em angel.com',
    }
    expect(isCustomerStepComplete(draft)).toBe(false)
  })
})

describe('navegação entre etapas', () => {
  it('expõe a ordem fechada das etapas', () => {
    expect(BOOKING_STEPS).toEqual([
      'servico',
      'profissional',
      'data',
      'horario',
      'dados',
      'resumo',
    ])
    expect(stepIndex('resumo')).toBe(5)
  })
})
