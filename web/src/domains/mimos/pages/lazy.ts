import { lazy } from 'react'

export const MimosPage = lazy(() =>
  import('./MimosPage').then((m) => ({ default: m.MimosPage })),
)

export const MimoDetailPage = lazy(() =>
  import('./MimoDetailPage').then((m) => ({ default: m.MimoDetailPage })),
)
