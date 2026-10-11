import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/commerce/ProductCard'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useProdutos } from '@/domains/produtos/hooks/useProdutos'
import { imagemPrincipal } from '@/domains/produtos/model/produto'
import { useAccount } from '../context/AccountContext'

/**
 * Favoritos — local primeiro, honesto.
 *
 * Favoritos NÃO são estado comercial:
 * um visitante pode salvá-los sem
 * conta. Ficam neste dispositivo até a
 * integração de conta, quando o merge
 * explícito (locais → conta) existirá.
 * Nada de transformar isso em pedido,
 * estoque ou outra autoridade.
 */
export function FavoritosPage() {
  const { items, clear } = useFavorites()
  const { authenticated } = useAccount()
  const {
    data: produtos = [],
    isLoading,
    error,
  } = useProdutos()

  // Resolve os favoritos locais contra o
  // catálogo real — sem consulta solta ao
  // banco, passando pelo adaptador de
  // produtos.
  const favoritos = produtos.filter((p) =>
    items.includes(p.id),
  )

  return (
    <div>
      <SeoHead
        title="Meus Favoritos — Angel Cosméticos"
        description="Produtos que você salvou para ver depois."
        canonical="/conta/favoritos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Favoritos', href: '/conta/favoritos' },
        ])}
      />

      <div className="py-8">
        <div className="container-angel">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-soft-black">
                Meus Favoritos
              </h1>
              <p className="text-warm-gray">
                Produtos que você salvou para
                ver depois
              </p>
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

          {authenticated && (
            <p className="mb-6 rounded-xl border border-champagne bg-blush/40 px-4 py-3 text-sm text-content-muted">
              Seus favoritos ficam neste
              dispositivo. Com a integração da
              conta, eles passam para a sua
              conta com um merge explícito.
            </p>
          )}
          {!authenticated &&
            items.length > 0 && (
              <p className="mb-6 rounded-xl border border-champagne bg-blush/40 px-4 py-3 text-sm text-content-muted">
                Você não precisa de conta para
                favoritar: esta lista fica neste
                dispositivo.
              </p>
            )}

          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blush">
                <Heart
                  size={40}
                  className="text-rose"
                  aria-hidden
                />
              </div>
              <h2 className="mb-4 font-display text-2xl font-bold text-soft-black">
                Você ainda não tem favoritos
              </h2>
              <p className="mb-6 text-warm-gray">
                Explore nosso catálogo e salve
                os produtos que mais gostar.
              </p>
              <Link
                to="/produtos"
                className="inline-flex items-center justify-center rounded-full bg-deep-rose px-6 py-3 font-medium text-white transition-all hover:bg-rose"
              >
                Ver produtos
              </Link>
            </div>
          ) : isLoading ? (
            <p className="py-16 text-center text-warm-gray">
              Carregando seus favoritos…
            </p>
          ) : error ? (
            <p className="py-16 text-center text-warm-gray">
              Não foi possível carregar o
              catálogo agora. Seus favoritos
              continuam salvos neste
              dispositivo.
            </p>
          ) : favoritos.length === 0 ? (
            <p className="py-16 text-center text-warm-gray">
              Seus favoritos aparecem quando o
              catálogo estiver disponível.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {favoritos.map((produto) => (
                <ProductCard
                  key={produto.id}
                  id={produto.id}
                  name={produto.nome}
                  price={produto.precoBase}
                  image={
                    imagemPrincipal(produto) ??
                    undefined
                  }
                  slug={produto.slug}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
