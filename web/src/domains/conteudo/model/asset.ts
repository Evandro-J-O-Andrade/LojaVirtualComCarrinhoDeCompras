/**
 * FATIA 9 — Manifesto de mídia do patrimônio real.
 *
 * Fonte tipada de tudo que existe de verdade em
 * `web/public/`. O manifesto NÃO vira verdade
 * comercial: uma foto associada editorialmente a
 * um produto não significa que o produto está
 * à venda. Dado desconhecido não se inventa —
 * se registra como ausente.
 *
 * Regra: nenhum arquivo real é apagado sem
 * classificação. Arquivos de teste e desenvol-
 * vimento ficam em PATRIMONIO_NAO_CONTEUDO e
 * nunca são renderizados.
 */

export type AssetTipo = 'imagem' | 'video'

export type AssetContexto =
  | 'produto'
  | 'evento'
  | 'galeria'
  | 'categoria'
  | 'marca'
  | 'hero'
  | 'cinematica'
  | 'institucional'
  | 'tecnico'

export type AssetStatus = 'real' | 'teste' | 'desenvolvimento'

export interface PatrimonioAsset {
  id: string
  tipo: AssetTipo
  caminho: string
  alt: string
  titulo: string
  contexto: AssetContexto
  /** Slug editorial do produto, quando a foto pertencer a um cadastro. */
  produtoSlug?: string
  /** Slug da experiência/evento, quando a foto pertencer a um. */
  eventoSlug?: string
  status: AssetStatus
}

/* ---------- Construtores ---------- */

function imagem(
  id: string,
  caminho: string,
  alt: string,
  titulo: string,
  contexto: AssetContexto,
  vinculo: Partial<Pick<PatrimonioAsset, 'produtoSlug' | 'eventoSlug'>> = {},
): PatrimonioAsset {
  return {
    id,
    tipo: 'imagem',
    caminho,
    alt,
    titulo,
    contexto,
    status: 'real',
    ...vinculo,
  }
}

/* ---------- Fotos de produto ---------- */

/**
 * Cadastro editorial atual: slug → fotos do
 * patrimônio. Fotos fora deste mapa são reais,
 * mas ainda sem produto cadastrado — disponíveis
 * para quando o catálogo comercial subir.
 */
const CADASTRO_PRODUTO: Record<number, string> = {
  1: 'batom-liquido-matte',
  2: 'batom-liquido-matte',
  3: 'batom-liquido-matte',
  4: 'batom-liquido-matte',
  5: 'perfume-eau-de-parfum',
  6: 'perfume-eau-de-parfum',
  7: 'perfume-eau-de-parfum',
  8: 'perfume-eau-de-parfum',
  9: 'base-facial-cobertura-media',
  10: 'base-facial-cobertura-media',
  11: 'base-facial-cobertura-media',
  12: 'base-facial-cobertura-media',
  13: 'paleta-sombras-12-cores',
  14: 'paleta-sombras-12-cores',
  15: 'paleta-sombras-12-cores',
  16: 'paleta-sombras-12-cores',
  17: 'toalha-de-banhao-algodao',
  18: 'toalha-de-banhao-algodao',
  19: 'toalha-de-banhao-algodao',
  20: 'toalha-de-banhao-algodao',
  21: 'blush-compacto',
  23: 'blush-compacto',
  24: 'blush-compacto',
}

/**
 * Fotos de produto que existem no patrimônio.
 * Lacuna documentada: **produto-22.jpg e
 * produto-25.jpg não existem** — o catálogo
 * editorial referencia produto-22 (blush), e
 * a regra de imagem (real → fallback visual →
 * feedback) cobre a ausência sem quebrar o
 * layout. Nenhuma URL é inventada para cobrir
 * o buraco.
 */
const FOTOS_PRODUTO_EXISTENTES: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
]

function caminhoFotoProduto(numero: number): string {
  const extensao = numero >= 30 && numero <= 38 ? 'jpeg' : 'jpg'
  return `/assets/img/produtos/produto-${numero}.${extensao}`
}

const fotosDeProduto: PatrimonioAsset[] = FOTOS_PRODUTO_EXISTENTES.map(
  (numero) => {
    const slug = CADASTRO_PRODUTO[numero]
    return imagem(
      `produto-${numero}`,
      caminhoFotoProduto(numero),
      slug
        ? `Foto ${numero} do produto editorial ${slug}`
        : `Foto de produto ${numero} — sem cadastro`,
      slug
        ? `Produto editorial — foto ${numero}`
        : `Foto de produto ${numero}`,
      'produto',
      slug ? { produtoSlug: slug } : {},
    )
  },
)

/** Alternates reais do mesmo produto (processamento diferente). */
const alternatesDeProduto: PatrimonioAsset[] = [
  imagem(
    'produto-16-photoroom',
    '/assets/img/produtos/produto-16-Photoroom.png',
    'Foto alternativa (fundo removido) da paleta de sombras',
    'Paleta de Sombras — fundo removido',
    'produto',
    { produtoSlug: 'paleta-sombras-12-cores' },
  ),
  imagem(
    'produto-20-1',
    '/assets/img/produtos/produto-20-1.jpg',
    'Foto alternativa da toalha de banho',
    'Toalha de Banho — foto alternativa',
    'produto',
    { produtoSlug: 'toalha-de-banhao-algodao' },
  ),
]

/* ---------- Eventos e experiências ---------- */

const fotosDeEvento: PatrimonioAsset[] = [
  imagem(
    'evento-1',
    '/assets/img/eventos/evento1.jpeg',
    'Foto de evento de beleza Angel',
    'Evento Angel — foto 1',
    'evento',
    { eventoSlug: 'encontro-de-beleza' },
  ),
  imagem(
    'evento-2',
    '/assets/img/eventos/evento2.jpeg',
    'Foto de evento de beleza Angel',
    'Evento Angel — foto 2',
    'evento',
    { eventoSlug: 'encontro-de-beleza' },
  ),
  imagem(
    'evento-3',
    '/assets/img/eventos/evento3.jpeg',
    'Foto de evento de beleza Angel',
    'Evento Angel — foto 3',
    'evento',
    { eventoSlug: 'encontro-de-beleza' },
  ),
  imagem(
    'evento-4',
    '/assets/img/eventos/evento4.jpeg',
    'Foto de evento de beleza Angel',
    'Evento Angel — foto 4',
    'evento',
    { eventoSlug: 'encontro-de-beleza' },
  ),
  imagem(
    'evento-5',
    '/assets/img/eventos/evento5.jpeg',
    'Foto de evento de beleza Angel',
    'Evento Angel — foto 5',
    'evento',
    { eventoSlug: 'encontro-de-beleza' },
  ),
  imagem(
    'evento-6',
    '/assets/img/eventos/evento6.png',
    'Foto de evento de beleza Angel',
    'Evento Angel — foto 6',
    'evento',
    { eventoSlug: 'encontro-de-beleza' },
  ),
  imagem(
    'evento-outubro-rosa',
    '/assets/img/eventos/eventooutubrorosa.jpeg',
    'Foto do evento Outubro Rosa da Angel',
    'Outubro Rosa — evento',
    'evento',
    { eventoSlug: 'outubro-rosa' },
  ),
  imagem(
    'evento-grasiely-1',
    '/assets/img/eventos/eventograsi.jpeg',
    'Foto de encontro com Grasiely',
    'Encontro com Grasiely — foto 1',
    'evento',
    { eventoSlug: 'encontro-com-grasiely' },
  ),
  imagem(
    'evento-grasiely-2',
    '/assets/img/eventos/eventograsi2.jpeg',
    'Foto de encontro com Grasiely',
    'Encontro com Grasiely — foto 2',
    'evento',
    { eventoSlug: 'encontro-com-grasiely' },
  ),
  imagem(
    'evento-grasiely-3',
    '/assets/img/eventos/eventograi3.jpeg',
    'Foto de encontro com Grasiely',
    'Encontro com Grasiely — foto 3',
    'evento',
    { eventoSlug: 'encontro-com-grasiely' },
  ),
  imagem(
    'evento-grasiely-4',
    '/assets/img/eventos/eventograsi4.jpeg',
    'Foto de encontro com Grasiely',
    'Encontro com Grasiely — foto 4',
    'evento',
    { eventoSlug: 'encontro-com-grasiely' },
  ),
  imagem(
    'evento-grasiely-semfundo',
    '/assets/img/eventos/eventrograsisemfundo.png',
    'Foto de encontro com Grasiely, fundo removido',
    'Encontro com Grasiely — fundo removido',
    'evento',
    { eventoSlug: 'encontro-com-grasiely' },
  ),
  imagem(
    'evento-cipa-1',
    '/assets/img/eventos/eventocipa.jpeg',
    'Foto do evento Cipa',
    'Evento Cipa — foto 1',
    'evento',
    { eventoSlug: 'evento-cipa' },
  ),
  imagem(
    'evento-cipa-2',
    '/assets/img/eventos/eventocipa2.jpeg',
    'Foto do evento Cipa',
    'Evento Cipa — foto 2',
    'evento',
    { eventoSlug: 'evento-cipa' },
  ),
  imagem(
    'evento-magasine',
    '/assets/img/eventos/eventomagasine.jpeg',
    'Foto do evento Magasine',
    'Evento Magasine',
    'evento',
    { eventoSlug: 'revista-magasine' },
  ),
  imagem(
    'chamada-eventos',
    '/assets/img/eventos/chamadaeventos.png',
    'Chamada de eventos da Angel',
    'Chamada de eventos',
    'evento',
    { eventoSlug: 'revista-magasine' },
  ),
]

/* ---------- Galeria, categorias, marca ---------- */

const galeriaEstatica: PatrimonioAsset[] = [1, 2, 3, 4, 5].map(
  (numero) =>
    imagem(
      `galeria-${numero}`,
      `/assets/img/produtos/galeria-${numero}.jpg`,
      `Foto de galeria ${numero} da Angel`,
      `Galeria Angel — foto ${numero}`,
      'galeria',
    ),
)

const categoriasPatrimonio: PatrimonioAsset[] = [1, 2, 3, 4, 5].map(
  (numero) =>
    imagem(
      `categoria-${numero}`,
      `/assets/img/categorias/categoria-${numero}.jpg`,
      `Foto de categoria ${numero}`,
      `Categoria — foto ${numero}`,
      'categoria',
    ),
)

const marcaPatrimonio: PatrimonioAsset[] = [1, 2, 3, 4, 5].map(
  (numero) =>
    imagem(
      `marca-${numero}`,
      `/assets/img/marcas/marca-${numero}.png`,
      `Foto de marca ${numero} da Angel`,
      `Marca Angel — foto ${numero}`,
      'marca',
    ),
)

/* ---------- Hero, cinema, pessoas, vídeo ---------- */

const destaquesPrincipais: PatrimonioAsset[] = [
  imagem(
    'hero-beauty',
    '/images/hero-beauty.jpg',
    'Retrato de beleza em luz natural',
    'Hero — beleza',
    'hero',
  ),
  imagem(
    'cinematic',
    '/assets/img/marca/cinematic.png',
    'Still cinematográfico da marca em retrato 9:16',
    'Cinematic — still da marca',
    'cinematica',
  ),
  imagem(
    'rostosemfundo',
    '/assets/img/institucional/rostosemfundo.png',
    'Retrato feminino em luz suave, fundo removido',
    'Retrato — cuidado',
    'marca',
  ),
  imagem(
    'woman-3096664',
    '/assets/img/institucional/woman-3096664_640.jpg',
    'Retrato de produção de maquiagem',
    'Produção de maquiagem',
    'marca',
  ),
  imagem(
    'the-look-janeiro',
    '/assets/img/institucional/theLookJaneiro.jpg',
    'Produção de look do editorial de janeiro',
    'The Look — janeiro',
    'marca',
  ),
  imagem(
    'cosmetics',
    '/assets/img/banners/cosmetics.jpg',
    'Cosméticos em composição de still',
    'Cosméticos — still',
    'marca',
  ),
  imagem(
    'grasiely',
    '/assets/img/marca/grasiely.png',
    'Retrato de Grasiely, fundadora da Angel',
    'Grasiely — retrato',
    'marca',
  ),
  {
    id: 'sessao-maquiagem-video',
    tipo: 'video',
    caminho: '/assets/video/sessao-maquiagem/sessãoMaquiagem.mp4',
    alt: 'Vídeo de demonstração de uma sessão de maquiagem',
    titulo: 'Sessão de maquiagem — vídeo',
    contexto: 'institucional',
    eventoSlug: 'sessao-de-maquiagem',
    status: 'real',
  },
]

/* ---------- Institucional ---------- */

const institucional: PatrimonioAsset[] = [
  imagem(
    'certificado',
    '/assets/img/institucional/certificado.jpeg',
    'Certificado da Angel',
    'Certificado',
    'institucional',
  ),
  imagem(
    'segundo-lugar',
    '/assets/img/social/segundoLugar.jpeg',
    'Troféu de segundo lugar da Angel',
    'Segundo lugar',
    'institucional',
  ),
  imagem(
    'capa-catalogo-1',
    '/assets/img/institucional/apresentecaoprodutos.jpeg',
    'Capa de apresentação de produtos',
    'Apresentação de produtos',
    'institucional',
  ),
  imagem(
    'capa-catalogo-2',
    '/assets/img/institucional/apresentacaoprodutos2.jpeg',
    'Capa de apresentação de produtos (2)',
    'Apresentação de produtos (2)',
    'institucional',
  ),
  imagem(
    'capa-pdf-1',
    '/assets/img/institucional/capapdf.jpeg',
    'Capa de catálogo em PDF',
    'Capa do catálogo',
    'institucional',
  ),
  imagem(
    'capa-pdf-2',
    '/assets/img/institucional/capapdf2.jpg',
    'Capa de catálogo em PDF (2)',
    'Capa do catálogo (2)',
    'institucional',
  ),
  imagem(
    'capa-pdf-3',
    '/assets/img/institucional/capapdf3.png',
    'Capa de catálogo em PDF (3)',
    'Capa do catálogo (3)',
    'institucional',
  ),
  imagem(
    'capa-the-look',
    '/assets/img/institucional/capaThelookJaneiro.JPG',
    'Capa do editorial The Look janeiro',
    'Capa — The Look janeiro',
    'institucional',
  ),
  imagem(
    'banner-1',
    '/assets/img/banners/banner-1.png',
    'Banner institucional da Angel',
    'Banner institucional',
    'institucional',
  ),
  imagem(
    'banner-2',
    '/assets/img/banners/banner-2.png',
    'Banner institucional da Angel (2)',
    'Banner institucional (2)',
    'institucional',
  ),
  imagem(
    'banner-grasi',
    '/assets/img/banners/bannergrasi.png',
    'Banner com Grasiely',
    'Banner — Grasiely',
    'institucional',
  ),
  imagem(
    'banner-grasi-semfundo',
    '/assets/img/banners/bansergrasisemfundo.png',
    'Banner com Grasiely, fundo removido',
    'Banner — Grasiely (fundo removido)',
    'institucional',
  ),
  imagem(
    'baner-1-1',
    '/assets/img/banners/baner-1-1.png',
    'Banner institucional alternativo',
    'Banner institucional — alternativo',
    'institucional',
  ),
  imagem(
    'chamada-site',
    '/assets/img/institucional/ChamdaSite.jpeg',
    'Chamada do site',
    'Chamada do site',
    'institucional',
  ),
  imagem(
    'divulgacao',
    '/assets/img/banners/divulgação.jpeg',
    'Foto de divulgação da Angel',
    'Divulgação',
    'institucional',
  ),
  imagem(
    'street-pexels',
    '/assets/img/institucional/pexels-agustina-r-street-353574760-16641709.jpg',
    'Rua movimentada — foto de contexto urbano',
    'Contexto urbano',
    'institucional',
  ),
  imagem(
    'mary-kay-2019',
    '/assets/img/beleza/mary-kay-melhores-produtos-2019.webp',
    'Selo de melhores produtos 2019',
    'Melhores produtos 2019',
    'institucional',
  ),
]

/* ---------- Técnico (favicons e logos da marca) ---------- */

const tecnico: PatrimonioAsset[] = [
  imagem(
    'angel-logo-64',
    '/brand/angel-logo-64.png',
    'Logotipo Angel 64px',
    'Angel — logotipo 64',
    'tecnico',
  ),
  imagem(
    'angel-logo-160',
    '/brand/angel-logo-160.png',
    'Logotipo Angel 160px',
    'Angel — logotipo 160',
    'tecnico',
  ),
  imagem(
    'angel-logo-240',
    '/brand/angel-logo-240.png',
    'Logotipo Angel 240px',
    'Angel — logotipo 240',
    'tecnico',
  ),
  imagem(
    'favicon-16',
    '/assets/img/interface/favicon-16x16.png',
    'Favicon 16px',
    'Favicon 16',
    'tecnico',
  ),
  imagem(
    'favicon-32',
    '/assets/img/interface/favicon-32x32.png',
    'Favicon 32px',
    'Favicon 32',
    'tecnico',
  ),
  imagem(
    'favicon-ico',
    '/assets/img/interface/favicon.ico',
    'Favicon ICO',
    'Favicon ICO',
    'tecnico',
  ),
  imagem(
    'android-chrome-192',
    '/assets/img/interface/android-chrome-192x192.png',
    'Ícone Android Chrome 192px',
    'Ícone 192',
    'tecnico',
  ),
  imagem(
    'android-chrome-512',
    '/assets/img/interface/android-chrome-512x512.png',
    'Ícone Android Chrome 512px',
    'Ícone 512',
    'tecnico',
  ),
  imagem(
    'apple-touch-icon',
    '/assets/img/interface/apple-touch-icon.png',
    'Ícone Apple touch',
    'Ícone Apple',
    'tecnico',
  ),
]

/**
 * O patrimônio real: tudo que o site pode
 * consumir. Ordem = famílias, não prioridade.
 */
export const PATRIMONIO: PatrimonioAsset[] = [
  ...destaquesPrincipais,
  ...fotosDeProduto,
  ...alternatesDeProduto,
  ...fotosDeEvento,
  ...galeriaEstatica,
  ...categoriasPatrimonio,
  ...marcaPatrimonio,
  ...institucional,
  ...tecnico,
]

/**
 * Arquivos classificados como teste ou artefato
 * de desenvolvimento. Nunca são renderizados:
 * não são conteúdo.
 *
 * O helper `imagem` marca como 'real', então a
 * classificação final é aplicada aqui: arquivos
 * de teste explícitos viram 'teste'; artefatos
 * de desenvolvimento viram 'desenvolvimento'.
 */
const TESTES_EXPLICITOS = new Set([
  'logoteste2',
  'logoteste3',
  'lototeste',
])

const naoConteudoBase: PatrimonioAsset[] = [
  imagem(
    'logoteste2',
    '/assets/img/marca/logoteste2.png',
    'Arquivo de teste — não é conteúdo',
    'Teste — logo 2',
    'tecnico',
  ),
  imagem(
    'logoteste3',
    '/assets/img/marca/logoteste3.png',
    'Arquivo de teste — não é conteúdo',
    'Teste — logo 3',
    'tecnico',
  ),
  imagem(
    'lototeste',
    '/assets/img/institucional/lototeste.png',
    'Arquivo de teste — não é conteúdo',
    'Teste — logo',
    'tecnico',
  ),
  // Artefatos de desenvolvimento: capturas, telas e
  // rascunhos de interface. Reais, mas não conteúdo.
  imagem(
    'captura-tela-033243',
    '/assets/img/institucional/Captura de tela 2025-01-21 033243.jpg',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'captura-tela-035040',
    '/assets/img/institucional/Captura de tela 2025-01-21 035040.jpg',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'captura-tela-035052',
    '/assets/img/institucional/Captura de tela 2025-01-21 035052.jpg',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'captura-tela-035106',
    '/assets/img/institucional/Captura de tela 2025-01-21 035106.jpg',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'captura-tela-035123',
    '/assets/img/institucional/Captura de tela 2025-01-21 035123.jpg',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'capturar',
    '/assets/img/institucional/Capturar.JPG',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'screenshot-1',
    '/assets/img/institucional/Screenshot_1.jpg',
    'Captura de tela de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'chatbot-chat',
    '/assets/img/institucional/Chatbot Chat.jpg',
    'Captura do chatbot de desenvolvimento',
    'Chatbot — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-1',
    '/assets/img/interface/carrinho-1.jpg',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-2',
    '/assets/img/interface/carrinho-2.jpg',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-3',
    '/assets/img/interface/carrinho-3.jpg',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-tela-1',
    '/assets/img/interface/carrinho.png',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-tela-2',
    '/assets/img/interface/carrinho2.png',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-tela-3',
    '/assets/img/interface/carrinho!.png',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-cheio',
    '/assets/img/interface/carrinhocheio.png',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-full-1',
    '/assets/img/interface/Carrinhofull1.png',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'carrinho-full-2',
    '/assets/img/interface/carrinhofull2.jpg',
    'Captura de carrinho de desenvolvimento',
    'Carrinho — captura',
    'tecnico',
  ),
  imagem(
    'intro-site-new',
    '/assets/img/banners/Intro-site-new.png',
    'Rascunho de introdução do site',
    'Rascunho — intro',
    'tecnico',
  ),
  imagem(
    'intro-site-new-photoroom',
    '/assets/img/banners/Intro-site-new-Photoroom.png',
    'Rascunho de introdução do site, fundo removido',
    'Rascunho — intro (fundo removido)',
    'tecnico',
  ),
  imagem(
    'menu-tela',
    '/assets/img/interface/menu.png',
    'Captura de menu de desenvolvimento',
    'Menu — captura',
    'tecnico',
  ),
  imagem(
    'google-tela',
    '/assets/img/interface/google.png',
    'Captura de desenvolvimento',
    'Captura de tela',
    'tecnico',
  ),
  imagem(
    'logo-ia',
    '/assets/img/marca/logoIA.jpeg',
    'Rascunho de logotipo gerado',
    'Rascunho — logo IA',
    'tecnico',
  ),
  imagem(
    'apple-1',
    '/assets/img/interface/apple.png',
    'Arquivo de desenvolvimento',
    'Arquivo de desenvolvimento',
    'tecnico',
  ),
  imagem(
    'apple-2',
    '/assets/img/interface/apple2.png',
    'Arquivo de desenvolvimento',
    'Arquivo de desenvolvimento',
    'tecnico',
  ),
  imagem(
    'cliente-1',
    '/assets/img/social/cliente-1.png',
    'Arquivo de desenvolvimento',
    'Arquivo de desenvolvimento',
    'tecnico',
  ),
  imagem(
    'cliente-2',
    '/assets/img/social/cliente-2.png',
    'Arquivo de desenvolvimento',
    'Arquivo de desenvolvimento',
    'tecnico',
  ),
  imagem(
    'cliente-3',
    '/assets/img/social/cliente-3.png',
    'Arquivo de desenvolvimento',
    'Arquivo de desenvolvimento',
    'tecnico',
  ),
  imagem(
    'grasi-mpe',
    '/assets/img/marca/grasiempe.png',
    'Rascunho de retrato',
    'Rascunho — retrato',
    'tecnico',
  ),
  imagem(
    'grasi-mpe-2',
    '/assets/img/marca/grasiempe2.png',
    'Rascunho de retrato',
    'Rascunho — retrato',
    'tecnico',
  ),
  imagem(
    'grasi-mpe-photoroom',
    '/assets/img/marca/grasiempe-Photoroom.png',
    'Rascunho de retrato, fundo removido',
    'Rascunho — retrato (fundo removido)',
    'tecnico',
  ),
  imagem(
    'grasi-sidepe4',
    '/assets/img/marca/Grasidepe4.png',
    'Rascunho de retrato',
    'Rascunho — retrato',
    'tecnico',
  ),
  imagem(
    'grasi-sidepe4-photoroom',
    '/assets/img/marca/Grasidepe4-Photoroom.png',
    'Rascunho de retrato, fundo removido',
    'Rascunho — retrato (fundo removido)',
    'tecnico',
  ),
  imagem(
    'grasi-com-batom',
    '/assets/img/beleza/grasicombaton.png',
    'Rascunho de retrato',
    'Rascunho — retrato',
    'tecnico',
  ),
  imagem(
    'grasi-de-brando',
    '/assets/img/marca/grasedebrandosemfundo.png',
    'Rascunho de retrato, fundo removido',
    'Rascunho — retrato (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logo-2',
    '/assets/img/marca/logo-2.png',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-jpeg',
    '/assets/img/marca/Logo.jpeg',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-png',
    '/assets/img/marca/logo.png',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-2-jpeg',
    '/assets/img/marca/logo2.jpeg',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-2-webp',
    '/assets/img/marca/logo2.webp',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-2-semfundo',
    '/assets/img/marca/logo2semfundo.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logo-2-semfundo-2',
    '/assets/img/marca/logo2semfundo2.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logo-3-webp',
    '/assets/img/marca/logo3.webp',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-4-webp',
    '/assets/img/marca/logo4.webp',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-5',
    '/assets/img/marca/logo5.png',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-6',
    '/assets/img/marca/logo6.png',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-escura',
    '/assets/img/marca/logoEscura.png',
    'Rascunho de logotipo',
    'Rascunho — logo',
    'tecnico',
  ),
  imagem(
    'logo-photoroom',
    '/assets/img/marca/Logo-Photoroom.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logo-mary-kay',
    '/assets/img/marcas/logomarykay.png',
    'Logotipo de terceiros — não é marca Angel',
    'Logotipo de terceiros',
    'tecnico',
  ),
  imagem(
    'logosemfundo3',
    '/assets/img/marca/logosemfundo3.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logosemfundo-asas',
    '/assets/img/marca/logosemfundoasas.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logosemfundo-baner',
    '/assets/img/marca/logosemfundobaner.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logosemfundo-baner-2',
    '/assets/img/marca/logosemfundobaner2.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  imagem(
    'logosemfunto',
    '/assets/img/marca/Logosemfunto.png',
    'Rascunho de logotipo, fundo removido',
    'Rascunho — logo (fundo removido)',
    'tecnico',
  ),
  // Foto de produto real, mas com espaço no nome
  // (`produto-mary- kay-2.jpg`): inviável para
  // URL web. Classificada como artefato de
  // desenvolvimento, não como conteúdo.
  imagem(
    'produto-mary-kay-2',
    '/assets/img/produtos/produto-mary- kay-2.jpg',
    'Foto de produto com nome inválido para web',
    'Artefato — foto de produto',
    'tecnico',
  ),
]

export const PATRIMONIO_NAO_CONTEUDO: PatrimonioAsset[] =
  naoConteudoBase.map((asset) => ({
    ...asset,
    status: TESTES_EXPLICITOS.has(asset.id)
      ? ('teste' as const)
      : ('desenvolvimento' as const),
  }))

/* ---------- Consultas ---------- */

export function assetPorId(id: string): PatrimonioAsset | undefined {
  return (
    PATRIMONIO.find((asset) => asset.id === id) ??
    PATRIMONIO_NAO_CONTEUDO.find((asset) => asset.id === id)
  )
}

export function assetsDoContexto(
  contexto: AssetContexto,
): PatrimonioAsset[] {
  return PATRIMONIO.filter((asset) => asset.contexto === contexto)
}

export function assetsDoEvento(
  eventoSlug: string,
): PatrimonioAsset[] {
  return PATRIMONIO.filter(
    (asset) => asset.eventoSlug === eventoSlug,
  )
}

export function assetsDoProduto(
  produtoSlug: string,
): PatrimonioAsset[] {
  return PATRIMONIO.filter(
    (asset) => asset.produtoSlug === produtoSlug,
  )
}

/**
 * Fotos reais de produto para galeria editorial.
 * Ordem de cadastro; uma foto ausente simplesmente
 * não existe — nunca se inventa caminho.
 */
export function midiasDoProdutoEditorial(
  produtoSlug: string,
): Array<{ url: string; alt: string }> {
  return assetsDoProduto(produtoSlug)
    .filter((asset) => asset.tipo === 'imagem')
    .map((asset) => ({ url: asset.caminho, alt: asset.alt }))
}
