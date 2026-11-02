import { lazy } from 'react'

export const BookingPage = lazy(() =>
  import('./BookingPage').then((m) => ({ default: m.BookingPage })),
)

export const AdminAgendamentosPage = lazy(() =>
  import('./AdminAgendamentosPage').then((m) => ({
    default: m.AdminAgendamentosPage,
  })),
)

export const AdminAgendaPage = lazy(() =>
  import('./AdminAgendaPage').then((m) => ({
    default: m.AdminAgendaPage,
  })),
)
