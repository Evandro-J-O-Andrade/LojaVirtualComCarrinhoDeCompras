import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ProductGallery } from '@/components/commerce/ProductGallery'
import { QuantitySelector } from '@/components/commerce/QuantitySelector'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { formatPrice } from '@/lib/utils'
import { SeoHead, productJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import { toast } from 'sonner'
import { Heart, Shield, Truck, Star, CheckCircle, ShoppingBag, Share2, Home } from 'lucide-react'
import { ProductRelated } from '@/components/commerce/ProductRelated'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('produto')
        .select(`
          id,
          nome,
          slug,
          preco_base,
          ativo,
          produto_imagem!inner(url, principal, ordem)
        `)
        .eq('slug', slug)
        .eq('ativo', true)
        .single()
      if (queryError) throw queryError
      const row: any = data
      const images = (row.produto_imagem || [])
        .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0))
        .map((img: any) => img.url)
      return { ...row, images, price: row.preco_base }
    },
  })

  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { toggle, isFavorite: isFav } = useFavorites()

  const favorite = product ? isFav(product.id) : false

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container-angel">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-blush rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-blush rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-blush rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-blush rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="py-8">
        <div className="container-angel">
          <ErrorState
            message="Não foi possível carregar o produto."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  const images = product.images || []
  const price = product.price || product.preco_base
  const primaryImage = images[0] || '/placeholder-product.jpg'

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.nome,
      price,
      quantity,
      image: images[0],
    })
    toast.success('Produto adicionado ao carrinho!')
  }

  return (
    <div>
      <SeoHead
        title={product.nome}
        description={product.descricao || `${product.nome} por ${formatPrice(price)}. Compre agora na ANGEL Cosméticos.`}
        canonical={`/produtos/${product.slug}`}
        ogImage={primaryImage}
        ogType="product"
        jsonLd={[
          productJsonLd({
            name: product.nome,
            image: primaryImage,
            price,
            slug: product.slug,
            availability: product.ativo ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          }),
          breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Produtos', href: '/produtos' },
            { name: product.nome, href: `/produtos/${product.slug}` },
          ]),
        ]}
      />

      <div className="py-8">
        <div className="container-angel">
          <nav className="flex items-center gap-2 text-sm text-warm-gray mb-6">
            <Link to="/" className="hover:text-deep-rose flex items-center gap-1">
              <Home size={14} /> Início
            </Link>
            <span>/</span>
            <Link to="/produtos" className="hover:text-deep-rose">
              Produtos
            </Link>
            <span>/</span>
            <span className="text-soft-black truncate">{product.nome}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ProductGallery images={images} name={product.nome} />

            <div className="space-y-6">
              <h1 className="font-display font-bold text-4xl text-soft-black">
                {product.nome}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="font-display font-bold text-3xl text-deep-rose">
                  {formatPrice(price)}
                </span>
              </div>

              {product.descricao && (
                <p className="text-warm-gray leading-relaxed">
                  {product.descricao}
                </p>
              )}

              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-warm-gray">(4.8)</span>
              </div>

              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={10}
              />

              <div className="flex gap-4">
                <Button variant="primary" size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingBag size={20} />
                  Adicionar ao carrinho
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => toggle(product.id)}
                  aria-label="Favoritar"
                >
                  <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
                </Button>
                <Button variant="ghost" size="lg" aria-label="Compartilhar">
                  <Share2 size={20} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-champagne">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-deep-rose" />
                  <span className="text-sm">Frete gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-deep-rose" />
                  <span className="text-sm">Garantia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-deep-rose" />
                  <span className="text-sm">Devoluções</span>
                </div>
              </div>
            </div>
          </div>

          <ProductRelated productId={product.id} limit={4} />
        </div>
      </div>
    </div>
  )
}