import { useNavigate, useParams, Link } from 'react-router-dom'
import { FileText, Gift, ShoppingBag } from 'lucide-react'
import { useMimo } from '../hooks/useMimos'
import { MimoKitComposicao } from '../components/MimoKitComposicao'
import { MimoPrecoPromocional } from '../components/MimoPrecoPromocional'
import { MimoListaSimples } from '../components/MimoListaSimples'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/common/Button'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { formatPrice } from '@/lib/utils'
import {
  MIMO_CONTEXTOS,
  MIMO_IMAGE_FALLBACK,
  mimoArticleJsonLd,
  mimoCtaHref,
  mimoPrecoBase,
  resolveMimoCta,
} from '../model/mimo'

export function MimoDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { data: mimo, isLoading, error, refetch } = useMimo(slug)

  if (isLoading) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="aspect-[3/4] animate-pulse rounded-3xl bg-surface-sunken" />
            <div className="space-y-4">
              <div className="h-4 w-20 animate-pulse rounded bg-surface-sunken" />
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
            message="Não foi possível carregar este mimo."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (!mimo) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-champagne-light">
              <Gift size={40} className="text-primary" />
            </div>
            <h1 className="title-h2">Mimo indisponível</h1>
            <p className="mt-3 max-w-md text-body text-content-muted">
              Este mimo não está disponível no momento ou foi descontinuado.
            </p>
            <Button
              variant="primary"
              className="mt-8"
              onClick={() => navigate('/mimos')}
            >
              Voltar para mimos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const titulo = mimo.titulo ?? mimo.nome
  const imagem = mimo.imagem || MIMO_IMAGE_FALLBACK
  const precoBase = mimoPrecoBase(mimo)
  const promocao = mimo.promocao
  const cta = resolveMimoCta(mimo)
  const ctaHref = mimoCtaHref(mimo)
  const contexto = mimo.contexto ? MIMO_CONTEXTOS[mimo.contexto] : null
  const comprar = cta === 'comprar'

  return (
    <div>
      <SeoHead
        title={titulo}
        description={
          mimo.descricao ?? `${titulo} — curadoria da ANGEL Cosméticos.`
        }
        canonical={`/mimos/${mimo.slug}`}
        ogImage={imagem}
        jsonLd={[
          mimoArticleJsonLd(mimo),
          breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Mimos', href: '/mimos' },
            { name: titulo, href: `/mimos/${mimo.slug}` },
          ]),
        ]}
      />

      <div className="section-angel-tight">
        <div className="container-angel">
          <nav className="mb-6 flex items-center gap-2 text-sm text-content-subtle">
            <Link to="/" className="hover:text-primary">
              Início
            </Link>
            <span>/</span>
            <Link to="/mimos" className="hover:text-primary">
              Mimos
            </Link>
            <span>/</span>
            <span className="truncate text-content">{titulo}</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface-sunken">
                <img
                  src={imagem}
                  alt={titulo}
                  className="h-full w-full object-cover"
                />
              </div>
              {mimo.video && (
                <div className="mt-4 overflow-hidden rounded-3xl bg-surface-sunken">
                  <video
                    src={mimo.video}
                    poster={imagem}
                    controls
                    preload="metadata"
                    className="aspect-video w-full"
                  >
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {contexto && <p className="overline-angel">{contexto.chamada}</p>}
              <h1 className="title-h1">{titulo}</h1>

              <div className="flex flex-wrap items-center gap-4">
                {promocao && precoBase !== null ? (
                  <MimoPrecoPromocional
                    precoBase={precoBase}
                    promocao={promocao}
                  />
                ) : precoBase !== null ? (
                  <span className="font-display font-bold text-3xl text-primary">
                    {formatPrice(precoBase)}
                  </span>
                ) : (
                  <span className="font-display font-bold text-3xl text-content-subtle">
                    Sob consulta
                  </span>
                )}
              </div>

              {mimo.descricao && <p className="body-angel">{mimo.descricao}</p>}

              {mimo.kit && mimo.kit.composicao.length > 0 && (
                <div className="surface-card p-6">
                  <h2 className="title-h3 mb-3">Composição do kit</h2>
                  <MimoKitComposicao composicao={mimo.kit.composicao} />
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate(ctaHref)}
              >
                {comprar ? <ShoppingBag size={20} /> : <FileText size={20} />}
                {comprar ? 'Comprar' : 'Solicitar orçamento'}
              </Button>
            </div>
          </div>

          {mimo.produtos.length > 0 && (
            <div className="mt-14">
              <MimoListaSimples
                titulo="Produtos desta curadoria"
                itens={mimo.produtos}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
