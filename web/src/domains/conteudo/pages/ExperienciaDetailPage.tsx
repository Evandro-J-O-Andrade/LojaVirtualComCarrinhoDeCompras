import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { Badge } from '@/components/common/Badge'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { BrilhoShimmer } from '@/domains/home/components/BrilhoShimmer'
import { ProdutoGaleria } from '@/domains/produtos/components/ProdutoGaleria'
import { useExperiencia } from '../hooks/useExperiencias'
import { midiasDaExperiencia } from '../model/experiencia'

/**
 * /experiencias/:slug — experiência completa:
 * narrativa, galeria multi-imagem com zoom,
 * vídeo quando existir, lightbox, teclado e
 * swipe. Data e local só quando reais.
 */
export function ExperienciaDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: experiencia } = useExperiencia(slug)

  if (!experiencia) {
    return (
      <div>
        <SeoHead
          title="Experiência não encontrada"
          description="Experiência não encontrada no acervo da Angel."
          canonical="/experiencias"
          robots="noindex"
        />
        <section className="section-angel">
          <div className="container-angel max-w-xl text-center">
            <p className="overline-angel mb-3">
              Experiências
            </p>
            <h1 className="title-h1">
              Experiência não encontrada
            </h1>
            <p className="mt-4 text-body-lg text-content-muted">
              Esta experiência pode ter sido removida
              ou ainda não existe.
            </p>
            <Link to="/experiencias" className="btn-angel mt-8">
              <ArrowLeft size={18} />
              Voltar para experiências
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const midias = midiasDaExperiencia(experiencia)

  return (
    <div>
      <SeoHead
        title={experiencia.titulo}
        description={experiencia.chamada}
        canonical={`/experiencias/${experiencia.slug}`}
        ogImage={experiencia.capa}
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Experiências', href: '/experiencias' },
          {
            name: experiencia.titulo,
            href: `/experiencias/${experiencia.slug}`,
          },
        ])}
      />

      <header className="section-angel bg-blush/40">
        <div className="container-angel">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="overline-angel">
                Experiência
              </p>
              <h1 className="title-h1">
                {experiencia.titulo}
              </h1>
              <p className="text-body-lg text-content-muted">
                {experiencia.chamada}
              </p>
              <div className="flex flex-wrap gap-2">
                {experiencia.contextos.map((contexto) => (
                  <Badge key={contexto} variant="new">
                    {contexto}
                  </Badge>
                ))}
                {experiencia.data === null && (
                  <Badge variant="default">Em breve</Badge>
                )}
              </div>
              <p className="max-w-xl text-body text-content-muted">
                {experiencia.narrativa}
              </p>
              {experiencia.data !== null && (
                <p className="text-body-sm text-content-subtle">
                  {experiencia.data}
                  {experiencia.local
                    ? ` — ${experiencia.local}`
                    : ''}
                </p>
              )}
            </div>
            <div className="relative overflow-hidden rounded-4xl shadow-xl">
              <ImagemEditorial
                src={experiencia.capa}
                alt={experiencia.titulo}
                className="aspect-[4/3]"
              />
              <BrilhoShimmer />
            </div>
          </div>
        </div>
      </header>

      {midias.length > 0 && (
        <section className="section-angel">
          <div className="container-angel">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <ProdutoGaleria
                midias={midias}
                nome={experiencia.titulo}
              />
              <div className="space-y-6">
                <p className="overline-angel">
                  Galeria
                </p>
                <h2 className="title-h2">
                  Registros do acervo
                </h2>
                <p className="text-body text-content-muted">
                  Fotos reais do evento. Amplie com
                  o botão de zoom: pan, pinch e
                  fullscreen funcionam no teclado
                  e no toque.
                </p>
                {midias.length > 1 && (
                  <p className="text-body-sm text-content-subtle">
                    {midias.length}{' '}
                    {midias.length === 1
                      ? 'registro'
                      : 'registros'}
                    {experiencia.video
                      ? ', incluindo vídeo'
                      : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-angel bg-surface-alt/60">
        <div className="container-angel">
          <h2 className="title-h2 mb-6">
            Continue explorando
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/experiencias"
              className="card-angel group"
            >
              <div className="p-6">
                <p className="overline-angel text-champagne-dark">
                  Acervo
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-content">
                  Todas as experiências
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-primary transition-all group-hover:gap-3">
                  Ver galeria
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
            <Link to="/servicos" className="card-angel group">
              <div className="p-6">
                <p className="overline-angel text-champagne-dark">
                  Serviços
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-content">
                  Agende uma experiência
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-primary transition-all group-hover:gap-3">
                  Ver serviços
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
            <Link to="/agendamento" className="card-angel group">
              <div className="p-6">
                <p className="overline-angel text-champagne-dark">
                  Agendamento
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-content">
                  Marque o seu momento
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-primary transition-all group-hover:gap-3">
                  Agendar
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
