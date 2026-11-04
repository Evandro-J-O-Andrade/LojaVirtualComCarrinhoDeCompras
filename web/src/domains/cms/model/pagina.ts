export type PaginaStatus = 'rascunho' | 'publicado' | 'arquivado'

export type PaginaMidiaTipo = 'imagem' | 'video' | 'banner'

export type PaginaBlocoTipo =
  | 'banner'
  | 'texto'
  | 'imagem'
  | 'video'
  | 'produtos_destaque'
  | 'categorias'
  | 'promocoes'
  | 'beneficios'
  | 'servicos'
  | 'cta'
  | 'galeria'

export interface PaginaBloco {
  id: number
  secaoId: number
  tipo: PaginaBlocoTipo
  titulo?: string
  subtitulo?: string
  conteudo?: string
  url?: string
  ordem: number
  visivel: boolean
  metadata?: Record<string, unknown>
  criadoEm: string
  atualizadoEm: string
}

export interface PaginaMidia {
  id: number
  paginaId: number
  secaoId?: number
  url: string
  tipo: PaginaMidiaTipo
  legenda?: string
  ordem: number
  principal: boolean
  criadoEm: string
}

export interface PaginaSecao {
  id: number
  paginaId: number
  tipo: string
  titulo?: string
  subtitulo?: string
  conteudo?: string
  ordem: number
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
  blocos?: PaginaBloco[]
}

export interface Pagina {
  id: number
  titulo: string
  slug: string
  resumo?: string
  conteudo?: string
  status: PaginaStatus
  publicadoEm?: string
  expiraEm?: string
  imagemCapa?: string
  videoUrl?: string
  ordem: number
  criadoPor?: string
  criadoEm: string
  atualizadoEm: string
  secoes?: PaginaSecao[]
  midias?: PaginaMidia[]
}

export interface PaginaInput {
  titulo: string
  slug: string
  resumo?: string
  conteudo?: string
  status?: PaginaStatus
  publicadoEm?: string
  expiraEm?: string
  imagemCapa?: string
  videoUrl?: string
  ordem?: number
}

export interface PaginaBlocoInput {
  secaoId: number
  tipo: PaginaBlocoTipo
  titulo?: string
  subtitulo?: string
  conteudo?: string
  url?: string
  ordem?: number
  visivel?: boolean
  metadata?: Record<string, unknown>
}
