import { cn } from '@/lib/utils'

interface LoadingGridProps {
  count?: number
  columns?: number
}

export function LoadingGrid({ count = 6, columns = 3 }: LoadingGridProps) {
  return (
    <div className={cn('grid gap-6', `grid-cols-2 lg:grid-cols-${columns}`)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-square bg-blush rounded-2xl animate-pulse" />
          <div className="h-4 bg-blush rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-blush rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
