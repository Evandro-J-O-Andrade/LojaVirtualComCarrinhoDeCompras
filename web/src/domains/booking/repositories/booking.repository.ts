import type {
  AppointmentDraft,
  BookingConfirmation,
  ProfessionalPick,
} from '../model/appointment'
import type { AvailabilityDay } from '../model/availability'

export class BookingTableMissingError extends Error {
  readonly code = 'BOOKING_TABLE_MISSING' as const

  constructor(message = 'As tabelas de agendamento ainda não existem no banco.') {
    super(message)
    this.name = 'BookingTableMissingError'
  }
}

export class BookingAccessRestrictedError extends Error {
  readonly code = 'BOOKING_ACCESS_RESTRICTED' as const

  constructor(message = 'Acesso restrito aos dados de agendamento.') {
    super(message)
    this.name = 'BookingAccessRestrictedError'
  }
}

export class BookingBackendUnavailableError extends Error {
  readonly code = 'BOOKING_BACKEND_UNAVAILABLE' as const

  constructor(message = 'O serviço de agendamento não está disponível no momento.') {
    super(message)
    this.name = 'BookingBackendUnavailableError'
  }
}

export interface BookingRepository {
  listProfessionals(serviceId: string): Promise<ProfessionalPick[]>
  getAvailability(
    serviceId: string,
    professionalId: string | null,
    date: string,
  ): Promise<AvailabilityDay>
  createAppointment(draft: AppointmentDraft): Promise<BookingConfirmation>
}
