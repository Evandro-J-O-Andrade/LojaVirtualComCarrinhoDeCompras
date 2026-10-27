import type { CategoriaRef, Produto } from './produto'

export interface CategoriaComercial {
  slug: string
  nome: string
  descricao: string
  imagem: string | null
  imagemAlt: string
  aliases: string[]
  href: string
}

const CATEGORIAS_EDITORIAIS: Record<string, {
  slug: string
  descricao: string
  imagem: string
  imagemAlt: string
}> = {
  'beleza-e-maquiagem': {
    slug: 'beleza-e-maquiagem',
    descricao: 'Cuidado com a pele, maquiagem, fragrâncias e acabamento — uma curadoria para a sua rotina.',
    imagem: '/images/categoria-beleza.jpg',
    imagemAlt: 'Composição editorial de beleza e maquiagem',
  },
  maquiagem: {
    slug: 'maquiagem',
    descricao: 'Cor, produção e acabamento — com a sua assinatura.',
    imagem: '/assets/img/produtos/produto-1.jpg',
    imagemAlt: 'Produto da categoria maquiagem',
  },
  fragrancias: {
    slug: 'fragrancias',
    descricao: 'Assinaturas olfativas para o dia e para a noite.',
    imagem: '/assets/img/produtos/produto-5.jpg',
    imagemAlt: 'Produto da categoria fragrâncias',
  },
  casa: {
    slug: 'casa',
    descricao: 'O ritual de cuidado também na casa.',
    imagem: '/images/categoria-casa.jpg',
    imagemAlt: 'Composição editorial de casa e bem-estar',
  },
}

export const CATEGORIAS_COMERCIAIS: CategoriaComercial[] = [
  {
    slug: 'beleza-e-maquiagem',
    nome: 'Beleza & Cosméticos',
    descricao: 'Cuidados pessoais, maquiagem e fragrâncias para acompanhar a sua rotina.',
    imagem: '/images/categoria-beleza.jpg',
    imagemAlt: 'Curadoria de beleza e cosméticos',
    aliases: ['beleza-e-maquiagem', 'beleza', 'cosmeticos', 'maquiagem', 'fragrancias', 'perfumaria', 'skincare', 'cuidados-pessoais'],
    href: '/categorias/beleza-e-maquiagem',
  },
  {
    slug: 'moda-e-lingerie',
    nome: 'Moda & Lingerie',
    descricao: 'Peças para vestir, escolher com confiança e encontrar o caimento certo.',
    imagem: '/images/categoria-moda.jpg',
    imagemAlt: 'Editorial da categoria moda e lingerie',
    aliases: ['moda-e-lingerie', 'moda-feminina', 'moda', 'lingerie', 'roupas', 'vestuario'],
    href: '/categorias/moda-e-lingerie',
  },
  {
    slug: 'cama-mesa-banho',
    nome: 'Cama, Mesa & Banho',
    descricao: 'Têxteis e itens para deixar a casa mais confortável e acolhedora.',
    imagem: '/images/categoria-casa.jpg',
    imagemAlt: 'Editorial de casa, cama, mesa e banho',
    aliases: ['cama-mesa-banho', 'cama-mesa-e-banho', 'casa', 'cama', 'mesa', 'banho', 'roupa-de-cama', 'toalhas', 'cama-mesa-e-banho'],
    href: '/categorias/cama-mesa-banho',
  },
  {
    slug: 'kits-e-presentes',
    nome: 'Kits & Presentes',
    descricao: 'Combinações e mimos cadastrados para presentear sem perder o toque pessoal.',
    imagem: null,
    imagemAlt: 'Kits e presentes Angel',
    aliases: [],
    href: '/mimos',
  },
]

export function normalizarSlugCategoria(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function categoriaComercialPorSlug(
  slug: string,
): CategoriaComercial | undefined {
  const normalizado = normalizarSlugCategoria(slug)
  return CATEGORIAS_COMERCIAIS.find(
    (categoria) => categoria.slug === normalizado,
  )
}

export function produtoPertenceCategoriaComercial(
  produto: Produto,
  categoria: CategoriaComercial,
): boolean {
  if (categoria.aliases.length === 0) return false
  const aliases = new Set(categoria.aliases.map(normalizarSlugCategoria))
  return produto.categorias.some((referencia) =>
    aliases.has(normalizarSlugCategoria(referencia.slug)) ||
    aliases.has(normalizarSlugCategoria(referencia.nome)),
  )
}

export function categoriaBaseDaCategoriaComercial(
  categoria: CategoriaComercial,
  categorias: CategoriaRef[],
): CategoriaRef | undefined {
  const aliases = new Set(categoria.aliases.map(normalizarSlugCategoria))
  return categorias.find((referencia) =>
    aliases.has(normalizarSlugCategoria(referencia.slug)) ||
    aliases.has(normalizarSlugCategoria(referencia.nome)),
  )
}

/**
 * Mídia da categoria: primeiro usa metadado editorial
 * conhecido; em seguida, a primeira foto real de um
 * produto associado. Ausência de mídia cai no fallback
 * acessível do componente — nunca numa URL inventada.
 */
export function midiaDaCategoria(
  categoria: CategoriaRef,
  produtos: Produto[],
): { url: string; alt: string } | null {
  const editorial = CATEGORIAS_EDITORIAIS[categoria.slug]
  if (editorial) {
    return { url: editorial.imagem, alt: editorial.imagemAlt }
  }
  const primeiro = produtos.find((produto) =>
    produto.categorias.some((c) => c.slug === categoria.slug),
  )
  const imagem = primeiro?.imagens.find((item) => item.principal)
    ?? primeiro?.imagens[0]
  if (imagem) {
    return { url: imagem.url, alt: imagem.alt ?? categoria.nome }
  }
  return null
}

export function midiaDaCategoriaComercial(
  categoria: CategoriaComercial,
  categorias: CategoriaRef[],
  produtos: Produto[],
): { url: string; alt: string } | null {
  const categoriaBase = categoriaBaseDaCategoriaComercial(categoria, categorias)
  if (categoriaBase) {
    const midia = midiaDaCategoria(categoriaBase, produtos)
    if (midia) return midia
  }
  return categoria.imagem
    ? { url: categoria.imagem, alt: categoria.imagemAlt }
    : null
}

export function descricaoDaCategoria(categoria: CategoriaRef): string {
  return (
    CATEGORIAS_EDITORIAIS[categoria.slug]?.descricao ??
    `Produtos da categoria ${categoria.nome}.`
  )
}
