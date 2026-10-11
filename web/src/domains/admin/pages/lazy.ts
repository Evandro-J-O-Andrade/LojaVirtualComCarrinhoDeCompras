import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('./DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

export const AdminProdutosPage = lazy(() =>
  import('./AdminProdutosPage').then((m) => ({
    default: m.AdminProdutosPage,
  })),
)

export const AdminProdutoDetalhePage = lazy(() =>
  import('./AdminProdutoDetalhePage').then((m) => ({
    default: m.AdminProdutoDetalhePage,
  })),
)
