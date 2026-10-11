import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { BrilhoShimmer } from '@/domains/home/components/BrilhoShimmer'
import {
  colunaEditorial,
  entryPorSlug,
  type ColunaEditorial,
} from '../model/editorial'

/**
 * Detalhe editorial (/beleza/:slug,
 * /maquiagem/:slug): narrativa
 * completa, imagem real e vídeo quando existir.
 */
function EditorialDetailPage({
  coluna,
}: {
  coluna: ColunaEditorial
}) {
  const { slug } = useParams<{ slug: string }>()
  const dados = colunaEditorial(coluna)
  const entry = slug ? entryPorSlug(coluna, slug) : undefined

  if (!entry) {
    return (
      <div>
        <SeoHead
          title="Página não encontrada"
          description={`Conteúdo não encontrado em ${dados.rotulo}.`}
          canonical={`/${coluna}`}
          robots="noindex"
        />
        <section className="section-angel">
          <div className="container-angel max-w-xl text-center">
            <p className="overline-angel mb-3">
              {dados.rotulo}
            </p>
            <h1 className="title-h1">
              Conteúdo não encontrado
            </h1>
            <p className="mt-4 text-body-lg text-content-muted">
              Esta página pode ter sido removida ou
              ainda não existe.
            </p>
            <Link to={`/${coluna}`} className="btn-angel mt-8">
              <ArrowLeft size={18} />
              Voltar para {dados.rotulo}
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <SeoHead
        title={entry.titulo}
        description={entry.chamada}
        canonical={`/${coluna}/${entry.slug}`}
        ogImage={entry.imagem}
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: dados.rotulo, href: `/${coluna}` },
          { name: entry.titulo, href: `/${coluna}/${entry.slug}` },
        ])}
      />

      <header className="section-angel bg-blush/40">
        <div className="container-angel max-w-3xl">
          <p className="overline-angel mb-3">{dados.overline}</p>
          <h1 className="title-h1">{entry.titulo}</h1>
          <p className="mt-4 text-body-lg text-content-muted">
            {entry.chamada}
          </p>
        </div>
      </header>

      <section className="section-angel">
        <div className="container-angel">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-body-lg leading-relaxed text-content-muted">
                {entry.narrativa}
              </p>
              <Link
                to={`/${coluna}`}
                className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
              >
                <ArrowLeft size={16} />
                Mais em {dados.rotulo}
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-4xl shadow-xl">
              <ImagemEditorial
                src={entry.imagem}
                alt={entry.titulo}
                className="aspect-[4/3]"
              />
              <BrilhoShimmer />
            </div>
          </div>

          {entry.video && (
            <figure className="mt-16 space-y-3">
              <div className="overflow-hidden rounded-4xl shadow-2xl">
                <video
                  controls
                  preload="metadata"
                  poster={entry.imagem}
                  className="aspect-video w-full bg-charcoal object-cover"
                  aria-label={entry.titulo}
                >
                  <source src={entry.video} type="video/mp4" />
                  Seu navegador não suporta vídeo.
                </video>
              </div>
              <figcaption className="text-body-sm text-content-subtle">
                {entry.titulo} — {dados.rotulo} Angel
              </figcaption>
            </figure>
          )}

          <div className="mt-16">
            <h2 className="title-h2 mb-6">
              Continue explorando
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {dados.entries
                .filter((item) => item.slug !== entry.slug)
                .map((item) => (
                  <Link
                    key={item.slug}
                    to={`/${coluna}/${item.slug}`}
                    className="card-angel group"
                  >
                    <div className="relative">
                      <ImagemEditorial
                        src={item.imagem}
                        alt={item.titulo}
                        className="aspect-[16/9]"
                      />
                      <BrilhoShimmer />
                    </div>
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p className="overline-angel text-champagne-dark">
                          {item.chamada}
                        </p>
                        <h3 className="mt-1 font-display text-xl font-semibold text-content">
                          {item.titulo}
                        </h3>
                      </div>
                      <ArrowRight
                        size={20}
                        className="text-primary transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function BelezaEditorialPage() {
  return <EditorialDetailPage coluna="beleza" />
}

export function MaquiagemEditorialPage() {
  return <EditorialDetailPage coluna="maquiagem" />
}
