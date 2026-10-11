import { lazy } from 'react'

export const AtendimentoPage = lazy(() =>
  import('./AtendimentoPage').then((m) => ({
    default: m.AtendimentoPage,
  })),
)

export const ContatoPage = lazy(() =>
  import('./ContatoPage').then((m) => ({
    default: m.ContatoPage,
  })),
)
