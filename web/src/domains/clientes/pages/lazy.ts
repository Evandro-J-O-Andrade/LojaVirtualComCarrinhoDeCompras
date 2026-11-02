import { lazy } from 'react'

export const AdminClientesPage = lazy(() =>
  import('./AdminClientesPage').then((m) => ({
    default: m.AdminClientesPage,
  })),
)
