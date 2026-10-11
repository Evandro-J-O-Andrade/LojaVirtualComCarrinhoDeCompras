import { isEmailValid, isPhoneValid, type AppointmentDraft, type ServiceProfessionalLink } from './appointment'
import type { AvailabilityState } from './availability'

export type BookingStepId =
  | 'servico'
  | 'profissional'
  | 'data'
  | 'horario'
  | 'dados'
  | 'resumo'

export const BOOKING_STEPS: readonly BookingStepId[] = [
  'servico',
  'profissional',
  'data',
  'horario',
  'dados',
  'resumo',
]

export const BOOKING_STEP_LABELS: Record<BookingStepId, string> = {
  servico: 'Serviço',
  profissional: 'Profissional',
  data: 'Data',
  horario: 'Horário',
  dados: 'Seus dados',
  resumo: 'Resumo',
}

export type ProfessionalStepOutcome =
  | { kind: 'loading' }
  | { kind: 'select-required' }
  | { kind: 'blocked' }
  | { kind: 'allowed' }

export function professionalStepOutcome(
  linkage: ServiceProfessionalLink | undefined,
  draft: AppointmentDraft,
): ProfessionalStepOutcome {
  if (linkage === undefined) return { kind: 'loading' }
  if (linkage.kind === 'unknown') return { kind: 'allowed' }
  if (linkage.professionals.length === 0) return { kind: 'blocked' }
  return draft.profissionalId ? { kind: 'allowed' } : { kind: 'select-required' }
}

export type TimeStepOutcome =
  | { kind: 'loading' }
  | { kind: 'select-slot' }
  | { kind: 'no-slots' }
  | { kind: 'unknown' }
  | { kind: 'ready' }

export function timeStepOutcome(
  availability: AvailabilityState | undefined,
  draft: AppointmentDraft,
): TimeStepOutcome {
  if (availability === undefined) return { kind: 'loading' }
  if (availability.kind === 'unknown') return { kind: 'unknown' }
  if (availability.kind === 'unavailable') return { kind: 'no-slots' }
  return draft.horarioInicio ? { kind: 'ready' } : { kind: 'select-slot' }
}

export function isCustomerStepComplete(draft: AppointmentDraft): boolean {
  if (draft.contatoNome.trim().length === 0) return false
  if (!isPhoneValid(draft.contatoTelefone)) return false
  if (draft.contatoEmail.trim() !== '' && !isEmailValid(draft.contatoEmail)) return false
  return true
}

export function stepIndex(step: BookingStepId): number {
  return BOOKING_STEPS.indexOf(step)
}
