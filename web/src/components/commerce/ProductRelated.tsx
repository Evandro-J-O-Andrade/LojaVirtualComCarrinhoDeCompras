import { ProductCard } from '@/components/commerce/ProductCard'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

interface RelatedProps {
  productId: number | string
  limit?: number
}

export function ProductRelated({ productId, limit = 4 }: RelatedProps) {
  const { data: products } = useQuery({
    queryKey: ['related', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produto')
        .select(`
          id,
          nome,
          slug,
          preco_base,
          ativo,
          produto_imagem(url, principal, ordem)
        `)
        .eq('ativo', true)
        .neq('id', productId)
        .limit(limit)
      if (error) throw error
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

  if (!products || products.length === 0) return null

  return (
    <div className="mt-16">
      <h3 className="font-display font-bold text-2xl text-soft-black mb-6">
        Você também pode gostar
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
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
    </div>
  )
}