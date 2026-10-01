import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(Math.min(max, value + 1))

  const buttonSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
  const fontSize = size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={decrease}
        disabled={value <= min}
        className={cn(
          buttonSize,
          'rounded-full bg-blush flex items-center justify-center hover:bg-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <MinusIcon />
      </button>
      <span className={cn('font-medium w-8 text-center', fontSize)}>{value}</span>
      <button
        onClick={increase}
        disabled={value >= max}
        className={cn(
          buttonSize,
          'rounded-full bg-blush flex items-center justify-center hover:bg-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}
