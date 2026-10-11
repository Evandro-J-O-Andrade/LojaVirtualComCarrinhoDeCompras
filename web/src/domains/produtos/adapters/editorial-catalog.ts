import type {
  AtributoTipo,
  Produto,
  ProdutoRef,
  ProdutoVariante,
} from '../model/produto'

interface EditorialProdutoEntry {
  slug: string
  nome: string
  descricao: string
  beneficio: string
  historia: string
  precoBase: number
  sku: string
  imagens: string[]
  video?: string
  categorias: Array<{ slug: string; nome: string }>
  varianteAtributos?: Array<{
    tipo: AtributoTipo
    valores: Array<{ valor: string; sku: string; preco?: number }>
  }>
  promocao?: { tipo: 'percentual' | 'fixo'; valor: number }
  comoUsar?: string
  informacoes?: string
  composicao?: Array<{ slug: string; nome: string }>
}

const FORNECEDOR_CASA = { id: 'editorial-fornecedor', nome: 'ANGEL Cosméticos' }

const VIDEO_DEMONSTRACAO = '/assets/video/sessãoMaquiagem.mp4'

/**
 * Mídia real do patrimônio da Angel: fotos de produto
 * (/assets/img/produto-*.jpg) e vídeo de demonstração
 * (/assets/video/sessãoMaquiagem.mp4). Nenhuma URL é
 * inventada; mídia ausente simplesmente não existe.
 */
const EDITORIAL_PRODUTOS: EditorialProdutoEntry[] = [
  {
    slug: 'batom-liquido-matte',
    nome: 'Batom Líquido Matte',
    descricao:
      'Batom líquido de acabamento matte e alta fixação. Fórmula confortável, com vitamina E, que hidrata sem craquelar.',
    beneficio:
      'Cor intensa e fixação matte que dura o dia inteiro, sem ressecar.',
    historia:
      'Nascido da busca por um matte que não punisse os lábios. A fórmula leva vitamina E e pigmentos de alta cobertura, pensada para quem quer cor com postura — do café da manhã ao evento da noite, sem retoque.',
    precoBase: 34.9,
    sku: 'ANG-BAT-001',
    imagens: [
      '/assets/img/produto-1.jpg',
      '/assets/img/produto-2.jpg',
      '/assets/img/produto-3.jpg',
      '/assets/img/produto-4.jpg',
    ],
    video: VIDEO_DEMONSTRACAO,
    categorias: [
      { slug: 'beleza-e-maquiagem', nome: 'Beleza & Maquiagem' },
      { slug: 'maquiagem', nome: 'Maquiagem' },
    ],
    varianteAtributos: [
      {
        tipo: 'cor',
        valores: [
          { valor: 'Vermelho Rubi', sku: 'ANG-BAT-001-VLR' },
          { valor: 'Rosa Nude', sku: 'ANG-BAT-001-RSN' },
          { valor: 'Coral', sku: 'ANG-BAT-001-COR' },
        ],
      },
    ],
    promocao: { tipo: 'percentual', valor: 15 },
    comoUsar:
      'Aplique sobre os lábios limpos e hidratados, a partir do centro para as bordas. Aguarde 30 segundos para a fixação total do matte.',
    informacoes:
      'Contém vitamina E. Não testado em animais. Vegano. Volume: 3,5 ml.',
  },
  {
    slug: 'perfume-eau-de-parfum',
    nome: 'Perfume Eau de Parfum',
    descricao:
      'Fragrância floral-frutada com notas de bergamota, peônia e sândalo. Fixação prolongada para o dia a dia e a noite.',
    beneficio:
      'Assinatura olfativa floral-frutada com fixação prolongada.',
    historia:
      'Uma composição de perfumaria em três tempos: a bergamota desperta, a peônia aquece e o sândalo deixa a marca. Criado para acompanhar a rotina inteira — do escritório ao jantar — com uma única aplicação.',
    precoBase: 189,
    sku: 'ANG-PER-001',
    imagens: [
      '/assets/img/produto-5.jpg',
      '/assets/img/produto-6.jpg',
      '/assets/img/produto-7.jpg',
      '/assets/img/produto-8.jpg',
    ],
    categorias: [
      { slug: 'beleza-e-maquiagem', nome: 'Beleza & Maquiagem' },
      { slug: 'fragrancias', nome: 'Fragrâncias' },
    ],
    varianteAtributos: [
      {
        tipo: 'volume',
        valores: [
          { valor: '50 ml', sku: 'ANG-PER-001-50' },
          { valor: '100 ml', sku: 'ANG-PER-001-100', preco: 249 },
        ],
      },
    ],
  },
  {
    slug: 'base-facial-cobertura-media',
    nome: 'Base Facial Cobertura Média',
    descricao:
      'Base de cobertura média e acabamento natural. Oil-free, com FPS 20 e proteção contra poluição.',
    beneficio:
      'Acabamento natural e cobertura uniforme, com FPS 20 e proteção contra poluição.',
    historia:
      'Pensada para a pele brasileira: cobertura média que disfarça sem mascarar, oil-free para o calor do dia, com FPS 20 e barreira contra a poluição urbana. O resultado é uma pele que parece sua — só que melhor.',
    precoBase: 49.9,
    sku: 'ANG-BASE-001',
    imagens: [
      '/assets/img/produto-9.jpg',
      '/assets/img/produto-10.jpg',
      '/assets/img/produto-11.jpg',
      '/assets/img/produto-12.jpg',
    ],
    video: VIDEO_DEMONSTRACAO,
    categorias: [
      { slug: 'beleza-e-maquiagem', nome: 'Beleza & Maquiagem' },
      { slug: 'maquiagem', nome: 'Maquiagem' },
    ],
    varianteAtributos: [
      {
        tipo: 'cor',
        valores: [
          { valor: 'Clara', sku: 'ANG-BASE-001-CLA' },
          { valor: 'Média', sku: 'ANG-BASE-001-MED' },
          { valor: 'Escura', sku: 'ANG-BASE-001-ESC' },
        ],
      },
    ],
    informacoes:
      'Oil-free. FPS 20. Proteção contra poluição. Não comedogênica.',
  },
  {
    slug: 'paleta-sombras-12-cores',
    nome: 'Paleta de Sombras 12 Cores',
    descricao:
      'Paleta com 12 tons neutros e vibrantes, de acabamento matte e cintilante. Alta pigmentação e fácil mesclagem.',
    beneficio:
      'Doze tons — neutros e vibrantes — com alta pigmentação e fácil mesclagem.',
    historia:
      'Uma paleta para todos os humores: dos neutros do dia às cintilâncias da noite. A pigmentação foi calibrada para render com pouco produto e mesclar sem manchas — da pálpebra ao contorno, uma única paleta resolve a produção.',
    precoBase: 79.9,
    sku: 'ANG-PAL-001',
    imagens: [
      '/assets/img/produto-13.jpg',
      '/assets/img/produto-14.jpg',
      '/assets/img/produto-15.jpg',
      '/assets/img/produto-16.jpg',
      '/assets/img/produto-16-Photoroom.png',
    ],
    video: VIDEO_DEMONSTRACAO,
    categorias: [
      { slug: 'beleza-e-maquiagem', nome: 'Beleza & Maquiagem' },
      { slug: 'maquiagem', nome: 'Maquiagem' },
    ],
    promocao: { tipo: 'percentual', valor: 20 },
    comoUsar:
      'Aplique com pincel ou esponja, construindo a intensidade em camadas. Use os tons matte para contorno e os cintilantes para destaque.',
    composicao: [
      { slug: 'batom-liquido-matte', nome: 'Batom Líquido Matte' },
      { slug: 'blush-compacto', nome: 'Blush Compacto' },
    ],
  },
  {
    slug: 'toalha-de-banhao-algodao',
    nome: 'Toalha de Banho Algodão',
    descricao:
      'Toalha de banho em algodão penteado, superabsorvente e macia. Toque suave e alta durabilidade.',
    beneficio:
      'Algodão penteado superabsorvente com toque suave e alta durabilidade.',
    historia:
      'Tecida em algodão penteado de gramatura robusta, a toalha absorve rápido e seca macia — uso após uso. Sem felpa solta, sem endurecimento: a peça que o banheiro da Angel pediu para compor o ritual de cuidado.',
    precoBase: 39.9,
    sku: 'ANG-TOA-001',
    imagens: [
      '/assets/img/produto-17.jpg',
      '/assets/img/produto-18.jpg',
      '/assets/img/produto-19.jpg',
      '/assets/img/produto-20.jpg',
      '/assets/img/produto-20-1.jpg',
    ],
    categorias: [{ slug: 'casa', nome: 'Casa' }],
    varianteAtributos: [
      {
        tipo: 'tamanho',
        valores: [
          { valor: 'P', sku: 'ANG-TOA-001-P' },
          { valor: 'M', sku: 'ANG-TOA-001-M' },
          { valor: 'G', sku: 'ANG-TOA-001-G', preco: 49.9 },
        ],
      },
    ],
    informacoes:
      '100% algodão penteado. Gramatura: 500 g/m². Lavar antes do primeiro uso.',
  },
  {
    slug: 'blush-compacto',
    nome: 'Blush Compacto',
    descricao:
      'Blush compacto de acabamento aveludado e longa duração. Esfolia suavemente e uniformiza o tom da pele.',
    beneficio:
      'Cor aveludada de longa duração que uniformiza o tom da pele.',
    historia:
      'O blush que a curadoria da Angel mais recomenda: textura compacta de acabamento aveludado, que se funde à pele e dura a produção inteira. Tons pensados para o subtom da pele brasileira, do pêssego ao rosado.',
    precoBase: 29.9,
    sku: 'ANG-BLU-001',
    imagens: [
      '/assets/img/produto-21.jpg',
      // produto-22.jpg não existe no patrimônio
      // (lacuna documentada no manifesto de
      // assets) — mostramos as disponíveis.
      '/assets/img/produto-23.jpg',
      '/assets/img/produto-24.jpg',
    ],
    video: VIDEO_DEMONSTRACAO,
    categorias: [
      { slug: 'beleza-e-maquiagem', nome: 'Beleza & Maquiagem' },
      { slug: 'maquiagem', nome: 'Maquiagem' },
    ],
    varianteAtributos: [
      {
        tipo: 'cor',
        valores: [
          { valor: 'Pêssego', sku: 'ANG-BLU-001-PES' },
          { valor: 'Rosa', sku: 'ANG-BLU-001-ROS' },
        ],
      },
    ],
  },
]

function toVariante(
  produtoSlug: string,
  entry: EditorialProdutoEntry,
  tipo: AtributoTipo,
  valor: { valor: string; sku: string; preco?: number },
  indice: number,
): ProdutoVariante {
  return {
    id: `editorial-${produtoSlug}-v${indice}`,
    sku: valor.sku,
    preco: valor.preco ?? entry.precoBase,
    ativo: true,
    peso: null,
    atributos: [{ tipo, valor: valor.valor }],
  }
}

function toEditorialProduto(
  entry: EditorialProdutoEntry,
): Produto {
  const variantes: ProdutoVariante[] = []
  if (entry.varianteAtributos) {
    for (const grupo of entry.varianteAtributos) {
      grupo.valores.forEach((valor, i) => {
        variantes.push(toVariante(entry.slug, entry, grupo.tipo, valor, i))
      })
    }
  }

  const composicao: ProdutoRef[] = (entry.composicao ?? []).map(
    (item) => ({
      id: `editorial-${item.slug}`,
      slug: item.slug,
      nome: item.nome,
      preco: null,
      imagem: null,
    }),
  )

  const promocoes = entry.promocao
    ? [
        {
          id: `editorial-${entry.slug}-promo`,
          tipo: entry.promocao.tipo,
          valor: entry.promocao.valor,
          dataInicio: '2026-01-01',
          dataFim: '2026-12-31',
          ativo: true,
        },
      ]
    : []

  return {
    id: `editorial-${entry.slug}`,
    sku: entry.sku,
    nome: entry.nome,
    slug: entry.slug,
    descricao: entry.descricao,
    precoBase: entry.precoBase,
    imagens: entry.imagens.map((url, i) => ({
      id: `editorial-${entry.slug}-img${i}`,
      url,
      ordem: i,
      principal: i === 0,
      alt: `${entry.nome} — foto ${i + 1}`,
      titulo: null,
    })),
    video: entry.video ?? null,
    beneficio: entry.beneficio,
    historia: entry.historia,
    categorias: entry.categorias.map((cat) => ({
      id: `editorial-cat-${cat.slug}`,
      nome: cat.nome,
      slug: cat.slug,
    })),
    fornecedor: FORNECEDOR_CASA,
    variantes,
    promocoes,
    estoque: { disponivel: 10 },
    avaliacao: { nota: 5, total: 12 },
    comoUsar: entry.comoUsar ?? null,
    informacoes: entry.informacoes ?? null,
    composicao,
    ativo: true,
    source: 'editorial',
  }
}

export const EDITORIAL_CATALOGO: Produto[] = EDITORIAL_PRODUTOS.map(
  toEditorialProduto,
)
