import { lazy } from 'react'

export const ExperienciasPage = lazy(() =>
  import('./ExperienciasPage').then((modulo) => ({
    default: modulo.ExperienciasPage,
  })),
)

export const ExperienciaDetailPage = lazy(() =>
  import('./ExperienciaDetailPage').then((modulo) => ({
    default: modulo.ExperienciaDetailPage,
  })),
)
