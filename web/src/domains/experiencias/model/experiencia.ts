export type ExperienciaStatus = 'rascunho' | 'publicado' | 'arquivado'

export type ExperienciaMidiaTipo = 'imagem' | 'video' | 'banner'

export interface ExperienciaMidia {
  id: number
  experienciaId: number
  url: string
  tipo: ExperienciaMidiaTipo
  legenda?: string
  ordem: number
  principal: boolean
  criadoEm: string
}

export interface Experiencia {
  id: number
  titulo: string
  slug: string
  resumo?: string
  conteudo?: string
  status: ExperienciaStatus
  publicadoEm?: string
  expiraEm?: string
  imagemCapa?: string
  videoUrl?: string
  ordem: number
  criadoPor?: string
  criadoEm: string
  atualizadoEm: string
  midias?: ExperienciaMidia[]
}

export interface ExperienciaInput {
  titulo: string
  slug: string
  resumo?: string
  conteudo?: string
  status?: ExperienciaStatus
  publicadoEm?: string
  expiraEm?: string
  imagemCapa?: string
  videoUrl?: string
  ordem?: number
}