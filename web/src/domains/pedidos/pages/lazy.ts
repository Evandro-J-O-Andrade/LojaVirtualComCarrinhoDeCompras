import { lazy } from 'react'

export const AdminPedidosPage = lazy(() =>
  import('./AdminPedidosPage').then((m) => ({
    default: m.AdminPedidosPage,
  })),
)