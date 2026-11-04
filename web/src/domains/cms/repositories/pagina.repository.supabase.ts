import { supabase } from '@/lib/supabase'
import type { Pagina, PaginaMidia, PaginaStatus, PaginaBloco, PaginaBlocoInput } from '../model/pagina'
import type { PaginaRepository } from './pagina.repository'

interface PaginaRow {
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

interface SecaoRow {
  id: number
  pagina_id: number
  tipo: string
  titulo: string | null
  subtitulo: string | null
  conteudo: string | null
  ordem: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
  blocos?: BlocoRow[]
}

interface BlocoRow {
  id: number
  secao_id: number
  tipo: string
  titulo: string | null
  subtitulo: string | null
  conteudo: string | null
  url: string | null
  ordem: number
  visivel: boolean
  metadata: Record<string, unknown> | null
  criado_em: string
  atualizado_em: string
}

interface MidiaRow {
  id: number
  pagina_id: number | null
  secao_id: number | null
  url: string
  tipo: string
  legenda: string | null
  ordem: number
  principal: boolean
  criado_em: string
}

function rowToPagina(row: PaginaRow, secoes?: SecaoRow[], midias?: MidiaRow[]): Pagina {
  return {
    id: row.id,
    titulo: row.titulo,
    slug: row.slug,
    resumo: row.resumo ?? undefined,
    conteudo: row.conteudo ?? undefined,
    status: row.status as PaginaStatus,
    publicadoEm: row.publicado_em ?? undefined,
    expiraEm: row.expira_em ?? undefined,
    imagemCapa: row.imagem_capa ?? undefined,
    videoUrl: row.video_url ?? undefined,
    ordem: row.ordem,
    criadoPor: row.criado_por ?? undefined,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    secoes: secoes?.map((s) => ({
      id: s.id,
      paginaId: s.pagina_id,
      tipo: s.tipo,
      titulo: s.titulo ?? undefined,
      subtitulo: s.subtitulo ?? undefined,
      conteudo: s.conteudo ?? undefined,
      ordem: s.ordem,
      ativo: s.ativo,
      criadoEm: s.criado_em,
      atualizadoEm: s.atualizado_em,
      blocos: (s.blocos ?? []).map((b) => ({
        id: b.id,
        secaoId: b.secao_id,
        tipo: b.tipo as PaginaBloco['tipo'],
        titulo: b.titulo ?? undefined,
        subtitulo: b.subtitulo ?? undefined,
        conteudo: b.conteudo ?? undefined,
        url: b.url ?? undefined,
        ordem: b.ordem,
        visivel: b.visivel,
        metadata: b.metadata ?? undefined,
        criadoEm: b.criado_em,
        atualizadoEm: b.atualizado_em,
      })),
    })),
    midias: midias?.map((m) => ({
      id: m.id,
      paginaId: m.pagina_id ?? 0,
      secaoId: m.secao_id ?? undefined,
      url: m.url,
      tipo: m.tipo as PaginaMidia['tipo'],
      legenda: m.legenda ?? undefined,
      ordem: m.ordem,
      principal: m.principal,
      criadoEm: m.criado_em,
    })),
  }
}

async function carregarCompleto(paginaId: number): Promise<Pagina> {
  const { data: pagina, error: paginaErr } = await supabase
    .from('pagina')
    .select('*')
    .eq('id', paginaId)
    .single()
  if (paginaErr) throw paginaErr
  if (!pagina) throw new Error('Página não encontrada')

  const { data: secoes, error: secoesErr } = await supabase
    .from('pagina_secao')
    .select('*')
    .eq('pagina_id', paginaId)
    .order('ordem', { ascending: true })
  if (secoesErr) throw secoesErr

  const secoesComBlocos = await Promise.all(
    ((secoes as SecaoRow[] | null) ?? []).map(async (s) => {
      const { data: blocos, error: blocosErr } = await supabase
        .from('pagina_bloco')
        .select('*')
        .eq('secao_id', s.id)
        .order('ordem', { ascending: true })
      if (blocosErr) throw blocosErr
      return { ...s, blocos: (blocos as BlocoRow[] | null) ?? [] }
    }),
  )

  const { data: midias, error: midiasErr } = await supabase
    .from('pagina_midia')
    .select('*')
    .eq('pagina_id', paginaId)
    .order('ordem', { ascending: true })
  if (midiasErr) throw midiasErr

  return rowToPagina(
    pagina as PaginaRow,
    secoesComBlocos as SecaoRow[],
    (midias as MidiaRow[] | null) ?? undefined,
  )
}

export const paginaRepositorySupabase: PaginaRepository = {
  async listar() {
    const { data, error } = await supabase
      .from('pagina')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r) => rowToPagina(r as PaginaRow))
  },

  async buscarPorId(id) {
    try {
      return await carregarCompleto(id)
    } catch {
      return null
    }
  },

  async buscarPorSlug(slug) {
    const { data: pagina, error } = await supabase
      .from('pagina')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    if (!pagina) return null
    return carregarCompleto((pagina as PaginaRow).id)
  },

  async criar(input) {
    const { data, error } = await supabase
      .from('pagina')
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
    return rowToPagina(data as PaginaRow)
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
      .from('pagina')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return rowToPagina(data as PaginaRow)
  },

  async excluir(id) {
    const { error } = await supabase.from('pagina').delete().eq('id', id)
    if (error) throw error
  },

  async publicar(id) {
    return this.atualizar(id, { status: 'publicado', publicadoEm: new Date().toISOString() })
  },

  async arquivar(id) {
    return this.atualizar(id, { status: 'arquivado' })
  },

  async adicionarMidia(paginaId, url, tipo = 'imagem', legenda, principal = false) {
    const { data, error } = await supabase
      .from('pagina_midia')
      .insert({
        pagina_id: paginaId,
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
      paginaId: m.pagina_id ?? paginaId,
      secaoId: m.secao_id ?? undefined,
      url: m.url,
      tipo: m.tipo as PaginaMidia['tipo'],
      legenda: m.legenda ?? undefined,
      ordem: m.ordem,
      principal: m.principal,
      criadoEm: m.criado_em,
    }
  },

  async removerMidia(id) {
    const { error } = await supabase.from('pagina_midia').delete().eq('id', id)
    if (error) throw error
  },

  async adicionarSecao(paginaId, tipo, titulo, conteudo) {
    const { data, error } = await supabase
      .from('pagina_secao')
      .insert({
        pagina_id: paginaId,
        tipo,
        titulo: titulo ?? null,
        conteudo: conteudo ?? null,
      })
      .select()
      .single()
    if (error) throw error
    const s = data as SecaoRow
    return {
      id: s.id,
      paginaId: s.pagina_id,
      tipo: s.tipo,
      titulo: s.titulo ?? undefined,
      subtitulo: s.subtitulo ?? undefined,
      conteudo: s.conteudo ?? undefined,
      ordem: s.ordem,
      ativo: s.ativo,
      criadoEm: s.criado_em,
      atualizadoEm: s.atualizado_em,
    }
  },

  async removerSecao(id) {
    const { error } = await supabase.from('pagina_secao').delete().eq('id', id)
    if (error) throw error
  },

  async adicionarBloco(input: PaginaBlocoInput) {
    const { data, error } = await supabase
      .from('pagina_bloco')
      .insert({
        secao_id: input.secaoId,
        tipo: input.tipo,
        titulo: input.titulo ?? null,
        subtitulo: input.subtitulo ?? null,
        conteudo: input.conteudo ?? null,
        url: input.url ?? null,
        ordem: input.ordem ?? 0,
        visivel: input.visivel ?? true,
        metadata: input.metadata ?? null,
      })
      .select()
      .single()
    if (error) throw error
    const b = data as { id: number; secao_id: number; tipo: string; titulo: string | null; subtitulo: string | null; conteudo: string | null; url: string | null; ordem: number; visivel: boolean; criado_em: string; atualizado_em: string }
    return {
      id: b.id,
      secaoId: b.secao_id,
      tipo: b.tipo as PaginaBloco['tipo'],
      titulo: b.titulo ?? undefined,
      subtitulo: b.subtitulo ?? undefined,
      conteudo: b.conteudo ?? undefined,
      url: b.url ?? undefined,
      ordem: b.ordem,
      visivel: b.visivel,
      criadoEm: b.criado_em,
      atualizadoEm: b.atualizado_em,
    }
  },

  async removerBloco(id) {
    const { error } = await supabase.from('pagina_bloco').delete().eq('id', id)
    if (error) throw error
  },
}