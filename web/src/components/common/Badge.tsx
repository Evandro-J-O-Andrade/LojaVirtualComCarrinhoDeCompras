import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'sale' | 'new' | 'promo'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-blush text-warm-gray',
    sale: 'bg-coral text-white',
    new: 'bg-deep-rose text-white',
    promo: 'bg-rose text-white',
  }

  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}