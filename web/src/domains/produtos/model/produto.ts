import { SEO_DEFAULTS } from '@/lib/seo'

export type ProdutoSource = 'supabase' | 'editorial'

export type AtributoTipo = 'tamanho' | 'cor' | 'volume'

export interface ProdutoImagem {
  id: string
  url: string
  ordem: number
  principal: boolean
  alt: string | null
  titulo: string | null
}

export interface CategoriaRef {
  id: string
  nome: string
  slug: string
}

export interface FornecedorRef {
  id: string
  nome: string
}

export interface VarianteAtributo {
  tipo: AtributoTipo
  valor: string
}

export interface ProdutoVariante {
  id: string
  sku: string
  preco: number
  ativo: boolean
  peso: number | null
  atributos: VarianteAtributo[]
}

export interface Promocao {
  id: string
  tipo: 'percentual' | 'fixo'
  valor: number
  dataInicio: string
  dataFim: string
  ativo: boolean
}

export interface EstoqueInfo {
  disponivel: number
}

export interface Avaliacao {
  nota: number
  total: number
}

export interface Produto {
  id: string
  sku: string | null
  nome: string
  slug: string
  descricao: string | null
  precoBase: number
  imagens: ProdutoImagem[]
  video: string | null
  beneficio: string | null
  historia: string | null
  categorias: CategoriaRef[]
  fornecedor: FornecedorRef | null
  variantes: ProdutoVariante[]
  promocoes: Promocao[]
  estoque: EstoqueInfo | null
  avaliacao: Avaliacao | null
  comoUsar: string | null
  informacoes: string | null
  composicao: ProdutoRef[]
  ativo: boolean
  source: ProdutoSource
}

export interface ProdutoRef {
  id: string
  slug: string
  nome: string
  preco: number | null
  imagem: string | null
}

export interface ProdutoFiltro {
  search?: string
  categoriaSlug?: string
  /** Administração: lista também os inativos. */
  incluirInativos?: boolean
}

export const PRODUTO_IMAGE_FALLBACK = '/images/placeholder-product.jpg'

export const ATIVOS_ACEITOS: AtributoTipo[] = ['tamanho', 'cor', 'volume']

export function toAtributoTipo(valor: string | null): AtributoTipo | null {
  return valor === 'tamanho' || valor === 'cor' || valor === 'volume'
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

export function imagensOrdenadas(produto: Produto): ProdutoImagem[] {
  return [...produto.imagens].sort((a, b) => a.ordem - b.ordem)
}

export function imagemPrincipal(produto: Produto): string | null {
  const ordenadas = imagensOrdenadas(produto)
  const principal = ordenadas.find((imagem) => imagem.principal) ?? ordenadas[0]
  return principal?.url ?? null
}

export function imagemOuFallback(produto: Produto): string {
  return imagemPrincipal(produto) ?? PRODUTO_IMAGE_FALLBACK
}

export function imagensParaGaleria(produto: Produto): string[] {
  const urls = imagensOrdenadas(produto).map((imagem) => imagem.url)
  return urls.length > 0 ? urls : [PRODUTO_IMAGE_FALLBACK]
}

export interface MidiaProduto {
  tipo: 'imagem' | 'video'
  url: string
  alt: string | null
  titulo: string | null
}

/**
 * Mídia ordenada do produto: imagens por ordem e, ao final,
 * o vídeo de demonstração. Uma mídia ausente simplesmente
 * não entra na lista — sem URL inventada.
 */
export function midiasDoProduto(produto: Produto): MidiaProduto[] {
  const midias: MidiaProduto[] = imagensOrdenadas(produto).map(
    (imagem) => ({
      tipo: 'imagem' as const,
      url: imagem.url,
      alt: imagem.alt,
      titulo: imagem.titulo,
    }),
  )
  if (produto.video) {
    midias.push({
      tipo: 'video' as const,
      url: produto.video,
      alt: null,
      titulo: null,
    })
  }
  return midias
}

export function temVideo(produto: Produto): boolean {
  return produto.video !== null
}

export function temVariantes(produto: Produto): boolean {
  return produto.variantes.some((variante) => variante.ativo)
}

export function variantePorId(
  produto: Produto,
  varianteId: string | null,
): ProdutoVariante | null {
  if (!varianteId) return null
  return (
    produto.variantes.find(
      (variante) => variante.id === varianteId && variante.ativo,
    ) ?? null
  )
}

export function promocaoEhValida(promocao: Promocao): boolean {
  if (!promocao.ativo) return false
  const hoje = hojeISODate()
  return promocao.dataInicio <= hoje && promocao.dataFim >= hoje
}

export function aplicarPromocao(preco: number, promocao: Promocao): number {
  const calculado =
    promocao.tipo === 'percentual'
      ? preco * (1 - promocao.valor / 100)
      : preco - promocao.valor
  return Math.max(0, Math.round(calculado * 100) / 100)
}

export function promocoesValidas(produto: Produto): Promocao[] {
  return produto.promocoes.filter((promocao) => promocaoEhValida(promocao))
}

export function melhorPromocao(produto: Produto, preco: number): Promocao | null {
  const validas = promocoesValidas(produto)
  if (validas.length === 0) return null
  let melhor: Promocao | null = null
  let menor = preco
  for (const promocao of validas) {
    const resultante = aplicarPromocao(preco, promocao)
    if (resultante < menor) {
      menor = resultante
      melhor = promocao
    }
  }
  return melhor
}

export function precoBase(
  produto: Produto,
  variante?: ProdutoVariante | null,
): number {
  return variante?.preco ?? produto.precoBase
}

export function precoOfertado(
  produto: Produto,
  variante?: ProdutoVariante | null,
): number {
  const base = precoBase(produto, variante)
  const promocao = melhorPromocao(produto, base)
  return promocao ? aplicarPromocao(base, promocao) : base
}

export function temPromocaoValida(produto: Produto): boolean {
  return melhorPromocao(produto, produto.precoBase) !== null
}

export type Disponibilidade = 'em_estoque' | 'sem_estoque' | 'sob_consulta'

export function disponibilidade(produto: Produto): Disponibilidade {
  if (!produto.estoque) return 'sob_consulta'
  return produto.estoque.disponivel > 0 ? 'em_estoque' : 'sem_estoque'
}

export function rotuloDisponibilidade(produto: Produto): string {
  switch (disponibilidade(produto)) {
    case 'em_estoque':
      return 'Em estoque'
    case 'sem_estoque':
      return 'Esgotado'
    default:
      return 'Sob consulta'
  }
}

export function produtoRef(produto: Produto): ProdutoRef {
  return {
    id: produto.id,
    slug: produto.slug,
    nome: produto.nome,
    preco: produto.precoBase,
    imagem: imagemPrincipal(produto),
  }
}

export function produtoJsonLd(
  produto: Produto,
  variante?: ProdutoVariante | null,
): Record<string, unknown> {
  const imagem = imagemPrincipal(produto)
  const categoria = produto.categorias[0]?.nome
  const fornecedor = produto.fornecedor?.nome
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    image: imagem ? [imagem] : undefined,
    description: produto.descricao ?? undefined,
    sku: variante?.sku ?? produto.sku ?? undefined,
    brand: { '@type': 'Brand', name: fornecedor ?? SEO_DEFAULTS.siteName },
    category: categoria,
    offers: {
      '@type': 'Offer',
      url: `${SEO_DEFAULTS.siteUrl}/produtos/${produto.slug}`,
      priceCurrency: 'BRL',
      price: precoOfertado(produto, variante),
      availability:
        disponibilidade(produto) === 'sem_estoque'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  }
  return jsonLd
}
