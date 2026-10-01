import { cn } from '@/lib/utils'

interface DiscountBadgeProps {
  originalPrice: number
  currentPrice: number
  size?: 'sm' | 'md'
  className?: string
}

export function DiscountBadge({
  originalPrice,
  currentPrice,
  size = 'md',
  className,
}: DiscountBadgeProps) {
  const percent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)

  if (percent <= 0) return null

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-coral text-white font-bold',
        sizeClass,
        className
      )}
    >
      -{percent}%
    </span>
  )
}
