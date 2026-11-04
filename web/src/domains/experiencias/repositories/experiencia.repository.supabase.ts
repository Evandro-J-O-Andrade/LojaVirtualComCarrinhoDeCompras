import { supabase } from '@/lib/supabase'
import type { Experiencia, ExperienciaMidia, ExperienciaStatus } from '../model/experiencia'
import type { ExperienciaRepository } from './experiencia.repository'

interface ExperienciaRow {
  id: number
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  status: string
  publicado_em: string | null
  expira_em: string | null
  imagem_capa: string | null
  video_url: string | null
  ordem: number
  criado_por: string | null
  criado_em: string
  atualizado_em: string
}

interface MidiaRow {
  id: number
  experiencia_id: number
  url: string
  tipo: string
  legenda: string | null
  ordem: number
  principal: boolean
  criado_em: string
}

function rowToExperiencia(row: ExperienciaRow, midias?: MidiaRow[]): Experiencia {
  return {
    id: row.id,
    titulo: row.titulo,
    slug: row.slug,
    resumo: row.resumo ?? undefined,
    conteudo: row.conteudo ?? undefined,
    status: row.status as ExperienciaStatus,
    publicadoEm: row.publicado_em ?? undefined,
    expiraEm: row.expira_em ?? undefined,
    imagemCapa: row.imagem_capa ?? undefined,
    videoUrl: row.video_url ?? undefined,
    ordem: row.ordem,
    criadoPor: row.criado_por ?? undefined,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    midias: midias?.map((m) => ({
      id: m.id,
      experienciaId: m.experiencia_id,
      url: m.url,
      tipo: m.tipo as ExperienciaMidia['tipo'],
      legenda: m.legenda ?? undefined,
      ordem: m.ordem,
      principal: m.principal,
      criadoEm: m.criado_em,
    })),
  }
}

export const experienciaRepositorySupabase: ExperienciaRepository = {
  async listar() {
    const { data, error } = await supabase
      .from('experiencia')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) {
      if (error.code === '42P01' || error.message.includes('404') || error.message.includes('does not exist')) return []
      throw error
    }
    return (data ?? []).map((r) => rowToExperiencia(r as ExperienciaRow))
  },

  async buscarPorId(id) {
    const { data: exp, error } = await supabase
      .from('experiencia')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !exp) return null

    const { data: midias } = await supabase
      .from('experiencia_midia')
      .select('*')
      .eq('experiencia_id', id)
      .order('ordem', { ascending: true })

    return rowToExperiencia(exp as ExperienciaRow, midias as MidiaRow[] | null ?? undefined)
  },

  async buscarPorSlug(slug) {
    const { data, error } = await supabase
      .from('experiencia')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !data) return null
    return rowToExperiencia(data as ExperienciaRow)
  },

  async criar(input) {
    const { data, error } = await supabase
      .from('experiencia')
      .insert({
        titulo: input.titulo,
        slug: input.slug,
        resumo: input.resumo ?? null,
        conteudo: input.conteudo ?? null,
        status: input.status ?? 'rascunho',
        publicado_em: input.publicadoEm ?? null,
        expira_em: input.expiraEm ?? null,
        imagem_capa: input.imagemCapa ?? null,
        video_url: input.videoUrl ?? null,
        ordem: input.ordem ?? 0,
      })
      .select()
      .single()
    if (error) throw error
    return rowToExperiencia(data as ExperienciaRow)
  },

  async atualizar(id, input) {
    const updates: Record<string, unknown> = {}
    if (input.titulo !== undefined) updates.titulo = input.titulo
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.resumo !== undefined) updates.resumo = input.resumo
    if (input.conteudo !== undefined) updates.conteudo = input.conteudo
    if (input.status !== undefined) updates.status = input.status
    if (input.publicadoEm !== undefined) updates.publicado_em = input.publicadoEm
    if (input.expiraEm !== undefined) updates.expira_em = input.expiraEm
    if (input.imagemCapa !== undefined) updates.imagem_capa = input.imagemCapa
    if (input.videoUrl !== undefined) updates.video_url = input.videoUrl
    if (input.ordem !== undefined) updates.ordem = input.ordem

    const { data, error } = await supabase
      .from('experiencia')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return rowToExperiencia(data as ExperienciaRow)
  },

  async excluir(id) {
    const { error } = await supabase.from('experiencia').delete().eq('id', id)
    if (error) throw error
  },

  async publicar(id) {
    return this.atualizar(id, { status: 'publicado', publicadoEm: new Date().toISOString() })
  },

  async arquivar(id) {
    return this.atualizar(id, { status: 'arquivado' })
  },

  async adicionarMidia(experienciaId, url, tipo = 'imagem', legenda, principal = false) {
    const { data, error } = await supabase
      .from('experiencia_midia')
      .insert({
        experiencia_id: experienciaId,
        url,
        tipo,
        legenda: legenda ?? null,
        principal,
      })
      .select()
      .single()
    if (error) throw error
    const m = data as MidiaRow
    return {
      id: m.id,
      experienciaId: m.experiencia_id,
      url: m.url,
      tipo: m.tipo as ExperienciaMidia['tipo'],
      legenda: m.legenda ?? undefined,
      ordem: m.ordem,
      principal: m.principal,
      criadoEm: m.criado_em,
    }
  },

  async removerMidia(id) {
    const { error } = await supabase.from('experiencia_midia').delete().eq('id', id)
    if (error) throw error
  },
}