import { supabase } from '@/lib/supabase'
import type { Service } from '../model/service'
import {
  ServiceTableMissingError,
  type ServiceRepository,
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
    return data ? toService(data) : null
  }
}
