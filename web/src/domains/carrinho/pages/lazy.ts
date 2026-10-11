import { lazy } from 'react'

export const CarrinhoPage = lazy(() =>
  import('./CarrinhoPage').then((modulo) => ({
    default: modulo.CarrinhoPage,
  })),
)
