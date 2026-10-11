export const PROTOCOLO_REGEX = /^AG-[0-9]{8}-[0-9]{6}$/

export const BOOKING_STATUSES = [
  'solicitado',
  'confirmado',
  'concluido',
  'cancelado',
  'nao_compareceu',
  'reagendado',
  'expirado',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export interface ProfessionalPick {
  id: string
  nome: string
}

export type ServiceProfessionalLink =
  | { kind: 'known'; professionals: ProfessionalPick[] }
  | { kind: 'unknown' }

export interface AppointmentDraft {
  servicoId: string | null
  servicoSlug: string | null
  servicoNome: string | null
  duracaoMinutos: number | null
  profissionalId: string | null
  profissionalNome: string | null
  data: string | null
  horarioInicio: string | null
  contatoNome: string
  contatoTelefone: string
  contatoEmail: string
  observacao: string
}

export interface BookingConfirmation {
  protocolo: string
  status: Extract<BookingStatus, 'solicitado' | 'confirmado'>
  servicoNome: string
  data: string
  horarioInicio: string
}

export function emptyDraft(): AppointmentDraft {
  return {
    servicoId: null,
    servicoSlug: null,
    servicoNome: null,
    duracaoMinutos: null,
    profissionalId: null,
    profissionalNome: null,
    data: null,
    horarioInicio: null,
    contatoNome: '',
    contatoTelefone: '',
    contatoEmail: '',
    observacao: '',
  }
}

export function isProtocolo(value: string): boolean {
  return PROTOCOLO_REGEX.test(value)
}

export function isPhoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 11
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
