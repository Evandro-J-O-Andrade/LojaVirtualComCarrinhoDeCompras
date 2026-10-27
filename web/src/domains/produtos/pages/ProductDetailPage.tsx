import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Calendar,
  Check,
  FileText,
  Heart,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react'
import { useCarrinho } from '@/domains/carrinho/context/CarrinhoProvider'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { QuantitySelector } from '@/components/commerce/QuantitySelector'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { cn, formatPrice } from '@/lib/utils'
import { useProduto } from '../hooks/useProdutos'
import { ProdutoGaleria } from '../components/ProdutoGaleria'
import { ProdutoPreco } from '../components/ProdutoPreco'
import { ProdutoVarianteSelector } from '../components/ProdutoVarianteSelector'
import { ProdutoRelacionados } from '../components/ProdutoRelacionados'
import { ProdutoMimosRelacionados } from '../components/ProdutoMimosRelacionados'
import {
  midiasDoProduto,
  precoOfertado,
  produtoJsonLd,
  rotuloDisponibilidade,
  type ProdutoVariante,
} from '../model/produto'
import { atendimentoHref } from '@/domains/atendimento/model/atendimento'
import { normalizarSlugCategoria } from '../model/categoria-editorial'

function Avaliacao({ nota, total }: { nota: number; total: number }) {
  const arredondada = Math.round(nota)
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Avaliação: ${nota} de 5, ${total} avaliações`}
    >
      {Array.from({ length: 5 }, (_, indice) => (
        <Star
          key={indice}
          size={16}
          className={
            indice < arredondada
              ? 'fill-warning text-warning'
              : 'text-content-subtle'
          }
        />
      ))}
      <span className="ml-2 text-sm text-content-muted">
        {nota.toFixed(1)} ({total})
      </span>
    </div>
  )
}

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { adicionar } = useCarrinho()
  const { isFavorite, toggle } = useFavorites()
  const {
    data: produto,
    isLoading,
    error,
    refetch,
  } = useProduto(slug)

  const [quantidade, setQuantidade] = useState(1)
  const [varianteSelecionada, setVarianteSelecionada] =
    useState<ProdutoVariante | null>(null)
  const [adicionado, setAdicionado] = useState(false)

  useEffect(() => {
    if (!adicionado) return
    const timer = setTimeout(() => setAdicionado(false), 2000)
    return () => clearTimeout(timer)
  }, [adicionado])

  if (isLoading) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-surface-sunken" />
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-sunken" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-surface-sunken" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-surface-sunken" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-sunken" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-surface-sunken" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <ErrorState
            message="Não foi possível carregar este produto."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
            <h1 className="title-h2">Produto indisponível</h1>
            <p className="mt-3 max-w-md body-angel">
              Este produto não está disponível no momento ou foi
              descontinuado.
            </p>
            <Button
              variant="primary"
              className="mt-8"
              onClick={() => navigate('/produtos')}
            >
              Voltar para produtos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const titulo = produto.nome
  const imagemCapa =
    produto.imagens.find((item) => item.principal)?.url ??
    produto.imagens[0]?.url ??
    null
  const favorito = isFavorite(produto.id)
  const midias = midiasDoProduto(produto)
  const variantesAtivas = produto.variantes.filter(
    (variante) => variante.ativo,
  )
  const varianteEfetiva =
    varianteSelecionada ??
    (variantesAtivas.length === 1 ? variantesAtivas[0] : null)
  const sku = varianteEfetiva?.sku ?? produto.sku
  const precoUnitario = precoOfertado(produto, varianteEfetiva)
  const temDetalhes =
    produto.comoUsar !== null ||
    produto.informacoes !== null ||
    produto.composicao.length > 0
  const precisaSelecionarVariante =
    variantesAtivas.length > 1 && varianteEfetiva === null
  const ehModa = produto.categorias.some((categoria) => {
    const slugCategoria = normalizarSlugCategoria(categoria.slug)
    const nomeCategoria = normalizarSlugCategoria(categoria.nome)
    return [
      'moda',
      'moda-feminina',
      'moda-e-lingerie',
      'lingerie',
      'roupas',
      'vestuario',
    ].includes(slugCategoria) || [
      'moda',
      'moda-feminina',
      'moda-e-lingerie',
      'lingerie',
      'roupas',
      'vestuario',
    ].includes(nomeCategoria)
  })
  const tamanhosDisponiveis = [...new Set(
    variantesAtivas.flatMap((variante) =>
      variante.atributos
        .filter((atributo) => atributo.tipo === 'tamanho')
        .map((atributo) => atributo.valor),
    ),
  )]

  const aoAdicionar = () => {
    if (precisaSelecionarVariante) return
    adicionar(produto, varianteEfetiva, quantidade)
    setAdicionado(true)
  }

  return (
    <div>
      <SeoHead
        title={titulo}
        description={
          produto.descricao ??
          `${titulo} — curadoria da ANGEL Cosméticos.`
        }
        canonical={`/produtos/${produto.slug}`}
        ogImage={imagemCapa ?? undefined}
        jsonLd={[
          produtoJsonLd(produto, varianteEfetiva),
          breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Produtos', href: '/produtos' },
            { name: titulo, href: `/produtos/${produto.slug}` },
          ]),
        ]}
      />

      <div className="section-angel-tight">
        <div className="container-angel">
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-content-subtle"
            aria-label="Caminho de navegação"
          >
            <Link to="/" className="hover:text-primary">
              Início
            </Link>
            <span>/</span>
            <Link to="/produtos" className="hover:text-primary">
              Produtos
            </Link>
            <span>/</span>
            <span className="truncate text-content">{titulo}</span>
          </nav>

          {/* ---------- HERO DO PRODUTO ---------- */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <ProdutoGaleria midias={midias} nome={titulo} />

            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {produto.categorias[0] && (
                    <p className="overline-angel">
                      {produto.categorias[0].nome}
                    </p>
                  )}
                  <h1 className="title-h1">{titulo}</h1>
                  {produto.beneficio && (
                    <p className="body-angel-lg mt-3">
                      {produto.beneficio}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggle(produto.id)}
                  aria-label={
                    favorito
                      ? 'Remover dos favoritos'
                      : 'Favoritar'
                  }
                  aria-pressed={favorito}
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all',
                    favorito
                      ? 'border-primary bg-primary text-primary-contrast'
                      : 'border-champagne bg-surface text-content hover:border-primary',
                  )}
                >
                  <Heart
                    size={20}
                    fill={favorito ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {produto.avaliacao && (
                <Avaliacao
                  nota={produto.avaliacao.nota}
                  total={produto.avaliacao.total}
                />
              )}

              {sku && (
                <p className="text-sm text-content-subtle">
                  SKU: {sku}
                </p>
              )}

              <ProdutoPreco produto={produto} variante={varianteEfetiva} />

              {variantesAtivas.length > 0 && (
                <ProdutoVarianteSelector
                  variantes={variantesAtivas}
                  selecionada={varianteEfetiva}
                  onSelect={setVarianteSelecionada}
                />
              )}

              {precisaSelecionarVariante && (
                <p role="status" className="text-sm font-medium text-primary">
                  Selecione as opções disponíveis antes de adicionar ao carrinho.
                </p>
              )}

              {ehModa && (
                <details className="rounded-2xl border border-champagne/70 bg-surface p-4">
                  <summary className="cursor-pointer font-medium text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    Guia de tamanho e medidas
                  </summary>
                  <div className="mt-4 space-y-3 text-sm text-content-muted">
                    {tamanhosDisponiveis.length > 0 ? (
                      <p>
                        Tamanhos cadastrados para esta peça: <strong className="text-content">{tamanhosDisponiveis.join(', ')}</strong>.
                      </p>
                    ) : (
                      <p>Esta peça ainda não tem tamanhos cadastrados como variantes.</p>
                    )}
                    <p>Para conferir o caimento, meça o busto na parte mais ampla, a cintura no ponto mais estreito e o quadril na parte mais larga, mantendo a fita métrica nivelada e sem apertar.</p>
                    <p className="border-t border-champagne/60 pt-3">
                      As medidas específicas da peça precisam ser informadas no cadastro do produto. Não use apenas a letra do tamanho como garantia de caimento; modelagens podem variar.
                    </p>
                  </div>
                </details>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <QuantitySelector
                  value={quantidade}
                  onChange={setQuantidade}
                  min={1}
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={precisaSelecionarVariante}
                  onClick={aoAdicionar}
                >
                  {adicionado ? (
                    <>
                      <Check size={20} /> Adicionado
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Comprar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    navigate('/orcamentos/novo', {
                      state: {
                        slug: produto.slug,
                        varianteId: varianteEfetiva?.id,
                        quantidade,
                      },
                    })
                  }
                >
                  <FileText size={18} /> Solicitar orçamento
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() =>
                    navigate(
                      atendimentoHref(
                        'produto',
                        produto.slug,
                      ),
                    )
                  }
                >
                  <MessageCircle size={18} /> Dúvida
                  sobre este produto
                </Button>
              </div>

              {/* Total da seleção: recalcula na
                  hora a cada mudança de quantidade
                  ou variante — sem precisar entrar
                  no carrinho. */}
              <p
                aria-live="polite"
                className="text-sm text-content-muted"
              >
                Total da seleção:{' '}
                {quantidade}{' '}
                {quantidade === 1 ? 'unidade' : 'unidades'}
                {' · '}
                <span className="font-display font-bold text-lg text-primary">
                  {formatPrice(precoUnitario * quantidade)}
                </span>
              </p>
            </div>
          </div>

          {/* ---------- DESCRIÇÃO (primeira tela, antes da compra) ---------- */}
          {produto.descricao && (
            <section
              className="mt-12 max-w-3xl"
              aria-labelledby="descricao-do-produto"
            >
              <h2
                id="descricao-do-produto"
                className="title-h2 mb-4"
              >
                Descrição
              </h2>
              <p className="body-angel-lg leading-relaxed">
                {produto.descricao}
              </p>
            </section>
          )}

          {/* ---------- HISTÓRIA ---------- */}
          {produto.historia && (
            <section
              className="mt-16 max-w-3xl"
              aria-labelledby="historia-do-produto"
            >
              <h2
                id="historia-do-produto"
                className="title-h2 mb-4"
              >
                A história do produto
              </h2>
              <p className="body-angel-lg leading-relaxed">
                {produto.historia}
              </p>
            </section>
          )}

          {/* ---------- COMO USAR / COMPOSIÇÃO / DETALHES ---------- */}
          {temDetalhes && (
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
              {produto.comoUsar && (
                <section className="surface-card p-6">
                  <h2 className="title-h3 mb-3">Como usar</h2>
                  <p className="body-angel">{produto.comoUsar}</p>
                </section>
              )}

              {produto.informacoes && (
                <section className="surface-card p-6">
                  <h2 className="title-h3 mb-3">
                    Informações e composição
                  </h2>
                  <p className="body-angel">{produto.informacoes}</p>
                </section>
              )}

              {produto.composicao.length > 0 && (
                <section className="surface-card p-6">
                  <h2 className="title-h3 mb-3">
                    Composto por
                  </h2>
                  <ul className="space-y-2">
                    {produto.composicao.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/produtos/${item.slug}`}
                          className="text-body text-content hover:text-primary"
                        >
                          {item.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="surface-card p-6">
                <h2 className="title-h3 mb-3">Detalhes</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-content-muted">Condição</dt>
                    <dd className="text-content">
                      {rotuloDisponibilidade(produto)}
                    </dd>
                  </div>
                  {sku && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className="text-content-muted">SKU</dt>
                      <dd className="text-content">{sku}</dd>
                    </div>
                  )}
                  {produto.fornecedor && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className="text-content-muted">Marca</dt>
                      <dd className="text-content">
                        {produto.fornecedor.nome}
                      </dd>
                    </div>
                  )}
                  {produto.categorias.length > 0 && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className="text-content-muted">Categorias</dt>
                      <dd className="text-right text-content">
                        {produto.categorias
                          .map((categoria) => categoria.nome)
                          .join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>
          )}

          {/* ---------- MIMOS + PRODUTOS RELACIONADOS ---------- */}
          <div className="mt-20">
            <ProdutoMimosRelacionados slug={produto.slug} />
          </div>

          <div className="mt-20">
            <ProdutoRelacionados slug={produto.slug} limit={4} />
          </div>

          {/* ---------- AGENDAMENTO / EXPERIÊNCIAS ---------- */}
          <section
            className="surface-card mt-20 overflow-hidden"
            aria-labelledby="experiencia-angel"
          >
            <div className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <p className="overline-angel mb-2">
                  <Sparkles size={14} className="mr-1 inline" />
                  Experiência Angel
                </p>
                <h2 id="experiencia-angel" className="title-h2">
                  Conheça pessoalmente
                </h2>
                <p className="mt-3 max-w-xl body-angel">
                  Agende um atendimento e viva a curadoria da
                  Angel com quem entende de beleza.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/agendamento')}
                >
                  <Calendar size={18} /> Agendar experiência
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/servicos')}
                >
                  Ver serviços
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
