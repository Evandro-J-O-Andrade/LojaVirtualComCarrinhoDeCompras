import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Star } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { DiscountBadge } from '@/components/commerce/DiscountBadge'
import { cn, formatPrice } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'
import {
  imagemOuFallback,
  precoBase,
  precoOfertado,
  temPromocaoValida,
  type Produto,
} from '../model/produto'
import { ProdutoImagem } from './ProdutoImagem'

interface ProdutoCardProps {
  produto: Produto
  className?: string
}

/**
 * O card é a porta de entrada: foto, nome, avaliação
 * e preço. A experiência comercial completa mora em
 * /produtos/:slug.
 */
export function ProdutoCard({ produto, className }: ProdutoCardProps) {
  const { isFavorite, toggle } = useFavorites()
  const favorito = isFavorite(produto.id)
  const base = precoBase(produto)
  const ofertado = precoOfertado(produto)
  const comDesconto = temPromocaoValida(produto) && ofertado < base
  const categoria = produto.categorias[0]
  const nota = produto.avaliacao?.nota

  return (
    <article className={cn('card-angel group', className)}>
      <Link
        to={`/produtos/${produto.slug}`}
        className="block"
        aria-label={`Ver fotos de ${produto.nome}`}
        tabIndex={-1}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-sunken">
          <ProdutoImagem
            src={imagemOuFallback(produto)}
            alt={produto.nome}
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          {comDesconto && (
            <div className="absolute left-3 top-3">
              <DiscountBadge
                originalPrice={base}
                currentPrice={ofertado}
                size="sm"
              />
            </div>
          )}
          {categoria && !comDesconto && (
            <div className="absolute left-3 top-3">
              <Badge variant="default">{categoria.nome}</Badge>
            </div>
          )}
          <button
            type="button"
            onClick={(evento) => {
              evento.preventDefault()
              evento.stopPropagation()
              toggle(produto.id)
            }}
            aria-label={
              favorito
                ? `Remover ${produto.nome} dos favoritos`
                : `Favoritar ${produto.nome}`
            }
            aria-pressed={favorito}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-content transition-colors hover:text-coral"
          >
            <Heart size={18} fill={favorito ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>
      <div className="p-5">
        <Link to={`/produtos/${produto.slug}`}>
          <h3 className="truncate font-display font-semibold text-xl text-content transition-colors group-hover:text-primary">
            {produto.nome}
          </h3>
        </Link>
        {nota !== undefined && (
          <div
            className="mt-2 flex items-center gap-1"
            aria-label={`Avaliação: ${nota} de 5`}
          >
            {Array.from({ length: 5 }, (_, indice) => (
              <Star
                key={indice}
                size={14}
                className={
                  indice < Math.round(nota)
                    ? 'fill-warning text-warning'
                    : 'text-content-subtle'
                }
              />
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex flex-wrap items-baseline gap-2">
            <span
              className={cn(
                'font-display font-bold text-lg',
                comDesconto ? 'text-coral' : 'text-primary',
              )}
            >
              {formatPrice(ofertado)}
            </span>
            {comDesconto && (
              <s className="text-sm text-content-subtle">
                {formatPrice(base)}
              </s>
            )}
          </span>
        </div>
        <Link
          to={`/produtos/${produto.slug}`}
          className="btn-angel-subtle mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm"
        >
          Ver produto
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  )
}
