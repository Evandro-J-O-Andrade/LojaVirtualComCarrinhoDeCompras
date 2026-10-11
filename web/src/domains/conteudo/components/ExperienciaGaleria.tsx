import { cn } from '@/lib/utils'
import type { Experiencia } from '../model/experiencia'
import { ExperienciaCard } from './ExperienciaCard'

interface ExperienciaGaleriaProps {
  experiencias: Experiencia[]
  className?: string
}

/**
 * Galeria de experiências em masonry:
 * colunas CSS reais, quebra de coluna
 * evitada. Cada cartão é uma experiência
 * real do patrimônio — nada preenche
 * espaço.
 */
export function ExperienciaGaleria({
  experiencias,
  className,
}: ExperienciaGaleriaProps) {
  if (experiencias.length === 0) return null

  return (
    <div
      className={cn(
        'columns-1 gap-6 sm:columns-2 lg:columns-3',
        className,
      )}
      aria-label="Galeria de experiências"
    >
      {experiencias.map((experiencia) => (
        <div
          key={experiencia.slug}
          className="mb-6 break-inside-avoid"
        >
          <ExperienciaCard experiencia={experiencia} />
        </div>
      ))}
    </div>
  )
}
