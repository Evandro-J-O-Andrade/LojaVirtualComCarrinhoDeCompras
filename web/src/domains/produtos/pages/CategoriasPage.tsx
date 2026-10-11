import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useCategorias, useProdutos } from '../hooks/useProdutos'
import {
  descricaoDaCategoria,
  midiaDaCategoria,
} from '../model/categoria-editorial'

/**
 * /categorias — índice editorial das categorias.
 * Composição com mídia real por categoria e
 * contagem real de produtos; sem tile genérico.
 */
export function CategoriasPage() {
  const {
    data: categorias,
    isLoading,
    error,
    refetch,
  } = useCategorias()
  const { data: produtos } = useProdutos()

  return (
    <div>
      <SeoHead
        title="Categorias"
        description="Navegue pelo universo ANGEL Cosméticos: beleza, maquiagem, fragrâncias e casa."
        canonical="/categorias"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Categorias', href: '/categorias' },
        ])}
      />

      <div className="section-angel">
        <div className="container-angel">
          <header className="mb-12 max-w-2xl">
            <p className="overline-angel mb-3">
              Angel Cosméticos
            </p>
            <h1 className="title-h1">Categorias</h1>
            <p className="body-angel-lg mt-4">
              Cada categoria é uma curadoria com vida
              própria — encontre o momento que você
              vive.
            </p>
          </header>

          {isLoading ? (
            <LoadingGrid count={4} columns={4} />
          ) : error ? (
            <ErrorState
              message="Não foi possível carregar as categorias."
              onRetry={() => refetch()}
            />
          ) : !categorias || categorias.length === 0 ? (
            <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
              <h2 className="title-h2">
                Nenhuma categoria no momento
              </h2>
              <p className="mt-3 max-w-md body-angel">
                As categorias aparecem quando o
                catálogo for cadastrado.
              </p>
              <Link
                to="/produtos"
                className="btn-angel-subtle mt-8 inline-flex items-center gap-2 px-6 py-3"
              >
                Ver todos os produtos
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categorias.map((categoria) => {
                const quantidade = (produtos ?? []).filter(
                  (produto) =>
                    produto.categorias.some(
                      (c) => c.slug === categoria.slug,
                    ),
                ).length
                const midia = midiaDaCategoria(
                  categoria,
                  produtos ?? [],
                )
                return (
                  <Link
                    key={categoria.id}
                    to={`/categorias/${categoria.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-xl transition-all duration-300 ease-angel hover:-translate-y-1 hover:shadow-2xl"
                    aria-label={`${categoria.nome} — ${quantidade} produtos`}
                  >
                    <ImagemEditorial
                      src={midia?.url ?? null}
                      alt={midia?.alt ?? categoria.nome}
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="overline-angel text-champagne">
                        {quantidade}{' '}
                        {quantidade === 1
                          ? 'produto'
                          : 'produtos'}
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-semibold text-cream">
                        {categoria.nome}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-body text-cream/80">
                        {descricaoDaCategoria(categoria)}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-body font-medium text-cream transition-all group-hover:gap-3">
                        Ver produtos
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Composição editorial: contexto da curadoria */}
          <div className="surface-card mt-16 grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div>
              <p className="overline-angel mb-3">
                Curadoria
              </p>
              <h2 className="title-h2">
                Uma categoria, um ritual
              </h2>
            </div>
            <p className="body-angel-lg leading-relaxed">
              Da rotina de cuidado ao presente, cada
              categoria reúne produtos escolhidos com
              o mesmo rigor: mídia real, informação
              honesta e preço claro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
