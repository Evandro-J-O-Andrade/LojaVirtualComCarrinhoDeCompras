import { cn } from '@/lib/utils'
import { servicePriceLabel } from '../model/service'

interface ServicePriceProps {
  preco: number | null
  size?: 'sm' | 'lg'
  className?: string
}

export function ServicePrice({ preco, size = 'sm', className }: ServicePriceProps) {
  const desconhecido = preco === null
  return (
    <span
      className={cn(
        'font-display font-bold',
        size === 'lg' ? 'text-3xl' : 'text-lg',
        desconhecido ? 'text-content-subtle' : 'text-primary',
        className,
      )}
    >
      {servicePriceLabel(preco)}
    </span>
  )
}
