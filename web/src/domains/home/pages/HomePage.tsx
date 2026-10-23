import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SeoHead, organizationJsonLd } from '@/lib/seo'
import { cn, formatPrice } from '@/lib/utils'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { useProdutos } from '@/domains/produtos/hooks/useProdutos'
import { ProdutoCard } from '@/domains/produtos/components/ProdutoCard'
import {
  imagemOuFallback,
  precoBase,
  precoOfertado,
  temPromocaoValida,
  type Produto,
} from '@/domains/produtos/model/produto'
import { useMimos } from '@/domains/mimos/hooks/useMimos'
import { MimoVitrineGrid } from '@/domains/mimos/components/MimoVitrineGrid'
import {
  MIMO_CONTEXTOS,
  type MimoContexto,
} from '@/domains/mimos/model/mimo'
import { useServices } from '@/domains/services/hooks/useServices'
import {
  formatServiceDuration,
  servicePriceLabel,
} from '@/domains/services/model/service'
import { HeroCinematico } from '../components/HeroCinematico'
import { MomentoAngel } from '../components/MomentoAngel'
import { ExperienciaAngel } from '../components/ExperienciaAngel'
import { HistoriaMarca } from '../components/HistoriaMarca'
import { CtaFinalHome } from '../components/CtaFinalHome'

/**
 * Home — vitrine da marca.
 *
 * Composição editorial, não grid infinito:
 * hero cinematográfico, momento da marca,
 * mimos diários, destaque curado, beleza e
 * maquiagem, serviços, experiência em vídeo,
 * ocasiões, história e CTA final.
 */
export function HomePage() {
  return (
    <div>
      <SeoHead
        title="ANGEL Cosméticos — Beleza, Maquiagem e Experiência"
        description="Curadoria de beleza, maquiagem e experiência. Produtos selecionados com rigor para transformar o seu dia em ritual."
        ogType="website"
        jsonLd={organizationJsonLd()}
      />

      <HeroCinematico />
      <MomentoAngel />
      <MimosDiarios />
      <ProdutosDestaque />
      <BelezaEMaquiagem />
      <ServicosHome />
      <ExperienciaAngel />
      <OcasioesHome />
      <HistoriaMarca />
      <CtaFinalHome />
    </div>
  )
}

/* ---------- Mimos Diários ---------- */

function MimosDiarios() {
  const {
    data: mimos,
    isLoading,
    error,
    refetch,
  } = useMimos()

  return (
    <section className="section-angel bg-surface-alt/60">
      <div className="container-angel">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="overline-angel mb-2">
              Mimos diários
            </p>
            <h2 className="title-h2">
              Curadorias para o seu dia
            </h2>
            <p className="mt-2 text-body-lg text-content-muted">
              Cuidar, ritual e presentear — composições
              selecionadas para cada momento.
            </p>
          </div>
          <Link
            to="/mimos"
            className="hidden items-center gap-2 font-medium text-primary transition-all hover:gap-3 md:inline-flex"
          >
            Ver todas
            <ArrowRight size={18} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingGrid count={3} columns={3} />
        ) : error ? (
          <ErrorState
            message="Não foi possível carregar os mimos."
            onRetry={() => refetch()}
          />
        ) : (
          <MimoVitrineGrid mimos={mimos ?? []} />
        )}
      </div>
    </section>
  )
}

/* ---------- Produtos em destaque ---------- */

function ProdutosDestaque() {
  const {
    data: produtos,
    isLoading,
    error,
    refetch,
  } = useProdutos()

  const destaque = produtos?.[0]
  const demais = produtos?.slice(1, 4) ?? []

  return (
    <section className="section-angel">
      <div className="container-angel">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="overline-angel mb-2">
              Em destaque
            </p>
            <h2 className="title-h2">
              Produtos em destaque
            </h2>
            <p className="mt-2 text-body-lg text-content-muted">
              A curadoria da casa, escolhida a dedo.
            </p>
          </div>
          <Link
            to="/produtos"
            className="hidden items-center gap-2 font-medium text-primary transition-all hover:gap-3 md:inline-flex"
          >
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingGrid count={4} columns={3} />
        ) : error ? (
          <ErrorState
            message="Não foi possível carregar os produtos."
            onRetry={() => refetch()}
          />
        ) : !destaque ? (
          <div className="surface-card px-6 py-16 text-center">
            <h3 className="font-display text-2xl font-semibold text-content">
              Nenhum produto em destaque
            </h3>
            <p className="mx-auto mt-3 max-w-md text-body text-content-muted">
              No momento não temos produtos para
              exibir. Volte em breve.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ProdutoDestaqueBanner produto={destaque} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {demais.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ProdutoDestaqueBanner({
  produto,
}: {
  produto: Produto
}) {
  const base = precoBase(produto)
  const ofertado = precoOfertado(produto)
  const comDesconto = temPromocaoValida(produto) && ofertado < base
  const categoria = produto.categorias[0]

  return (
    <article className="card-angel grid grid-cols-1 overflow-hidden lg:grid-cols-2">
      <Link
        to={`/produtos/${produto.slug}`}
        className="relative block"
        aria-label={`Ver fotos de ${produto.nome}`}
        tabIndex={-1}
      >
        <ImagemEditorial
          src={imagemOuFallback(produto)}
          alt={produto.nome}
          className="aspect-[4/3] lg:aspect-auto lg:h-full"
        />
        {categoria && (
          <span className="absolute left-4 top-4 rounded-full bg-surface/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-content">
            {categoria.nome}
          </span>
        )}
      </Link>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <p className="overline-angel mb-3 text-champagne-dark">
          Escolha da casa
        </p>
        <h3 className="title-h2">{produto.nome}</h3>
        {produto.beneficio && (
          <p className="mt-4 text-body-lg text-content-muted">
            {produto.beneficio}
          </p>
        )}
        <div className="mt-6 flex items-baseline gap-3">
          <span
            className={cn(
              'font-display text-3xl font-bold',
              comDesconto ? 'text-error' : 'text-primary',
            )}
          >
            {formatPrice(ofertado)}
          </span>
          {comDesconto && (
            <s className="text-lg text-content-subtle">
              {formatPrice(base)}
            </s>
          )}
        </div>
        <Link
          to={`/produtos/${produto.slug}`}
          className="btn-angel-subtle mt-8 inline-flex w-fit items-center gap-2 px-6 py-3"
        >
          Ver produto
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  )
}

/* ---------- Beleza & Maquiagem ---------- */

const PAINEIS_EDITORIAIS = [
  {
    coluna: 'beleza' as const,
    titulo: 'Beleza',
    descricao:
      'Cuidado com a pele e rotina — a base de tudo.',
    imagem: '/images/categoria-beleza.jpg',
    href: '/beleza',
  },
  {
    coluna: 'maquiagem' as const,
    titulo: 'Maquiagem',
    descricao:
      'Produção, cor e acabamento — com a sua assinatura.',
    imagem: '/assets/img/institucional/theLookJaneiro.jpg',
    href: '/maquiagem',
  },
]

function BelezaEMaquiagem() {
  return (
    <section className="section-angel-tight bg-blush/40">
      <div className="container-angel">
        <div className="mb-8">
          <p className="overline-angel mb-2">
            Universo Angel
          </p>
          <h2 className="title-h2">Beleza e maquiagem</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PAINEIS_EDITORIAIS.map((painel) => (
            <Link
              key={painel.coluna}
              to={painel.href}
              className="group relative overflow-hidden rounded-4xl shadow-xl"
            >
              <ImagemEditorial
                src={painel.imagem}
                alt={painel.titulo}
                className="aspect-[16/10] transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="overline-angel text-champagne">
                  {painel.coluna === 'beleza'
                    ? 'Cuidado e pele'
                    : 'Cor e produção'}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-cream">
                  {painel.titulo}
                </h3>
                <p className="mt-2 max-w-md text-body text-cream/80">
                  {painel.descricao}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-body font-medium text-cream transition-all group-hover:gap-3">
                  Explorar
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Serviços ---------- */

function ServicosHome() {
  const {
    data: servicos,
    isLoading,
    error,
    refetch,
  } = useServices()

  return (
    <section className="section-angel">
      <div className="container-angel">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="overline-angel mb-2">
              Serviços
            </p>
            <h2 className="title-h2">
              Experiência com atendimento
            </h2>
            <p className="mt-2 text-body-lg text-content-muted">
              Maquiagem, consultoria e cuidados —
              com a nossa equipe.
            </p>
          </div>
          <Link
            to="/servicos"
            className="hidden items-center gap-2 font-medium text-primary transition-all hover:gap-3 md:inline-flex"
          >
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingGrid count={3} columns={3} />
        ) : error ? (
          <ErrorState
            message="Não foi possível carregar os serviços."
            onRetry={() => refetch()}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(servicos ?? []).map((servico) => {
              const duracao = formatServiceDuration(
                servico.duracaoMinutos,
              )
              return (
                <article
                  key={servico.id}
                  className="card-angel"
                >
                  <Link to={`/servicos/${servico.slug}`}>
                    <ImagemEditorial
                      src={servico.imagemCapa}
                      alt={servico.nome}
                      className="aspect-[4/3]"
                    />
                  </Link>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-content">
                      <Link to={`/servicos/${servico.slug}`}>
                        {servico.nome}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-body text-content-muted">
                      {servico.descricao}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-body-sm">
                      <span className="font-medium text-primary">
                        {servicePriceLabel(servico.preco)}
                      </span>
                      {duracao && (
                        <span className="text-content-subtle">
                          {duracao}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Produtos por ocasião ---------- */

const OCASOES: Array<{
  contexto: MimoContexto
  imagem: string
  href: string
}> = [
  {
    contexto: 'cuidar',
    imagem: '/assets/img/produtos/galeria-2.jpg',
    href: '/mimos/cuidar',
  },
  {
    contexto: 'ritual',
    imagem: '/assets/img/produtos/galeria-3.jpg',
    href: '/mimos/ritual',
  },
  {
    contexto: 'presentear',
    imagem: '/assets/img/produtos/galeria-4.jpg',
    href: '/mimos/presentear',
  },
]

function OcasioesHome() {
  return (
    <section className="section-angel-tight">
      <div className="container-angel">
        <div className="mb-8">
          <p className="overline-angel mb-2">
            Por ocasião
          </p>
          <h2 className="title-h2">
            Para o momento que você vive
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {OCASOES.map((ocasiao) => {
            const momento = MIMO_CONTEXTOS[ocasiao.contexto]
            return (
              <Link
                key={ocasiao.contexto}
                to={ocasiao.href}
                className="group relative overflow-hidden rounded-4xl shadow-xl"
              >
                <ImagemEditorial
                  src={ocasiao.imagem}
                  alt={momento.rotulo}
                  className="aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="overline-angel text-champagne">
                    {momento.rotulo}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-cream">
                    {momento.chamada}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
