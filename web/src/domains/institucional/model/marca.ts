/**
 * FATIA 8 — Conteúdo institucional da marca.
 *
 * Fonte única de verdade editorial da Angel: o que a Home
 * celebra e o que as páginas institucionais contam.
 *
 * Regra de conteúdo: só assets reais inventariados em
 * public/. Se não existe, não entra aqui. Nunca URL fake.
 */

export interface MomentoAngel {
  titulo: string
  narrativa: string
  imagem: string
}

export interface MomentoMarca {
  rotulo: string
  titulo: string
  descricao: string
}

export interface ExperienciaAngel {
  titulo: string
  narrativa: string
  video: string
  /** Capa real do vídeo (frame do próprio acervo). */
  imagem: string
}

export interface CtaFinal {
  comprar: { rotulo: string; href: string }
  agendar: { rotulo: string; href: string }
  /** Sem número inventado: aponta para a página real. */
  equipe: { rotulo: string; href: string }
}

export interface HistoriaMarca {
  titulo: string
  paragrafos: string[]
  imagem: string
  valores: Array<{ rotulo: string; descricao: string }>
}

export const MOMENTO_ANGEL: MomentoAngel = {
  titulo: 'O momento Angel',
  narrativa:
    'Beleza não é pressa. É o minuto antes do espelho, a decisão de cuidar de si. A Angel existe para transformar esse minuto em ritual — com curadoria honesta, atendimento humano e nada de artificial.',
  imagem: '/assets/img/rostosemfundo.png',
}

export const MOMENTOS_MARCA: MomentoMarca[] = [
  {
    rotulo: 'Cuidar',
    titulo: 'O cuidado de hoje',
    descricao: 'Um momento só seu, sem pressa e sem ruído.',
  },
  {
    rotulo: 'Ritual',
    titulo: 'Todos os dias',
    descricao:
      'Da primeira luz ao último olhar: o ordinário virou cerimônia.',
  },
  {
    rotulo: 'Presentear',
    titulo: 'Para quem você ama',
    descricao:
      'Dizer com cuidado: entregue um pedaço da nossa curadoria.',
  },
]

export const EXPERIENCIA_ANGEL: ExperienciaAngel = {
  titulo: 'A experiência Angel',
  narrativa:
    'Da consultoria à aplicação: nossa equipe transforma beleza em experiência. Veja como uma sessão acontece no nosso espaço — e imagine a sua.',
  video: '/assets/video/sessãoMaquiagem.mp4',
  imagem: '/assets/img/cinematic.png',
}

export const CTA_FINAL: CtaFinal = {
  comprar: { rotulo: 'Comprar', href: '/produtos' },
  agendar: { rotulo: 'Agendar', href: '/agendamento' },
  equipe: { rotulo: 'Falar com a equipe', href: '/atendimento' },
}

export const HISTORIA_MARCA: HistoriaMarca = {
  titulo: 'Uma história de beleza e resistência',
  paragrafos: [
    'A Angel nasceu do sonho de criar um espaço que não vendesse apenas produtos, mas celebrasse a jornada da mulher moderna.',
    'De Poá, no interior de São Paulo, selecionamos com rigor o que há de melhor em beleza, maquiagem e casa — porque a sua autoestima merece parceiros de confiança.',
    'Cada produto do nosso catálogo é uma escolha deliberada: qualidade comprovada, apresentação honesta e a curadoria de quem entende de beleza.',
  ],
  imagem: '/assets/img/galeria-1.jpg',
  valores: [
    {
      rotulo: 'Empoderamento',
      descricao: 'Cada mulher tem o poder de transformar o seu dia.',
    },
    {
      rotulo: 'Qualidade',
      descricao:
        'Seleção rigorosa, dos padrões mais altos aos mais puros.',
    },
    {
      rotulo: 'Atendimento',
      descricao: 'Humano, próximo e sempre pronto para atender.',
    },
  ],
}
