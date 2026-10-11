import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { useCategorias, useProdutos } from '../hooks/useProdutos'
import { ProdutoCard } from '../components/ProdutoCard'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const categoriaDaUrl = searchParams.get('categoria')
  const [categoriaSlug, setCategoriaSlug] = useState<string | null>(
    categoriaDaUrl,
  )

  const {
    data: produtos,
    isLoading,
    error,
    refetch,
  } = useProdutos()
  const { data: categorias } = useCategorias()
  const isEditorial =
    produtos?.some((produto) => produto.source === 'editorial') ?? false

  const filtrados = useMemo(() => {
    const lista = produtos ?? []
    const porCategoria = categoriaSlug
      ? lista.filter((produto) =>
          produto.categorias.some(
            (categoria) => categoria.slug === categoriaSlug,
          ),
        )
      : lista
    const termo = busca.trim().toLowerCase()
    if (!termo) return porCategoria
    return porCategoria.filter((produto) =>
      produto.nome.toLowerCase().includes(termo),
    )
  }, [produtos, busca, categoriaSlug])

  const aoEscolherCategoria = (slug: string | null) => {
    setCategoriaSlug(slug)
    setSearchParams(
      (params) => {
        if (slug) params.set('categoria', slug)
        else params.delete('categoria')
        return params
      },
      { replace: true },
    )
  }

  const limparFiltros = () => {
    setBusca('')
    aoEscolherCategoria(null)
  }

  return (
    <div>
      <SeoHead
        title="Produtos"
        description="Catálogo de produtos da ANGEL Cosméticos: beleza, maquiagem, fragrâncias e casa."
        canonical="/produtos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Produtos', href: '/produtos' },
        ])}
      />

      <div className="section-angel">
        <div className="container-angel">
          <header className="mb-10 max-w-2xl">
            <p className="overline-angel mb-3">Angel Cosméticos</p>
            <h1 className="title-h1">Produtos</h1>
            <p className="body-angel-lg mt-4">
              Beleza, maquiagem, fragrâncias e casa — curadoria
              selecionada para você.
            </p>
          </header>

          {isEditorial && (
            <div className="mb-10 rounded-2xl border border-champagne bg-champagne-light/40 px-5 py-4">
              <p className="text-body-sm text-content">
                <strong>Catálogo em montagem:</strong> exibimos conteúdo
                editorial de demonstração. Produtos, variantes e preços
                reais ainda não foram cadastrados.
              </p>
            </div>
          )}

          <div className="mb-8" role="search">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-content-subtle"
              />
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar produto..."
                aria-label="Buscar produto"
                className="field-angel pl-11"
              />
            </div>
          </div>

          {categorias && categorias.length > 0 && (
            <div
              className="mb-8 flex flex-wrap gap-2"
              role="group"
              aria-label="Filtrar por categoria"
            >
              <button
                type="button"
                onClick={() => aoEscolherCategoria(null)}
                aria-pressed={categoriaSlug === null}
                className={cn(
                  'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all',
                  categoriaSlug === null
                    ? 'border-primary bg-primary text-primary-contrast'
                    : 'border-champagne text-content hover:border-primary',
                )}
              >
                Todos
              </button>
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() =>
                    aoEscolherCategoria(
                      categoria.slug === categoriaSlug
                        ? null
                        : categoria.slug,
                    )
                  }
                  aria-pressed={categoriaSlug === categoria.slug}
                  className={cn(
                    'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all',
                    categoriaSlug === categoria.slug
                      ? 'border-primary bg-primary text-primary-contrast'
                      : 'border-champagne text-content hover:border-primary',
                  )}
                >
                  {categoria.nome}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <LoadingGrid count={8} columns={4} />
          ) : error ? (
            <ErrorState
              message="Não foi possível carregar os produtos."
              onRetry={() => refetch()}
            />
          ) : filtrados.length === 0 ? (
            <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
              <h2 className="title-h2">Nenhum produto encontrado</h2>
              <p className="mb-6 max-w-md body-angel">
                {busca || categoriaSlug
                  ? 'Tente ajustar a busca ou o filtro de categoria.'
                  : 'No momento não temos produtos para exibir.'}
              </p>
              {(busca || categoriaSlug) && (
                <Button variant="outline" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filtrados.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
