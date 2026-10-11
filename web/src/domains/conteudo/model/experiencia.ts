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
    capa: '/assets/img/cinematic.png',
    galeria: [
      '/assets/img/cinematic.png',
      '/assets/img/galeria-1.jpg',
      '/assets/img/galeria-2.jpg',
      '/assets/img/galeria-3.jpg',
    ],
    video: '/assets/video/sessãoMaquiagem.mp4',
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
    capa: '/assets/img/evento1.jpeg',
    galeria: [
      '/assets/img/evento1.jpeg',
      '/assets/img/evento2.jpeg',
      '/assets/img/evento3.jpeg',
      '/assets/img/evento4.jpeg',
      '/assets/img/evento5.jpeg',
      '/assets/img/evento6.png',
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
    capa: '/assets/img/eventooutubrorosa.jpeg',
    galeria: ['/assets/img/eventooutubrorosa.jpeg'],
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
    capa: '/assets/img/eventograsi.jpeg',
    galeria: [
      '/assets/img/eventograsi.jpeg',
      '/assets/img/eventograsi2.jpeg',
      '/assets/img/eventograi3.jpeg',
      '/assets/img/eventograsi4.jpeg',
      '/assets/img/eventrograsisemfundo.png',
      '/assets/img/grasiely.png',
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
    capa: '/assets/img/eventocipa.jpeg',
    galeria: ['/assets/img/eventocipa.jpeg', '/assets/img/eventocipa2.jpeg'],
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
    capa: '/assets/img/eventomagasine.jpeg',
    galeria: [
      '/assets/img/eventomagasine.jpeg',
      '/assets/img/chamadaeventos.png',
    ],
    video: null,
    contextos: ['evento', 'imprensa'],
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
