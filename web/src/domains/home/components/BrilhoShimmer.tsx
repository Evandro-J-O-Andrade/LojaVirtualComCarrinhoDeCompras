import { cn } from '@/lib/utils'

interface BrilhoShimmerProps {
  className?: string
}

/**
 * Brilho dourado controlado: uma varredura lenta de
 * champanhe sobre a superfície. Pura decoração — fora
 * da árvore de acessibilidade e desligada por
 * prefers-reduced-motion. Luxo cinematográfico, não
 * efeito CSS: a varredura é longa (7s) e discreta.
 */
export function BrilhoShimmer({ className }: BrilhoShimmerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('brilho-angel pointer-events-none absolute inset-0', className)}
    />
  )
}
