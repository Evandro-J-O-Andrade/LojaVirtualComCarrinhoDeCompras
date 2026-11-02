import { lazy } from 'react'

export const AdminPagamentosPage = lazy(() =>
  import('./AdminPagamentosPage').then((m) => ({
    default: m.AdminPagamentosPage,
  })),
)