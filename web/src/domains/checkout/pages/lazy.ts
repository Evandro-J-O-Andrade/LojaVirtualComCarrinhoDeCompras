import { lazy } from 'react'

export const CheckoutPage = lazy(() =>
  import('./CheckoutPage').then((modulo) => ({
    default: modulo.CheckoutPage,
  })),
)
