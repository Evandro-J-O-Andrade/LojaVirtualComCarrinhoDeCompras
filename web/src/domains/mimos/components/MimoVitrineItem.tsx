import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { cn, formatPrice } from '@/lib/utils'
import type { Mimo } from '../model/mimo'
import {
  MIMO_CONTEXTOS,
  MIMO_IMAGE_FALLBACK,
  mimoPrecoBase,
} from '../model/mimo'

interface MimoVitrineItemProps {
  mimo: Mimo
  className?: string
}

export function MimoVitrineItem({ mimo, className }: MimoVitrineItemProps) {
  const imagem = mimo.imagem || MIMO_IMAGE_FALLBACK
  const preco = mimoPrecoBase(mimo)
  const contexto = mimo.contexto ? MIMO_CONTEXTOS[mimo.contexto] : null
  const titulo = mimo.titulo ?? mimo.nome

  return (
    <article className={cn('card-angel group', className)}>
      <Link to={`/mimos/${mimo.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-sunken">
          <img
            src={imagem}
            alt={titulo}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {contexto && (
            <div className="absolute left-3 top-3">
              <Badge variant="default">{contexto.rotulo}</Badge>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="truncate font-display font-semibold text-xl text-content transition-colors group-hover:text-primary">
            {titulo}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <span
              className={cn(
                'font-display font-bold text-lg',
                preco === null ? 'text-content-subtle' : 'text-primary',
              )}
            >
              {preco === null ? 'Sob consulta' : formatPrice(preco)}
            </span>
            <ArrowRight
              size={18}
              className="translate-x-0 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
            />
          </div>
        </div>
      </Link>
    </article>
  )
}
