import { lazy } from 'react'

export const NovoOrcamentoPage = lazy(() =>
  import('./NovoOrcamentoPage').then((modulo) => ({
    default: modulo.NovoOrcamentoPage,
  })),
)
