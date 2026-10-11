import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { BrilhoShimmer } from '@/domains/home/components/BrilhoShimmer'
import {
  colunaEditorial,
  type ColunaEditorial,
} from '../model/editorial'

/**
 * Página de coluna editorial (/beleza, /maquiagem):
 * narrativa da coluna + cartões que levam ao
 * detalhe (/beleza/:slug, /maquiagem/:slug).
 */
function ColunaEditorialPage({
  coluna,
}: {
  coluna: ColunaEditorial
}) {
  const dados = colunaEditorial(coluna)

  return (
    <div>
      <SeoHead
        title={dados.titulo}
        description={dados.descricao}
        canonical={`/${coluna}`}
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: dados.rotulo, href: `/${coluna}` },
        ])}
      />

      <header className="section-angel bg-blush/40">
        <div className="container-angel max-w-3xl">
          <p className="overline-angel mb-3">{dados.overline}</p>
          <h1 className="title-h1">{dados.titulo}</h1>
          <p className="mt-4 text-body-lg text-content-muted">
            {dados.descricao}
          </p>
        </div>
      </header>

      <section className="section-angel">
        <div className="container-angel">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {dados.entries.map((entry) => (
              <article key={entry.slug} className="card-angel">
                <Link to={`/${coluna}/${entry.slug}`}>
                  <div className="relative">
                    <ImagemEditorial
                      src={entry.imagem}
                      alt={entry.titulo}
                      className="aspect-[4/3]"
                    />
                    <BrilhoShimmer />
                  </div>
                </Link>
                <div className="p-5">
                  <p className="overline-angel mb-2 text-champagne-dark">
                    {entry.chamada}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-content">
                    <Link to={`/${coluna}/${entry.slug}`}>
                      {entry.titulo}
                    </Link>
                  </h2>
                  <p className="mt-3 line-clamp-3 text-body text-content-muted">
                    {entry.narrativa}
                  </p>
                  <Link
                    to={`/${coluna}/${entry.slug}`}
                    className="mt-4 inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
                  >
                    Ler
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 surface-card flex flex-col items-center gap-4 p-10 text-center">
            <p className="overline-angel">Não perca</p>
            <h2 className="title-h2">
              Veja as experiências Angel
            </h2>
            <p className="max-w-xl text-body text-content-muted">
              Sessões, consultorias e momentos que
              transformam beleza em memória.
            </p>
            <Link to="/experiencias" className="btn-angel">
              Explorar experiências
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export function BelezaPage() {
  return <ColunaEditorialPage coluna="beleza" />
}

export function MaquiagemPage() {
  return <ColunaEditorialPage coluna="maquiagem" />
}
