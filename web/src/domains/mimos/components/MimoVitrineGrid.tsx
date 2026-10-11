import { cn } from '@/lib/utils'
import type { Mimo } from '../model/mimo'
import { MimoVitrineItem } from './MimoVitrineItem'

interface MimoVitrineGridProps {
  mimos: Mimo[]
  titulo?: string
  className?: string
}

export function MimoVitrineGrid({ mimos, titulo, className }: MimoVitrineGridProps) {
  if (mimos.length === 0) return null

  return (
    <section
      className={cn('mimo-vitrine', className)}
      aria-label={titulo ?? 'Mimos'}
    >
      {titulo ? (
        <h2 className="mb-6 font-display font-semibold text-3xl text-content">
          {titulo}
        </h2>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mimos.map((mimo) => (
          <MimoVitrineItem key={mimo.id} mimo={mimo} />
        ))}
      </div>
    </section>
  )
}
