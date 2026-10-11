import type {
  AppointmentDraft,
  BookingConfirmation,
  ServiceProfessionalLink,
} from '../model/appointment'
import type { AvailabilityState } from '../model/availability'
import {
  BookingAccessRestrictedError,
  BookingBackendUnavailableError,
  BookingTableMissingError,
  type BookingRepository,
} from '../repositories/booking.repository'

export interface BookingService {
  listProfessionals(serviceId: string): Promise<ServiceProfessionalLink>
  getAvailability(
    serviceId: string,
    professionalId: string | null,
    date: string,
  ): Promise<AvailabilityState>
  createAppointment(draft: AppointmentDraft): Promise<BookingConfirmation>
}

export class BookingAdapter implements BookingService {
  private readonly repository: BookingRepository

  constructor(repository: BookingRepository) {
    this.repository = repository
  }

  async listProfessionals(serviceId: string): Promise<ServiceProfessionalLink> {
    try {
      const professionals = await this.repository.listProfessionals(serviceId)
      return { kind: 'known', professionals }
    } catch (error) {
      if (
        error instanceof BookingTableMissingError ||
        error instanceof BookingAccessRestrictedError
      ) {
        return { kind: 'unknown' }
      }
      throw error
    }
  }

  async getAvailability(
    serviceId: string,
    professionalId: string | null,
    date: string,
  ): Promise<AvailabilityState> {
    try {
      return await this.repository.getAvailability(serviceId, professionalId, date)
    } catch (error) {
      if (error instanceof BookingBackendUnavailableError) {
        return { kind: 'unknown' }
      }
      throw error
    }
  }

  async createAppointment(draft: AppointmentDraft): Promise<BookingConfirmation> {
    return this.repository.createAppointment(draft)
  }
}
