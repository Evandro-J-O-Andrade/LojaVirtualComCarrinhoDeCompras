import { describe, expect, it } from 'vitest'
import { BookingAdapter } from './booking.adapter'
import {
  BookingAccessRestrictedError,
  BookingBackendUnavailableError,
  BookingTableMissingError,
  type BookingRepository,
} from '../repositories/booking.repository'
import {
  emptyDraft,
  type AppointmentDraft,
  type BookingConfirmation,
  type ProfessionalPick,
} from '../model/appointment'
import type { AvailabilityDay } from '../model/availability'

class MissingTablesRepository implements BookingRepository {
  async listProfessionals(): Promise<ProfessionalPick[]> {
    throw new BookingTableMissingError()
  }

  async getAvailability(): Promise<AvailabilityDay> {
    throw new BookingBackendUnavailableError()
  }

  async createAppointment(): Promise<BookingConfirmation> {
    throw new BookingBackendUnavailableError()
  }
}

class RestrictedRepository implements BookingRepository {
  async listProfessionals(): Promise<ProfessionalPick[]> {
    throw new BookingAccessRestrictedError()
  }

  async getAvailability(): Promise<AvailabilityDay> {
    return { kind: 'unavailable' }
  }

  async createAppointment(): Promise<BookingConfirmation> {
    throw new Error('unexpected')
  }
}

class RealDataRepository implements BookingRepository {
  async listProfessionals(): Promise<ProfessionalPick[]> {
    return [{ id: '1', nome: 'Grasiely' }]
  }

  async getAvailability(): Promise<AvailabilityDay> {
    return {
      kind: 'available',
      slots: [{ inicio: '2026-10-03T12:00:00Z', fim: '2026-10-03T13:00:00Z' }],
    }
  }

  async createAppointment(draft: AppointmentDraft): Promise<BookingConfirmation> {
    return {
      protocolo: 'AG-20261003-000001',
      status: 'solicitado',
      servicoNome: draft.servicoNome ?? '',
      data: draft.data ?? '',
      horarioInicio: draft.horarioInicio ?? '',
    }
  }
}

describe('BookingAdapter', () => {
  it('traduz tabela ausente para vínculo desconhecido', async () => {
    const adapter = new BookingAdapter(new MissingTablesRepository())
    await expect(adapter.listProfessionals('1')).resolves.toEqual({
      kind: 'unknown',
    })
  })

  it('traduz acesso restrito para vínculo desconhecido', async () => {
    const adapter = new BookingAdapter(new RestrictedRepository())
    await expect(adapter.listProfessionals('1')).resolves.toEqual({
      kind: 'unknown',
    })
  })

  it('expõe profissionais reais quando o vínculo é legível', async () => {
    const adapter = new BookingAdapter(new RealDataRepository())
    await expect(adapter.listProfessionals('1')).resolves.toEqual({
      kind: 'known',
      professionals: [{ id: '1', nome: 'Grasiely' }],
    })
  })

  it('traduz backend ausente para disponibilidade desconhecida', async () => {
    const adapter = new BookingAdapter(new MissingTablesRepository())
    await expect(
      adapter.getAvailability('1', null, '2026-10-03'),
    ).resolves.toEqual({ kind: 'unknown' })
  })

  it('mantém o cálculo real quando o backend responde', async () => {
    const adapter = new BookingAdapter(new RealDataRepository())
    await expect(
      adapter.getAvailability('1', null, '2026-10-03'),
    ).resolves.toEqual({
      kind: 'available',
      slots: [{ inicio: '2026-10-03T12:00:00Z', fim: '2026-10-03T13:00:00Z' }],
    })
  })

  it('propaga erros inesperados em vez de mascará-los', async () => {
    const adapter = new BookingAdapter(new RestrictedRepository())
    await expect(
      adapter.createAppointment({ ...emptyDraft(), servicoId: '1' }),
    ).rejects.toThrow('unexpected')
  })

  it('cria agendamento com confirmação real do backend', async () => {
    const adapter = new BookingAdapter(new RealDataRepository())
    const confirmation = await adapter.createAppointment({
      ...emptyDraft(),
      servicoId: '1',
      servicoNome: 'Sessão de Maquiagem',
      data: '2026-10-03',
      horarioInicio: '2026-10-03T12:00:00Z',
    })
    expect(confirmation.protocolo).toBe('AG-20261003-000001')
    expect(confirmation.status).toBe('solicitado')
  })
})
