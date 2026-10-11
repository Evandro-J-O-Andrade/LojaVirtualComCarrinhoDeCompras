/**
 * FATIA 8 — Colunas editoriais institucionais.
 *
 * Beleza e maquiagem contam com narrativa
 * própria em /beleza e /maquiagem, com
 * páginas de detalhe em /beleza/:slug e
 * /maquiagem/:slug. Experiências moram no
 * domínio de conteúdo (Fatia 9).
 *
 * Só assets reais do patrimônio. Mídia ausente não existe.
 */

export type ColunaEditorial = 'beleza' | 'maquiagem'

export interface EditorialColunaEntry {
  slug: string
  titulo: string
  chamada: string
  narrativa: string
  imagem: string
  video?: string
}

export interface EditorialColuna {
  coluna: ColunaEditorial
  rotulo: string
  overline: string
  titulo: string
  descricao: string
  entries: EditorialColunaEntry[]
}

export const COLUNAS_EDITORIAIS: Record<ColunaEditorial, EditorialColuna> = {
  beleza: {
    coluna: 'beleza',
    rotulo: 'Beleza',
    overline: 'Cuidado e pele',
    titulo: 'Beleza que nasce de dentro',
    descricao:
      'Rotinas, cuidados e rituais para a pele e para o dia — selecionados com a calma que a beleza pede.',
    entries: [
      {
        slug: 'cuidado-com-a-pele',
        titulo: 'Cuidado com a pele',
        chamada: 'A base de tudo é o cuidado',
        narrativa:
          'Antes da cor, a pele. Limpeza, hidratação e proteção formam a base onde toda beleza acontece — e é com essa base que a curadoria da Angel começa.',
        imagem: '/assets/img/rostosemfundo.png',
      },
      {
        slug: 'rotina-de-beleza',
        titulo: 'Rotina de beleza',
        chamada: 'Beleza é o que se repete',
        narrativa:
          'Não existe milagre de uma noite. Existe a rotina que se repete: o mesmo cuidado, todos os dias, até virar parte de quem você é.',
        imagem: '/images/hero-beauty.jpg',
      },
      {
        slug: 'beleza-natural',
        titulo: 'Beleza natural',
        chamada: 'Menos camada, mais pele',
        narrativa:
          'A beleza mais elegante é a que deixa a pele aparecer. Produtos leves, acabamento honesto e a luz certa: o natural é uma escolha.',
        imagem: '/assets/img/cosmetics.jpg',
      },
    ],
  },
  maquiagem: {
    coluna: 'maquiagem',
    rotulo: 'Maquiagem',
    overline: 'Cor e produção',
    titulo: 'Maquiagem como autoria',
    descricao:
      'Produção, cor e acabamento — da maquiagem do dia à produção de evento, sempre com a sua assinatura.',
    entries: [
      {
        slug: 'producao-para-eventos',
        titulo: 'Produção para eventos',
        chamada: 'O olhar que fica',
        narrativa:
          'Evento pede produção: pele uniforme, cor na medida e fixação que dura a noite inteira. Nossa equipe assina a produção — você assina o momento.',
        imagem: '/assets/img/woman-3096664_640.jpg',
        video: '/assets/video/sessãoMaquiagem.mp4',
      },
      {
        slug: 'maquiagem-autoral',
        titulo: 'Maquiagem autoral',
        chamada: 'Assinatura própria',
        narrativa:
          'Toda produção conta uma história. A maquiagem autoral é a que traduz quem você é — do tom de pele ao traço do batom.',
        imagem: '/assets/img/theLookJaneiro.jpg',
      },
      {
        slug: 'finalizacao-e-acabamento',
        titulo: 'Finalização e acabamento',
        chamada: 'O último toque',
        narrativa:
          'O acabamento é o detalhe que ninguém esquece: o brilho na medida, a pele selada, o olhar definido. Finalizar é fechar a produção com cuidado.',
        imagem: '/assets/img/grasiely.png',
      },
    ],
  },
}

export function colunaEditorial(
  coluna: ColunaEditorial,
): EditorialColuna {
  return COLUNAS_EDITORIAIS[coluna]
}

export function entryPorSlug(
  coluna: ColunaEditorial,
  slug: string,
): EditorialColunaEntry | undefined {
  return COLUNAS_EDITORIAIS[coluna].entries.find(
    (entry) => entry.slug === slug,
  )
}
