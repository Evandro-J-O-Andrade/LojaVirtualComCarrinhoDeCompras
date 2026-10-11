import { supabase } from '@/lib/supabase'
import {
  isProtocolo,
  type AppointmentDraft,
  type BookingConfirmation,
  type ProfessionalPick,
} from '../model/appointment'
import type { AvailabilityDay, TimeSlot } from '../model/availability'
import {
  BookingAccessRestrictedError,
  BookingBackendUnavailableError,
  BookingTableMissingError,
  type BookingRepository,
} from './booking.repository'

const RESTRICTED_CODES = ['403', '401', '42501']

function servicoIdNumber(serviceId: string): number {
  const id = Number(serviceId)
  if (!Number.isFinite(id)) {
    throw new BookingAccessRestrictedError('Serviço sem identificador de banco.')
  }
  return id
}

export class SupabaseBookingRepository implements BookingRepository {
  async listProfessionals(serviceId: string): Promise<ProfessionalPick[]> {
    const servicoId = servicoIdNumber(serviceId)
    const { data, error } = await supabase
      .from('profissional_servico')
      .select('profissional_id')
      .eq('servico_id', servicoId)
    if (error) {
      if (error.code === '42P01') throw new BookingTableMissingError()
      if (RESTRICTED_CODES.includes(error.code ?? '')) {
        throw new BookingAccessRestrictedError()
      }
      throw error
    }
    const profissionalIds = (data ?? []).map((row: { profissional_id: number }) =>
      String(row.profissional_id),
    )
    if (profissionalIds.length === 0) return []
    const { data: profissionais, error: nomesError } = await supabase
      .from('profissional_publico')
      .select('id, nome')
    if (nomesError || !profissionais) throw new BookingAccessRestrictedError()
    const nomes = new Map(
      (profissionais as Array<{ id: number; nome: string }>).map((p) => [
        String(p.id),
        p.nome,
      ]),
    )
    return profissionalIds
      .map((id) => ({ id, nome: nomes.get(id) ?? '' }))
      .filter((pick) => pick.nome.length > 0)
  }

  async getAvailability(
    serviceId: string,
    professionalId: string | null,
    date: string,
  ): Promise<AvailabilityDay> {
    const servicoId = servicoIdNumber(serviceId)
    const { data, error } = await supabase.functions.invoke('booking-availability', {
      body: {
        servico_id: servicoId,
        profissional_id: professionalId ? Number(professionalId) : null,
        data: date,
      },
    })
    if (error) throw new BookingBackendUnavailableError()
    const slots = (data?.slots ?? []) as TimeSlot[]
    const validos = slots.filter(
      (slot) => typeof slot?.inicio === 'string' && typeof slot?.fim === 'string',
    )
    if (validos.length !== slots.length) {
      throw new BookingBackendUnavailableError('Resposta de disponibilidade inválida.')
    }
    return validos.length > 0
      ? { kind: 'available', slots: validos }
      : { kind: 'unavailable' }
  }

  async createAppointment(draft: AppointmentDraft): Promise<BookingConfirmation> {
    if (draft.servicoId === null) {
      throw new BookingBackendUnavailableError('Rascunho sem serviço.')
    }
    const servicoId = servicoIdNumber(draft.servicoId)
    const { data, error } = await supabase.functions.invoke('booking-create', {
      body: {
        servico_id: servicoId,
        profissional_id: draft.profissionalId ? Number(draft.profissionalId) : null,
        data: draft.data,
        horario_inicio: draft.horarioInicio,
        duracao_minutos: draft.duracaoMinutos,
        contato_nome: draft.contatoNome,
        contato_telefone: draft.contatoTelefone,
        contato_email: draft.contatoEmail || null,
        observacao: draft.observacao || null,
        origem: 'site',
      },
    })
    if (error) throw new BookingBackendUnavailableError()
    const resposta = data as Partial<BookingConfirmation> | null
    const protocolo = resposta?.protocolo
    if (!protocolo || !isProtocolo(protocolo)) {
      throw new BookingBackendUnavailableError('Resposta de agendamento inválida.')
    }
    return {
      protocolo,
      status: resposta?.status === 'confirmado' ? 'confirmado' : 'solicitado',
      servicoNome: resposta?.servicoNome ?? draft.servicoNome ?? '',
      data: resposta?.data ?? draft.data ?? '',
      horarioInicio: resposta?.horarioInicio ?? draft.horarioInicio ?? '',
    }
  }
}
