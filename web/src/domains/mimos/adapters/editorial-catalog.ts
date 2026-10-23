import type { MimoContexto } from '../model/mimo'

export interface EditorialMimoEntry {
  slug: string
  nome: string
  contexto: MimoContexto
  titulo: string
  descricao: string
  imagem: string
  video?: string
}

export const EDITORIAL_MIMOS: EditorialMimoEntry[] = [
  {
    slug: 'cuidar',
    nome: 'Cuidar',
    contexto: 'cuidar',
    titulo: 'O cuidado de hoje começa aqui',
    descricao:
      'Um momento só seu, sem pressa e sem ruído. A curadoria da Angel reúne o que há de mais puro em beleza para o seu cuidado de cada dia.',
    imagem: '/assets/img/institucional/rostosemfundo.png',
  },
  {
    slug: 'ritual',
    nome: 'Ritual',
    contexto: 'ritual',
    titulo: 'Um ritual, todos os dias',
    descricao:
      'A beleza que acompanha você: da primeira luz ao último olhar. Transforme o ordinário em cerimônia com a nossa curadoria de rituais.',
    imagem: '/images/hero-beauty.jpg',
    video: '/assets/video/sessao-maquiagem/sessãoMaquiagem.mp4',
  },
  {
    slug: 'presentear',
    nome: 'Presentear',
    contexto: 'presentear',
    titulo: 'Para quem você ama',
    descricao:
      'Presentear é dizer com cuidado. Escolha uma composição da Angel e entregue um pedaço da nossa curadoria a quem faz bem ao seu mundo.',
    imagem: '/assets/img/institucional/theLookJaneiro.jpg',
  },
]
