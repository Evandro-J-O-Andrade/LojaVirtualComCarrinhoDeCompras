import { SEO_DEFAULTS } from '@/lib/seo'

export type MimoContexto = 'cuidar' | 'ritual' | 'presentear'

export const MIMO_CONTEXTOS: Record<
  MimoContexto,
  { rotulo: string; chamada: string }
> = {
  cuidar: {
    rotulo: 'Cuidar',
    chamada: 'Para o seu cuidado de hoje',
  },
  ritual: {
    rotulo: 'Ritual',
    chamada: 'Um ritual, todos os dias',
  },
  presentear: {
    rotulo: 'Presentear',
    chamada: 'Para quem você ama',
  },
}

export interface MimoProdutoRef {
  id: string
  slug: string
  nome: string
  preco: number | null
  imagem: string | null
}

export interface MimoKit {
  id: string
  slug: string
  nome: string
  preco: number | null
  imagem: string | null
  composicao: MimoProdutoRef[]
}

export interface MimoPromocao {
  id: string
  tipo: 'percentual' | 'fixo'
  valor: number
  dataFim: string
  produto: MimoProdutoRef
}

export type MimoSource = 'supabase' | 'editorial'

export interface Mimo {
  id: string
  slug: string
  nome: string
  titulo: string | null
  descricao: string | null
  contexto: MimoContexto | null
  imagem: string | null
  video: string | null
  seoTitulo: string | null
  seoDescricao: string | null
  produtos: MimoProdutoRef[]
  kit: MimoKit | null
  promocao: MimoPromocao | null
  source: MimoSource
}

export const MIMO_IMAGE_FALLBACK = '/images/hero-beauty.jpg'

export function toContexto(valor: string | null): MimoContexto | null {
  return valor === 'cuidar' || valor === 'ritual' || valor === 'presentear'
    ? valor
    : null
}

export function hojeISODate(): string {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'America/Sao_Paulo',
  })
}

export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
    'pt-BR',
    { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' },
  )
}

export function mimoOfereceKit(mimo: Mimo): boolean {
  return mimo.kit !== null && mimo.kit.composicao.length > 0
}

export function destinoComercial(mimo: Mimo): MimoProdutoRef | null {
  if (mimoOfereceKit(mimo) && mimo.kit!.preco !== null) return mimo.kit
  if (mimo.promocao && mimo.promocao.produto.preco !== null) {
    return mimo.promocao.produto
  }
  return mimo.produtos.find((produto) => produto.preco !== null) ?? null
}

export type MimoCtaKind = 'comprar' | 'sob-consulta'

export function resolveMimoCta(mimo: Mimo): MimoCtaKind {
  return destinoComercial(mimo) !== null ? 'comprar' : 'sob-consulta'
}

export function mimoCtaHref(mimo: Mimo): string {
  const destino = destinoComercial(mimo)
  return destino ? `/produtos/${destino.slug}` : '/orcamentos/novo'
}

export function mimoPrecoBase(mimo: Mimo): number | null {
  if (mimoOfereceKit(mimo) && mimo.kit!.preco !== null) return mimo.kit!.preco
  const precos = mimo.produtos
    .map((produto) => produto.preco)
    .filter((preco): preco is number => preco !== null)
  if (precos.length > 0) return Math.min(...precos)
  if (mimo.promocao && mimo.promocao.produto.preco !== null) {
    return mimo.promocao.produto.preco
  }
  return null
}

export function aplicarPromocao(
  preco: number,
  promocao: MimoPromocao,
): number {
  const calculado =
    promocao.tipo === 'percentual'
      ? preco * (1 - promocao.valor / 100)
      : preco - promocao.valor
  return Math.max(0, Math.round(calculado * 100) / 100)
}

export function promocaoEhValida(
  promocao: { ativo: boolean; dataInicio: string; dataFim: string },
): boolean {
  if (!promocao.ativo) return false
  const hoje = hojeISODate()
  return promocao.dataInicio <= hoje && promocao.dataFim >= hoje
}

export function mimoArticleJsonLd(mimo: Mimo): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: mimo.seoTitulo ?? mimo.titulo ?? mimo.nome,
  }
  if (mimo.descricao) jsonLd.description = mimo.descricao
  if (mimo.imagem) jsonLd.image = mimo.imagem
  jsonLd.publisher = {
    '@type': 'Organization',
    name: SEO_DEFAULTS.siteName,
    url: SEO_DEFAULTS.siteUrl,
  }
  return jsonLd
}
