export interface EditorialServiceEntry {
  slug: string
  nome: string
  descricao: string
  imagemCapa: string
  video?: string
}

export const EDITORIAL_SERVICES: EditorialServiceEntry[] = [
  {
    slug: 'sessao-de-maquiagem',
    nome: 'Sessão de Maquiagem',
    descricao:
      'Maquiagem profissional para eventos, ensaios e momentos especiais, com atendimento personalizado no nosso espaço.',
    imagemCapa: '/images/categoria-beleza.jpg',
    video: '/assets/video/sessao-maquiagem/sessãoMaquiagem.mp4',
  },
  {
    slug: 'consultoria-de-beleza',
    nome: 'Consultoria de Beleza',
    descricao:
      'Análise de perfil, tons e necessidades para orientar sua rotina de beleza com segurança.',
    imagemCapa: '/assets/img/institucional/rostosemfundo.png',
  },
  {
    slug: 'cuidados-de-beleza',
    nome: 'Cuidados de Beleza',
    descricao:
      'Ritual de cuidados com a pele e acabamento, do diagnóstico à recomendação personalizada.',
    imagemCapa: '/assets/img/institucional/woman-3096664_640.jpg',
  },
]
