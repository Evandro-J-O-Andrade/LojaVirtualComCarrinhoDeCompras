import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import type { Experiencia } from '../model/experiencia'

interface ExperienciaCardProps {
  experiencia: Experiencia
  className?: string
}

/**
 * Cartão de experiência: capa real,
 * contextos editoriais e o estado
 * honesto quando não há data/local
 * reais — "em breve", nunca inventado.
 */
export function ExperienciaCard({
  experiencia,
  className,
}: ExperienciaCardProps) {
  const semDataReal = experiencia.data === null

  return (
    <article className={className}>
      <Link
        to={`/experiencias/${experiencia.slug}`}
        className="card-angel group block"
      >
        <div className="relative overflow-hidden">
          <ImagemEditorial
            src={experiencia.capa}
            alt={experiencia.titulo}
            className="aspect-[3/4]"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {experiencia.contextos.map((contexto) => (
              <Badge key={contexto} variant="new">
                {contexto}
              </Badge>
            ))}
          </div>
          {semDataReal && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="default">Em breve</Badge>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold text-content transition-colors group-hover:text-primary">
            {experiencia.titulo}
          </h3>
          <p className="mt-1 text-body-sm font-medium text-champagne-dark">
            {experiencia.chamada}
          </p>
          <p className="mt-2 line-clamp-2 text-body text-content-muted">
            {experiencia.narrativa}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-primary transition-all group-hover:gap-3">
            Ver experiência
            <ArrowRight size={16} />
          </span>
        </div>
      </Link>

      {/* Estado editorial honesto: sem data/local
          reais, não se inventa calendário. */}
      {!semDataReal && (
        <p className="mt-2 flex items-center gap-2 text-body-sm text-content-subtle">
          <CalendarClock size={14} />
          {experiencia.data}
          {experiencia.local ? ` — ${experiencia.local}` : ''}
        </p>
      )}
    </article>
  )
}
