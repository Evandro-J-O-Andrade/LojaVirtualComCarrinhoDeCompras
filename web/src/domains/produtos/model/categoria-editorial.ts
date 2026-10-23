import type { CategoriaRef, Produto } from './produto'

interface CategoriaEditorial {
  slug: string
  descricao: string
  imagem: string
  imagemAlt: string
}

/**
 * Metadados editoriais das categorias do
 * catálogo. Toda imagem é real: fotos de
 * categoria (/images/categoria-*.jpg) ou a
 * primeira foto real de um produto da própria
 * categoria. Nenhuma URL inventada — categoria
 * sem mídia conhecida cai no fallback do
 * componente de imagem.
 */
const CATEGORIAS_EDITORIAIS: Record<string, CategoriaEditorial> = {
  'beleza-e-maquiagem': {
    slug: 'beleza-e-maquiagem',
    descricao:
      'Cuidado com a pele, base, cor e acabamento — a rotina completa.',
    imagem: '/images/categoria-beleza.jpg',
    imagemAlt: 'Composição de beleza e maquiagem',
  },
  maquiagem: {
    slug: 'maquiagem',
    descricao:
      'Cor, produção e acabamento — com a sua assinatura.',
    imagem: '/assets/img/produtos/produto-1.jpg',
    imagemAlt: 'Batom Líquido Matte — produto da categoria',
  },
  fragrancias: {
    slug: 'fragrancias',
    descricao: 'Assinaturas olfativas para o dia e para a noite.',
    imagem: '/assets/img/produtos/produto-5.jpg',
    imagemAlt: 'Perfume Eau de Parfum — produto da categoria',
  },
  casa: {
    slug: 'casa',
    descricao: 'O ritual de cuidado também na casa.',
    imagem: '/images/categoria-casa.jpg',
    imagemAlt: 'Composição de casa e bem-estar',
  },
}

export function categoriaEditorial(
  slug: string,
): CategoriaEditorial | undefined {
  return CATEGORIAS_EDITORIAIS[slug]
}

/**
 * Mídia da categoria: metadado editorial quando
 * existir; senão a primeira foto real do primeiro
 * produto da categoria; senão nada (fallback
 * visual do componente de imagem).
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

/** Descrição editorial ou texto estrutural neutro. */
export function descricaoDaCategoria(
  categoria: CategoriaRef,
): string {
  return (
    CATEGORIAS_EDITORIAIS[categoria.slug]?.descricao ??
    `Produtos da categoria ${categoria.nome}.`
  )
}
