import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useCategorias, useProdutos } from '../hooks/useProdutos'
import { useMimos } from '@/domains/mimos/hooks/useMimos'
import {
  CATEGORIAS_COMERCIAIS,
  descricaoDaCategoria,
  midiaDaCategoria,
  midiaDaCategoriaComercial,
  normalizarSlugCategoria,
  produtoPertenceCategoriaComercial,
} from '../model/categoria-editorial'

/**
 * /categorias — índice comercial da Angel.
 * As três frentes de negócio são navegação estável;
 * a contagem e os produtos continuam vindo do catálogo.
 * Kits usam a rota de mimos e só contam registros reais.
 */
export function CategoriasPage() {
  const {
    data: categorias,
    isLoading: categoriasCarregando,
    error: categoriasErro,
    refetch: recarregarCategorias,
  } = useCategorias()
  const {
    data: produtos,
    isLoading: produtosCarregando,
    error: produtosErro,
    refetch: recarregarProdutos,
  } = useProdutos()
  const { data: mimos } = useMimos()

  const carregandoCatalogo = categoriasCarregando || produtosCarregando
  const erroCatalogo = categoriasErro || produtosErro
  const categoriasBase = categorias ?? []
  const produtosReais = produtos ?? []
  const mimosReais = (mimos ?? []).filter((mimo) => mimo.source === 'supabase')

  const outrasCategorias = categoriasBase.filter((categoria) =>
    !CATEGORIAS_COMERCIAIS.some((comercial) =>
      comercial.aliases.some((alias) =>
        normalizarSlugCategoria(alias) === normalizarSlugCategoria(categoria.slug) ||
        normalizarSlugCategoria(alias) === normalizarSlugCategoria(categoria.nome),
      ),
    ),
  )

  const recarregar = () => {
    void recarregarCategorias()
    void recarregarProdutos()
  }

  return (
    <div>
      <SeoHead
        title="Categorias — Angel Cosméticos"
        description="Explore beleza e cosméticos, moda e lingerie, cama, mesa e banho e kits para presentear na Angel Cosméticos."
        canonical="/categorias"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Categorias', href: '/categorias' },
        ])}
      />

      <div className="section-angel">
        <div className="container-angel">
          <header className="mb-12 max-w-3xl">
            <p className="overline-angel mb-3">Angel Cosméticos</p>
            <h1 className="title-h1">Encontre o seu próximo favorito</h1>
            <p className="body-angel-lg mt-4">
              Beleza, vestir e casa convivem na mesma curadoria. Escolha uma
              categoria e explore o catálogo disponível.
            </p>
          </header>

          {erroCatalogo && (
            <div className="mb-8">
              <ErrorState
                message="Não foi possível confirmar todo o catálogo. As categorias continuam acessíveis, mas as contagens podem estar indisponíveis."
                onRetry={recarregar}
              />
            </div>
          )}

          {carregandoCatalogo ? (
            <LoadingGrid count={4} columns={4} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {CATEGORIAS_COMERCIAIS.map((categoria) => {
                const quantidade = categoria.slug === 'kits-e-presentes'
                  ? mimosReais.length
                  : produtosReais.filter((produto) =>
                      produtoPertenceCategoriaComercial(produto, categoria),
                    ).length
                const midia = midiaDaCategoriaComercial(
                  categoria,
                  categoriasBase,
                  produtosReais,
                )
                const contagem = erroCatalogo
                  ? 'Contagem indisponível'
                  : categoria.slug === 'kits-e-presentes'
                    ? `${quantidade} ${quantidade === 1 ? 'kit cadastrado' : 'kits cadastrados'}`
                    : `${quantidade} ${quantidade === 1 ? 'produto' : 'produtos'}`

                return (
                  <Link
                    key={categoria.slug}
                    to={categoria.href}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-surface-sunken shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    aria-label={`${categoria.nome} — ${contagem}`}
                  >
                    <ImagemEditorial
                      src={midia?.url ?? null}
                      alt={midia?.alt ?? categoria.imagemAlt}
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="overline-angel text-champagne">
                        {contagem}
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-semibold text-cream">
                        {categoria.nome}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-body text-cream/85">
                        {categoria.descricao}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-body font-medium text-cream transition-all group-hover:gap-3">
                        {categoria.slug === 'kits-e-presentes' ? 'Ver kits e mimos' : 'Explorar categoria'}
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {outrasCategorias.length > 0 && (
            <section className="mt-16" aria-labelledby="outras-categorias">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="overline-angel mb-2">Mais para descobrir</p>
                  <h2 id="outras-categorias" className="title-h2">
                    Outras categorias do catálogo
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {outrasCategorias.map((categoria) => {
                  const quantidade = produtosReais.filter((produto) =>
                    produto.categorias.some((referencia) => referencia.slug === categoria.slug),
                  ).length
                  const midia = midiaDaCategoria(categoria, produtosReais)
                  return (
                    <Link
                      key={categoria.id}
                      to={`/categorias/${categoria.slug}`}
                      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-champagne/70 bg-white p-3 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-4"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                        <ImagemEditorial
                          src={midia?.url ?? null}
                          alt={midia?.alt ?? categoria.nome}
                        />
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-content">{categoria.nome}</span>
                        <span className="mt-1 block text-xs text-content-muted">
                          {erroCatalogo ? 'Contagem indisponível' : `${quantidade} ${quantidade === 1 ? 'produto' : 'produtos'}`}
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <div className="surface-card mt-16 grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div>
              <p className="overline-angel mb-3">Curadoria</p>
              <h2 className="title-h2">Uma categoria, um ritual</h2>
            </div>
            <p className="body-angel-lg leading-relaxed">
              O catálogo é alimentado pelos cadastros da loja. Quando uma
              categoria ainda não tiver produtos publicados, ela permanece
              navegável sem inventar disponibilidade ou preço.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
