import { lazy } from 'react'

export const NovoOrcamentoPage = lazy(() =>
  import('./NovoOrcamentoPage').then((modulo) => ({
    default: modulo.NovoOrcamentoPage,
  })),
)

export const AdminOrcamentosPage = lazy(() =>
  import('./AdminOrcamentosPage').then((m) => ({
    default: m.AdminOrcamentosPage,
  })),
)
