import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/commerce/ProductCard'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: produtos, isLoading, error } = useQuery({
    queryKey: ['produtos', search, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('produto')
        .select(`
          id,
          nome,
          slug,
          preco_base,
          ativo,
          produto_imagem!inner(url, principal, ordem)
        `)
        .eq('ativo', true)

      if (search) {
        query = query.ilike('nome', `%${search}%`)
      }

      const { data, error: queryError } = await query
      if (queryError) throw queryError
      return (data || []).map((p: any) => ({
        ...p,
        price: p.preco_base,
        image: (p.produto_imagem || [])
          .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0))
          .find((img: any) => img.principal)?.url
          || (p.produto_imagem || [])[0]?.url,
      }))
    },
  })

  const categories = ['Beleza & Maquiagem', 'Casa', 'Moda Feminina']

  return (
    <div>
      <SeoHead
        title="Todos os produtos"
        description="Explore o catálogo completo da ANGEL Cosméticos. Beleza, moda feminina e cama, mesa & banho com os melhores produtos."
        canonical="/produtos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Produtos', href: '/produtos' },
        ])}
      />

      <div className="py-8">
      <div className="container-angel">
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl text-soft-black mb-2">
            Todos os produtos
          </h1>
          <p className="text-warm-gray">Explore nosso catálogo completo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-display font-semibold text-lg mb-4">Filtros</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome do produto"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Categoria
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-lg text-sm',
                      selectedCategory === '' ? 'bg-deep-rose text-white' : 'hover:bg-blush'
                    )}
                  >
                    Todas
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm',
                        selectedCategory === cat ? 'bg-deep-rose text-white' : 'hover:bg-blush'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-champagne">
                <p className="text-sm text-warm-gray">
                  {produtos?.length || 0} produtos encontrados
                </p>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {isLoading ? (
              <LoadingGrid count={6} columns={3} />
            ) : error ? (
              <ErrorState message="Não foi possível carregar os produtos." />
            ) : produtos && produtos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {produtos.map((product: any) => (
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
            ) : (
              <div className="text-center py-16">
                <p className="text-warm-gray">Nenhum produto encontrado.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    </div>
  )
}