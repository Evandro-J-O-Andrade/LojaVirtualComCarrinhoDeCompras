import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/commerce/ProductCard'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Heart } from 'lucide-react'

export function FavoritosPage() {
  const { items, clear } = useFavorites()

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['favoritos', items],
    queryFn: async () => {
      if (items.length === 0) return []
      const { data, error: queryError } = await supabase
        .from('produto')
        .select(`
          id,
          nome,
          slug,
          preco_base,
          ativo,
          produto_imagem(url, principal, ordem)
        `)
        .in('id', items)
        .eq('ativo', true)
      if (queryError) throw queryError
      return (data || []).map((p: any) => ({
        id: String(p.id),
        ...p,
        price: p.preco_base,
        image: (p.produto_imagem || [])
          .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0))
          .find((img: any) => img.principal)?.url
          || (p.produto_imagem || [])[0]?.url,
      }))
    },
  })

  return (
    <div>
      <SeoHead
        title="Meus Favoritos"
        description="Produtos que você salvou para ver depois."
        canonical="/conta/favoritos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Conta', href: '/conta' },
          { name: 'Favoritos', href: '/conta/favoritos' },
        ])}
      />

      <div className="py-8">
        <div className="container-angel">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-soft-black">
                Meus Favoritos
              </h1>
              <p className="text-warm-gray">Produtos que você salvou para ver depois</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="text-sm text-warm-gray hover:text-coral transition-colors"
              >
                Limpar todos
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-rose" />
              </div>
              <h2 className="font-display font-bold text-2xl text-soft-black mb-4">
                Você ainda não tem favoritos
              </h2>
              <p className="text-warm-gray mb-6">
                Explore nosso catálogo e salve os produtos que mais gostar.
              </p>
              <a
                href="/produtos"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-deep-rose text-white font-medium hover:bg-rose transition-all"
              >
                Ver produtos
              </a>
            </div>
          ) : isLoading ? (
            <LoadingGrid count={4} columns={3} />
          ) : error ? (
            <ErrorState message="Não foi possível carregar os produtos favoritos." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products?.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.nome}
                  price={product.price || product.preco_base}
                  image={product.image}
                  slug={product.slug}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}