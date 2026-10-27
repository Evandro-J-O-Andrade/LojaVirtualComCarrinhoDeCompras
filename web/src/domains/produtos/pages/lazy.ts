import { lazy } from 'react'

export const ProductsPage = lazy(() =>
  import('./ProductsPage').then((modulo) => ({
    default: modulo.ProductsPage,
  })),
)

export const ProductDetailPage = lazy(() =>
  import('./ProductDetailPage').then((modulo) => ({
    default: modulo.ProductDetailPage,
  })),
)

export const CategoriasPage = lazy(() =>
  import('./CategoriasPage').then((modulo) => ({
    default: modulo.CategoriasPage,
  })),
)

export const CategoriaDetailPage = lazy(() =>
  import('./CategoriaDetailPage').then((modulo) => ({
    default: modulo.CategoriaDetailPage,
  })),
)

export const ColecoesPage = lazy(() =>
  import('./ColecoesPage').then((modulo) => ({
    default: modulo.ColecoesPage,
  })),
)
