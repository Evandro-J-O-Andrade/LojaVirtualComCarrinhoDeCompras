import { lazy } from 'react'

export const SobrePage = lazy(() =>
  import('./SobrePage').then((modulo) => ({
    default: modulo.SobrePage,
  })),
)

export const BelezaPage = lazy(() =>
  import('./ColunaEditorialPage').then((modulo) => ({
    default: modulo.BelezaPage,
  })),
)

export const MaquiagemPage = lazy(() =>
  import('./ColunaEditorialPage').then((modulo) => ({
    default: modulo.MaquiagemPage,
  })),
)

export const BelezaEditorialPage = lazy(() =>
  import('./EditorialPage').then((modulo) => ({
    default: modulo.BelezaEditorialPage,
  })),
)

export const MaquiagemEditorialPage = lazy(() =>
  import('./EditorialPage').then((modulo) => ({
    default: modulo.MaquiagemEditorialPage,
  })),
)
