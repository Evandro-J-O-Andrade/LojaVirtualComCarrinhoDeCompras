/**
 * FATIA 9 — Experiências editoriais.
 *
 * Galeria de eventos e experiências reais.
 * Nada de evento fictício: cada experiência
 * nasce de fotos reais do patrimônio.
 *
 * `data` e `local` só existem quando são
 * reais. Ausência = estado editorial
 * honesto ("em breve"), nunca inventado.
 */

export interface Experiencia {
  slug: string
  titulo: string
  chamada: string
  narrativa: string
  /** Capa real do patrimônio. */
  capa: string
  /** Galeria real — imagens do patrimônio. */
  galeria: string[]
  /** Só quando o vídeo existir de verdade. */
  video: string | null
  /** Contextos editoriais (rótulos, não taxonomia de banco). */
  contextos: string[]
  /** Data real, quando existir. Nunca inventada. */
  data: string | null
  /** Local real, quando existir. Nunca inventado. */
  local: string | null
}

/**
 * Experiências reais do acervo. Sem
 * data/local confirmados: o estado
 * editorial honesto é "em breve".
 */
export const EXPERIENCIAS: Experiencia[] = [
  {
    slug: 'sessao-de-maquiagem',
    titulo: 'Sessão de maquiagem',
    chamada: 'Produção com atendimento personalizado',
    narrativa:
      'Na nossa sessão, a maquiagem acontece com você no centro: conversa, análise e produção, no ritmo que o momento pede. Do diagnóstico à finalização, o atendimento é o protagonista.',
    capa: '/assets/img/marca/cinematic.png',
    galeria: [
      '/assets/img/marca/cinematic.png',
      '/assets/img/produtos/galeria-1.jpg',
      '/assets/img/produtos/galeria-2.jpg',
      '/assets/img/produtos/galeria-3.jpg',
    ],
    video: '/assets/video/sessao-maquiagem/sessãoMaquiagem.mp4',
    contextos: ['maquiagem', 'atendimento'],
    data: null,
    local: null,
  },
  {
    slug: 'encontro-de-beleza',
    titulo: 'Encontro de beleza',
    chamada: 'Onde a comunidade Angel se encontra',
    narrativa:
      'Encontros reais de beleza: troca, cuidado e a curadoria da Angel ao vivo. Cada foto é um pedaço de um momento que aconteceu.',
    capa: '/assets/img/eventos/evento1.jpeg',
    galeria: [
      '/assets/img/eventos/evento1.jpeg',
      '/assets/img/eventos/evento2.jpeg',
      '/assets/img/eventos/evento3.jpeg',
      '/assets/img/eventos/evento4.jpeg',
      '/assets/img/eventos/evento5.jpeg',
      '/assets/img/eventos/evento6.png',
    ],
    video: null,
    contextos: ['encontro', 'comunidade'],
    data: null,
    local: null,
  },
  {
    slug: 'outubro-rosa',
    titulo: 'Outubro Rosa',
    chamada: 'Cuidado que também é causa',
    narrativa:
      'A Angel marca presença na campanha Outubro Rosa: beleza com propósito e cuidado que vai além do espelho.',
    capa: '/assets/img/eventos/eventooutubrorosa.jpeg',
    galeria: ['/assets/img/eventos/eventooutubrorosa.jpeg'],
    video: null,
    contextos: ['campanha', 'causa'],
    data: null,
    local: null,
  },
  {
    slug: 'encontro-com-grasiely',
    titulo: 'Encontro com Grasiely',
    chamada: 'A fundadora ao vivo',
    narrativa:
      'Grasiely, fundadora da Angel, em encontros reais com clientes: a história da marca contada de perto.',
    capa: '/assets/img/eventos/eventograsi.jpeg',
    galeria: [
      '/assets/img/eventos/eventograsi.jpeg',
      '/assets/img/eventos/eventograsi2.jpeg',
      '/assets/img/eventos/eventograi3.jpeg',
      '/assets/img/eventos/eventograsi4.jpeg',
      '/assets/img/eventos/eventrograsisemfundo.png',
      '/assets/img/marca/grasiely.png',
    ],
    video: null,
    contextos: ['encontro', 'marca'],
    data: null,
    local: null,
  },
  {
    slug: 'evento-cipa',
    titulo: 'Evento Cipa',
    chamada: 'Presença real da Angel',
    narrativa:
      'A Angel em evento real do calendário: presença, beleza e a curadoria que acompanha cada momento.',
    capa: '/assets/img/eventos/eventocipa.jpeg',
    galeria: ['/assets/img/eventos/eventocipa.jpeg', '/assets/img/eventos/eventocipa2.jpeg'],
    video: null,
    contextos: ['encontro', 'evento'],
    data: null,
    local: null,
  },
  {
    slug: 'revista-magasine',
    titulo: 'Revista Magasine',
    chamada: 'A Angel em boa companhia',
    narrativa:
      'A Angel no evento Magasine: a marca em cena, entre chamadas e registros reais do acervo.',
    capa: '/assets/img/eventos/eventomagasine.jpeg',
    galeria: [
      '/assets/img/eventos/eventomagasine.jpeg',
      '/assets/img/eventos/chamadaeventos.png',
    ],
    video: null,
    contextos: ['evento', 'imprensa'],
    data: null,
    local: null,
  },
  {
    slug: 'skincare-rotina-diaria',
    titulo: 'Rotina Diária de Skincare',
    chamada: '3 passos essenciais para pele equilibrada todos os dias',
    narrativa:
      'Uma rotina de skincare simples e eficaz: limpeza, tratamento e hidratação. Ideal para pele mista e acneica, usando produtos acessíveis e de confiança.',
    capa: '/assets/img/produtos/produto-9.jpg',
    galeria: ['/assets/img/produtos/produto-9.jpg', '/assets/img/produtos/produto-10.jpg'],
    video: '/assets/video/skincare/skinCare-1.mp4',
    contextos: ['cuidados', 'skincare', 'bem-estar'],
    data: null,
    local: null,
  },
  {
    slug: 'skincare-massagem-facial',
    titulo: 'Massagem Facial com Gua Sha',
    chamada: 'Técnica antiga para drenagem linfática e microcirculação',
    narrativa:
      'Nesta demonstração, a fundadora Grasiely mostra como aplicar a técnica de gua sha na rotina de skincare para estimular a drenagem linfática, reduzir inchaço e potencializar a absorção dos produtos.',
    capa: '/assets/img/produtos/produto-17.jpg',
    galeria: [
      '/assets/img/produtos/produto-17.jpg',
      '/assets/img/produtos/produto-18.jpg',
      '/assets/img/produtos/produto-19.jpg',
    ],
    video: '/assets/video/skincare/skinCare-2.mp4',
    contextos: ['cuidados', 'skincare', 'bem-estar'],
    data: null,
    local: null,
  },
  {
    slug: 'skincare-mascara-tratamento',
    titulo: 'Máscara de Tratamento Caseira',
    chamada: 'Ingredientes que sua cozinha tem e que sua pele vai amar',
    narrativa:
      'Três receitas de máscaras faciais caseiras usando ingredientes naturais: aveia e mel para hidratação, argila e mel para purificação, e óleo de coco para oleagem equilibrada. Combinações seguras e eficazes para cada tipo de pele.',
    capa: '/assets/img/produtos/produto-5.jpg',
    galeria: ['/assets/img/produtos/produto-5.jpg', '/assets/img/produtos/produto-6.jpg'],
    video: '/assets/video/skincare/skinCare-3.mp4',
    contextos: ['cuidados', 'skincare', 'bem-estar'],
    data: null,
    local: null,
  },
]

export function experienciaPorSlug(
  slug: string,
): Experiencia | undefined {
  return EXPERIENCIAS.find(
    (experiencia) => experiencia.slug === slug,
  )
}

/**
 * Mídia ordenada da experiência: galeria
 * primeiro, vídeo por último. Mídia ausente
 * simplesmente não existe.
 */
export function midiasDaExperiencia(
  experiencia: Experiencia,
): Array<{
  tipo: 'imagem' | 'video'
  url: string
  alt: string
  titulo: string | null
}> {
  const midias: Array<{
    tipo: 'imagem' | 'video'
    url: string
    alt: string
    titulo: string | null
  }> = experiencia.galeria.map((url, indice) => ({
    tipo: 'imagem',
    url,
    alt: `${experiencia.titulo} — foto ${indice + 1}`,
    titulo: indice === 0 ? 'Capa' : null,
  }))
  if (experiencia.video) {
    midias.push({
      tipo: 'video',
      url: experiencia.video,
      alt: `Vídeo de ${experiencia.titulo}`,
      titulo: 'Vídeo',
    })
  }
  return midias
}
