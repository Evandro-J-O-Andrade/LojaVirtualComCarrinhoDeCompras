import { lazy } from 'react'

export const BookingPage = lazy(() =>
  import('./BookingPage').then((m) => ({ default: m.BookingPage })),
)
