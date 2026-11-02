import { lazy } from 'react'

export const AdminPaginasPage = lazy(() =>
  import('./AdminPaginasPage').then((m) => ({
    default: m.AdminPaginasPage,
  })),
)
