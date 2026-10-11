import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, SearchX } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useCategorias, useProdutos } from '../hooks/useProdutos'
import { ProdutoCard } from '../components/ProdutoCard'
import {
  descricaoDaCategoria,
  midiaDaCategoria,
} from '../model/categoria-editorial'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'

/**
 * /categorias/:slug — página da categoria.
 * Cabeçalho editorial com mídia real e a
 * listagem real de produtos da categoria.
 */
export function CategoriaDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const {
    data: categorias,
    isLoading: categoriasCarregando,
  } = useCategorias()
  const {
    data: produtos,
    isLoading,
    error,
    refetch,
  } = useProdutos()

  const categoria = categorias?.find(
    (categoria) => categoria.slug === slug,
  )

  const produtosDaCategoria = useMemo(
    () =>
      (produtos ?? []).filter((produto) =>
        produto.categorias.some(
          (categoria) => categoria.slug === slug,
        ),
      ),
    [produtos, slug],
  )

  const carregando = isLoading || categoriasCarregando
  const naoEncontrada =
    !carregando && !categoria && produtosDaCategoria.length === 0

  if (naoEncontrada) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
            <SearchX size={40} className="mb-4 text-content-subtle" />
            <h1 className="title-h2">
              Categoria não encontrada
            </h1>
            <p className="mt-3 max-w-md body-angel">
              Esta categoria ainda não existe ou foi
              removida do catálogo.
            </p>
            <Button variant="primary" className="mt-8">
              <Link to="/categorias">Ver categorias</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const titulo = categoria?.nome ?? slug ?? 'Categoria'
  const midia = categoria
    ? midiaDaCategoria(categoria, produtos ?? [])
    : null

  return (
    <div>
      <SeoHead
        title={`${titulo} — Angel Cosméticos`}
        description={descricaoDaCategoria(
          categoria ?? {
            id: slug ?? '',
            nome: titulo,
            slug: slug ?? '',
          },
        )}
        canonical={`/categorias/${slug}`}
        ogImage={midia?.url ?? undefined}
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Categorias', href: '/categorias' },
          { name: titulo, href: `/categorias/${slug}` },
        ])}
      />

      <div className="section-angel">
        <div className="container-angel">
          <nav
            className="mb-8 flex items-center gap-2 text-sm text-content-subtle"
            aria-label="Caminho de navegação"
          >
            <Link to="/" className="hover:text-primary">
              Início
            </Link>
            <span>/</span>
            <Link
              to="/categorias"
              className="hover:text-primary"
            >
              Categorias
            </Link>
            <span>/</span>
            <span className="truncate text-content">
              {titulo}
            </span>
          </nav>

          {/* Cabeçalho editorial da categoria */}
          <header className="card-angel mb-12 grid grid-cols-1 overflow-hidden lg:grid-cols-2">
            <div className="relative">
              <ImagemEditorial
                src={midia?.url ?? null}
                alt={midia?.alt ?? titulo}
                className="aspect-[16/10] lg:aspect-auto lg:h-full"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="overline-angel mb-3 text-champagne-dark">
                {produtosDaCategoria.length}{' '}
                {produtosDaCategoria.length === 1
                  ? 'produto'
                  : 'produtos'}
              </p>
              <h1 className="title-h1">{titulo}</h1>
              <p className="mt-4 text-body-lg text-content-muted">
                {descricaoDaCategoria(
                  categoria ?? {
                    id: slug ?? '',
                    nome: titulo,
                    slug: slug ?? '',
                  },
                )}
              </p>
            </div>
          </header>

          {isLoading ? (
            <LoadingGrid count={4} columns={4} />
          ) : error ? (
            <ErrorState
              message="Não foi possível carregar os produtos desta categoria."
              onRetry={() => refetch()}
            />
          ) : produtosDaCategoria.length === 0 ? (
            <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
              <h2 className="title-h2">
                Nenhum produto aqui ainda
              </h2>
              <p className="mt-3 max-w-md body-angel">
                Os produtos desta categoria ainda não
                foram cadastrados.
              </p>
              <Button variant="outline" className="mt-8">
                <Link to="/produtos">
                  Ver todo o catálogo
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {produtosDaCategoria.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} />
              ))}
            </div>
          )}

          <div className="mt-12">
            <Link
              to="/categorias"
              className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
            >
              <ArrowRight
                size={18}
                className="rotate-180 transition-transform"
              />
              Todas as categorias
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
