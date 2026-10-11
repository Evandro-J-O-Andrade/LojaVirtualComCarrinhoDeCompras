import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { BrilhoShimmer } from '@/domains/home/components/BrilhoShimmer'
import {
  CTA_FINAL,
  HISTORIA_MARCA,
  MOMENTO_ANGEL,
  MOMENTOS_MARCA,
} from '../model/marca'

/**
 * Sobre a ANGEL — a casa, a história e os
 * valores. Conteúdo institucional real,
 * imagens do patrimônio.
 */
export function SobrePage() {
  return (
    <div>
      <SeoHead
        title="Sobre a ANGEL"
        description="Conheça a história da ANGEL Cosméticos: curadoria de beleza com rigor, atendimento humano e nada de artificial."
        canonical="/sobre"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Sobre', href: '/sobre' },
        ])}
      />

      <header className="section-angel">
        <div className="container-angel max-w-3xl">
          <p className="overline-angel mb-3">A casa</p>
          <h1 className="title-h1">Sobre a ANGEL</h1>
          <p className="mt-4 text-body-lg text-content-muted">
            Nascemos da crença de que a beleza é um ato de
            empoderamento. Cada produto é cuidadosamente
            selecionado para celebrar a mulher que somos:
            forte, elegante e indispensável.
          </p>
        </div>
      </header>

      <section className="section-angel-tight bg-blush/40">
        <div className="container-angel">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-4xl shadow-xl">
              <ImagemEditorial
                src={MOMENTO_ANGEL.imagem}
                alt={MOMENTO_ANGEL.titulo}
                className="aspect-[4/5]"
              />
              <BrilhoShimmer />
            </div>
            <div className="space-y-5">
              <p className="overline-angel">O momento</p>
              <h2 className="title-h2">{MOMENTO_ANGEL.titulo}</h2>
              <p className="text-body-lg text-content-muted">
                {MOMENTO_ANGEL.narrativa}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-angel">
        <div className="container-angel">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="overline-angel">Nossa história</p>
              <h2 className="title-h2">{HISTORIA_MARCA.titulo}</h2>
              <div className="space-y-4">
                {HISTORIA_MARCA.paragrafos.map((paragrafo) => (
                  <p
                    key={paragrafo}
                    className="text-body text-content-muted"
                  >
                    {paragrafo}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-4xl shadow-xl">
              <ImagemEditorial
                src={HISTORIA_MARCA.imagem}
                alt={HISTORIA_MARCA.titulo}
                className="aspect-[4/5]"
              />
              <BrilhoShimmer />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HISTORIA_MARCA.valores.map((valor) => (
              <article key={valor.rotulo} className="surface-card p-6">
                <h3 className="title-h3">{valor.rotulo}</h3>
                <p className="mt-3 text-body text-content-muted">
                  {valor.descricao}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-angel bg-surface-alt/60">
        <div className="container-angel">
          <div className="mb-10 max-w-2xl">
            <p className="overline-angel mb-2">O que fazemos</p>
            <h2 className="title-h2">
              Cuidar, ritual e presentear
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {MOMENTOS_MARCA.map((momento) => (
              <article key={momento.rotulo} className="surface-card p-6">
                <p className="overline-angel mb-3 text-champagne-dark">
                  {momento.rotulo}
                </p>
                <h3 className="title-h3">{momento.titulo}</h3>
                <p className="mt-3 text-body text-content-muted">
                  {momento.descricao}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-charcoal"
        />
        <div className="container-angel relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl title-h1 text-cream">
            Venha conhecer a Angel
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-cream/85">
            Explore a curadoria, agende uma experiência ou
            fale com quem entende de beleza.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={CTA_FINAL.comprar.href}
              className="btn-angel !bg-cream !text-charcoal hover:!bg-white"
            >
              {CTA_FINAL.comprar.rotulo}
              <ArrowRight size={18} />
            </Link>
            <Link
              to={CTA_FINAL.agendar.href}
              className="btn-angel inline-flex items-center justify-center gap-2 rounded-full border-2 border-cream/60 px-6 py-3 font-medium leading-none text-cream transition-all duration-300 ease-angel hover:bg-cream hover:text-charcoal"
            >
              {CTA_FINAL.agendar.rotulo}
            </Link>
            <Link
              to={CTA_FINAL.equipe.href}
              className="btn-angel inline-flex items-center justify-center gap-2 rounded-full border border-cream/30 px-6 py-3 font-medium leading-none text-cream/90 transition-all duration-300 ease-angel hover:border-champagne hover:text-cream"
            >
              {CTA_FINAL.equipe.rotulo}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
