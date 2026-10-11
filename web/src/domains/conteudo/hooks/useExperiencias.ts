import {
  EXPERIENCIAS,
  experienciaPorSlug,
  type Experiencia,
} from '../model/experiencia'

/**
 * Conteúdo editorial é estático e real:
 * não há tabela de experiências no banco
 * (freeze da Etapa 8), então o hook não
 * finge persistência — serve o patrimônio.
 */
export function useExperiencias(): {
  data: Experiencia[]
  isLoading: boolean
  error: null
  refetch: () => void
} {
  return {
    data: EXPERIENCIAS,
    isLoading: false,
    error: null,
    refetch: () => {},
  }
}

export function useExperiencia(
  slug: string | undefined,
): {
  data: Experiencia | undefined
  isLoading: boolean
  error: null
  refetch: () => void
} {
  return {
    data: slug ? experienciaPorSlug(slug) : undefined,
    isLoading: false,
    error: null,
    refetch: () => {},
  }
}
