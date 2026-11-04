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

export const AdminAtendimentosPage = lazy(() =>
  import('./AdminAtendimentosPage').then((m) => ({
    default: m.AdminAtendimentosPage,
  })),
)

export const AdminNotificacoesPage = lazy(() =>
  import('./AdminNotificacoesPage').then((m) => ({
    default: m.AdminNotificacoesPage,
  })),
)

export const AdminEventosPage = lazy(() =>
  import('./AdminEventosPage').then((m) => ({
    default: m.AdminEventosPage,
  })),
)
