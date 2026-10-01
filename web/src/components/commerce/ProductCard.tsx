import { Heart, Star, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { DiscountBadge } from '@/components/commerce/DiscountBadge'
import { formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useFavorites } from '@/contexts/FavoritesContext'

interface ProductCardProps {
  id: number | string
  name: string
  slug: string
  price: number
  discountPrice?: number
  image?: string
  rating?: number
  reviewCount?: number
  badge?: 'sale' | 'new' | 'promo'
  isFavorite?: boolean
}

export function ProductCard({
  name,
  slug,
  price,
  discountPrice,
  image,
  rating,
  reviewCount,
  badge,
  isFavorite: _isFavoriteProp,
  id,
}: ProductCardProps) {
  const { isFavorite, toggle } = useFavorites()
  const favorite = id ? isFavorite(id) : _isFavoriteProp
  const hasDiscount = discountPrice && discountPrice < price

  return (
    <div className="card-angel group">
      <Link to={`/produtos/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-blush">
          <img
            src={image || '/placeholder-product.jpg'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {hasDiscount && (
            <div className="absolute top-3 left-3">
              <DiscountBadge
                originalPrice={price}
                currentPrice={discountPrice}
                size="sm"
              />
            </div>
          )}
          {badge && badge !== 'sale' && (
            <div className="absolute top-3 left-3">
              <Badge variant={badge}>{badge}</Badge>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (id) toggle(id)
            }}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center transition-all',
              favorite ? 'text-coral' : 'text-warm-gray hover:text-coral'
            )}
            aria-label="Favoritar"
          >
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="primary" size="sm" className="shadow-lg">
              <ShoppingBag size={14} />
              Adicionar
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-soft-black truncate group-hover:text-deep-rose transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            {rating && (
              <>
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-warm-gray">{rating}</span>
                {reviewCount && (
                  <span className="text-sm text-warm-gray">({reviewCount})</span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-display font-bold text-lg text-deep-rose">
              {formatPrice(discountPrice || price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-warm-gray line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
