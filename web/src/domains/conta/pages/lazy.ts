import { lazy } from 'react'

export const EntrarPage = lazy(() =>
  import('./EntrarPage').then((m) => ({
    default: m.EntrarPage,
  })),
)

export const CadastroPage = lazy(() =>
  import('./CadastroPage').then((m) => ({
    default: m.CadastroPage,
  })),
)

export const ContaPage = lazy(() =>
  import('./ContaPage').then((m) => ({
    default: m.ContaPage,
  })),
)

export const PerfilPage = lazy(() =>
  import('./PerfilPage').then((m) => ({
    default: m.PerfilPage,
  })),
)

export const PedidosPage = lazy(() =>
  import('./PedidosPage').then((m) => ({
    default: m.PedidosPage,
  })),
)

export const OrcamentosPage = lazy(() =>
  import('./OrcamentosPage').then((m) => ({
    default: m.OrcamentosPage,
  })),
)

export const AgendamentosPage = lazy(() =>
  import('./AgendamentosPage').then((m) => ({
    default: m.AgendamentosPage,
  })),
)

export const FavoritosPage = lazy(() =>
  import('./FavoritosPage').then((m) => ({
    default: m.FavoritosPage,
  })),
)

export const SegurancaPage = lazy(() =>
  import('./SegurancaPage').then((m) => ({
    default: m.SegurancaPage,
  })),
)
