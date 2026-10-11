import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { CalendarOff } from 'lucide-react'
import { useService } from '../hooks/useServices'
import { ServiceMedia } from '../components/ServiceMedia'
import { ServiceCta } from '../components/ServiceCta'
import { ServicePrice } from '../components/ServicePrice'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/common/Button'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import {
  SERVICE_IMAGE_FALLBACK,
  formatServiceDuration,
  serviceJsonLd,
} from '../model/service'

export function ServiceDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { data: servico, isLoading, error, refetch } = useService(slug)

  if (isLoading) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="aspect-[4/3] animate-pulse rounded-3xl bg-surface-sunken" />
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
            message="Não foi possível carregar este serviço."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (!servico) {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-champagne-light">
              <CalendarOff size={40} className="text-primary" />
            </div>
            <h1 className="title-h2">Serviço indisponível</h1>
            <p className="mt-3 max-w-md text-body text-content-muted">
              Este serviço não está disponível no momento ou foi descontinuado.
            </p>
            <Button
              variant="primary"
              className="mt-8"
              onClick={() => navigate('/servicos')}
            >
              Voltar para serviços
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const duracao = formatServiceDuration(servico.duracaoMinutos)
  const imagem = servico.imagemCapa || SERVICE_IMAGE_FALLBACK

  return (
    <div>
      <SeoHead
        title={servico.nome}
        description={
          servico.descricao ||
          `${servico.nome} — serviço de beleza da ANGEL Cosméticos.`
        }
        canonical={`/servicos/${servico.slug}`}
        ogImage={imagem}
        jsonLd={[
          serviceJsonLd(servico),
          breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Serviços', href: '/servicos' },
            { name: servico.nome, href: `/servicos/${servico.slug}` },
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
            <Link to="/servicos" className="hover:text-primary">
              Serviços
            </Link>
            <span>/</span>
            <span className="truncate text-content">{servico.nome}</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <ServiceMedia service={servico} />

            <div className="space-y-6">
              <p className="overline-angel">Serviço</p>
              <h1 className="title-h1">{servico.nome}</h1>

              <div className="flex flex-wrap items-center gap-4">
                <ServicePrice preco={servico.preco} size="lg" />
                {duracao && (
                  <span className="rounded-full border border-champagne px-3 py-1 text-sm font-medium text-content">
                    {duracao}
                  </span>
                )}
              </div>

              {servico.descricao && (
                <p className="body-angel">{servico.descricao}</p>
              )}

              <ServiceCta service={servico} />
            </div>
          </div>

          {(servico.publicoAlvo || servico.preparacao) && (
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {servico.publicoAlvo && (
                <div className="surface-card p-6">
                  <h2 className="title-h3 mb-3">Para quem</h2>
                  <p className="body-angel">{servico.publicoAlvo}</p>
                </div>
              )}
              {servico.preparacao && (
                <div className="surface-card p-6">
                  <h2 className="title-h3 mb-3">Preparação</h2>
                  <p className="body-angel">{servico.preparacao}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
