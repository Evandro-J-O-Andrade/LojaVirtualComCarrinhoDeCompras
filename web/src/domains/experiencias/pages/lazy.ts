import { lazy } from 'react'

export const AdminExperienciasPage = lazy(() =>
  import('./AdminExperienciasPage').then((m) => ({
    default: m.AdminExperienciasPage,
  })),
)
