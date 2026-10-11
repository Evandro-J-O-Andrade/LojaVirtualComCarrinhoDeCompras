import { lazy } from 'react'

export const ServicesPage = lazy(() =>
  import('./ServicesPage').then((m) => ({ default: m.ServicesPage })),
)

export const ServiceDetailPage = lazy(() =>
  import('./ServiceDetailPage').then((m) => ({
    default: m.ServiceDetailPage,
  })),
)
