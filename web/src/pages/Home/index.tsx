import { Section } from '@/components/sections/Section'
import { SectionHeader } from '@/components/sections/SectionHeader'
import { Hero } from '@/components/sections/Hero'
import { CategoryCard } from '@/components/commerce/CategoryCard'
import { ProductCard } from '@/components/commerce/ProductCard'
import { TestimonialSection } from '@/components/sections/TestimonialSection'
import { SocialBar } from '@/components/sections/SocialBar'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SeoHead, organizationJsonLd } from '@/lib/seo'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

const categories = [
  {
    title: 'Beleza & Maquiagem',
    description: 'Os produtos mais buscados para realçar sua beleza',
    image: '/images/categoria-beleza.jpg',
    href: '/produtos?categoria=maquiagem',
  },
  {
    title: 'Casa',
    description: 'Cama, mesa e banho para um lar acolhedor',
    image: '/images/categoria-casa.jpg',
    href: '/produtos',
  },
  {
    title: 'Moda Feminina',
    description: 'Peças selecionadas para o estilo único',
    image: '/images/categoria-moda.jpg',
    href: '/produtos',
  },
]

export function HomePage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-home'],
    queryFn: async () => {
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
        .eq('ativo', true)
        .limit(8)
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

  return (
    <div>
      <SeoHead
        title="ANGEL Cosméticos — Beleza, Moda e Casa"
        description="Descubra os produtos mais buscados para realçar sua beleza. Beleza, moda feminina e cama, mesa & banho em um só lugar."
        ogType="website"
        jsonLd={organizationJsonLd()}
      />

      <Hero
        title="Sua beleza, seu estilo"
        subtitle="Descubra os produtos mais buscados para realçar sua beleza"
        image="/images/hero-beauty.jpg"
        primaryLabel="Ver produtos"
        primaryHref="/produtos"
        secondaryLabel="Conheça a ANGEL"
        secondaryHref="/sobre"
      />

      <Section className="py-16">
        <SectionHeader
          title="Nossas categorias"
          subtitle="Escolha o que você procura"
          action={{ label: 'Ver todas', href: '/produtos' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
      </Section>

      <Section className="py-16 bg-blush/30">
        <SectionHeader
          title="Produtos em destaque"
          subtitle="Os mais amados da comunidade ANGEL"
          action={{ label: 'Ver todos', href: '/produtos' }}
        />
        {isLoading ? (
          <LoadingGrid count={6} columns={3} />
        ) : error ? (
          <ErrorState message="Não foi possível carregar os produtos." />
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
      </Section>

      <Section className="py-16">
        <SectionHeader
          title="Ofertas especiais"
          subtitle="Produtos com preços imperdíveis"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.slice(0, 4).map((product: any) => (
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
      </Section>

      <TestimonialSection />
      <SocialBar />
    </div>
  )
}