import { supabase } from '@/lib/supabase'
import type { Service } from '../model/service'
import {
  ServiceTableMissingError,
  type ServiceRepository,
  type ServiceInput,
} from './service.repository'

interface ServicoRow {
  id: number
  nome: string
  slug: string
  descricao: string | null
  duracao_minutos: number
  preco: number | null
  ativo: boolean
  imagem_capa: string | null
  video: string | null
  publico_alvo: string | null
  preparacao: string | null
  requer_agendamento: boolean
  requer_confirmacao: boolean
}

const SERVICO_SELECT = `
  id,
  nome,
  slug,
  descricao,
  duracao_minutos,
  preco,
  ativo,
  imagem_capa,
  video,
  publico_alvo,
  preparacao,
  requer_agendamento,
  requer_confirmacao
`

function toService(row: ServicoRow): Service {
  return {
    id: String(row.id),
    slug: row.slug,
    nome: row.nome,
    descricao: row.descricao ?? null,
    duracaoMinutos: row.duracao_minutos ?? null,
    preco: row.preco ?? null,
    imagemCapa: row.imagem_capa ?? null,
    video: row.video ?? null,
    publicoAlvo: row.publico_alvo ?? null,
    preparacao: row.preparacao ?? null,
    requerAgendamento: row.requer_agendamento,
    requerConfirmacao: row.requer_confirmacao,
    source: 'supabase',
  }
}

function isTableMissing(error: { code?: string }): boolean {
  return error.code === '42P01'
}

export class SupabaseServiceRepository implements ServiceRepository {
  async listServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('servico')
      .select(SERVICO_SELECT)
      .eq('ativo', true)
      .order('nome', { ascending: true })
    if (error) {
      if (isTableMissing(error)) throw new ServiceTableMissingError()
      throw error
    }
    return (data ?? []).map(toService)
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('servico')
      .select(SERVICO_SELECT)
      .eq('slug', slug)
      .eq('ativo', true)
      .single()
    if (error) {
      if (isTableMissing(error)) throw new ServiceTableMissingError()
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data ? toService(data as ServicoRow) : null
  }

  async listAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('servico')
      .select(SERVICO_SELECT)
      .order('nome', { ascending: true })
    if (error) {
      if (isTableMissing(error)) throw new ServiceTableMissingError()
      throw error
    }
    return (data ?? []).map(toService)
  }

  async createService(input: ServiceInput): Promise<Service> {
    const { data, error } = await supabase
      .from('servico')
      .insert({
        nome: input.nome,
        slug: input.slug,
        descricao: input.descricao ?? null,
        duracao_minutos: input.duracaoMinutos ?? 0,
        preco: input.preco ?? null,
        imagem_capa: input.imagemCapa ?? null,
        video: input.video ?? null,
        publico_alvo: input.publicoAlvo ?? null,
        preparacao: input.preparacao ?? null,
        requer_agendamento: input.requerAgendamento ?? true,
        requer_confirmacao: input.requerConfirmacao ?? true,
        ativo: input.ativo ?? true,
      })
      .select(SERVICO_SELECT)
      .single()
    if (error) {
      if (isTableMissing(error)) throw new ServiceTableMissingError()
      throw error
    }
    return toService(data as ServicoRow)
  }

  async updateService(id: string, input: Partial<ServiceInput>): Promise<Service> {
    const updates: Record<string, unknown> = {}
    if (input.nome !== undefined) updates.nome = input.nome
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.descricao !== undefined) updates.descricao = input.descricao
    if (input.duracaoMinutos !== undefined) updates.duracao_minutos = input.duracaoMinutos
    if (input.preco !== undefined) updates.preco = input.preco
    if (input.imagemCapa !== undefined) updates.imagem_capa = input.imagemCapa
    if (input.video !== undefined) updates.video = input.video
    if (input.publicoAlvo !== undefined) updates.publico_alvo = input.publicoAlvo
    if (input.preparacao !== undefined) updates.preparacao = input.preparacao
    if (input.requerAgendamento !== undefined) updates.requer_agendamento = input.requerAgendamento
    if (input.requerConfirmacao !== undefined) updates.requer_confirmacao = input.requerConfirmacao
    if (input.ativo !== undefined) updates.ativo = input.ativo

    const { data, error } = await supabase
      .from('servico')
      .update(updates)
      .eq('id', Number(id))
      .select(SERVICO_SELECT)
      .single()
    if (error) {
      if (isTableMissing(error)) throw new ServiceTableMissingError()
      throw error
    }
    return toService(data as ServicoRow)
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('servico').delete().eq('id', Number(id))
    if (error) {
      if (isTableMissing(error)) throw new ServiceTableMissingError()
      throw error
    }
  }
}