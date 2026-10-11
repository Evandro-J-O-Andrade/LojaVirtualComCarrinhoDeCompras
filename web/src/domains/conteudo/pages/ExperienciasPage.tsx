import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useExperiencias } from '../hooks/useExperiencias'
import { ExperienciaGaleria } from '../components/ExperienciaGaleria'

/**
 * /experiencias — galeria de eventos e
 * experiências reais. Nada de evento
 * fictício: o que não tem foto real
 * não entra na galeria.
 */
export function ExperienciasPage() {
  const { data: experiencias } = useExperiencias()

  return (
    <div>
      <SeoHead
        title="Experiências"
        description="Eventos e experiências reais da Angel Cosméticos: sessões, encontros e campanhas do acervo."
        canonical="/experiencias"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Experiências', href: '/experiencias' },
        ])}
      />

      <header className="section-angel bg-blush/40">
        <div className="container-angel max-w-3xl">
          <p className="overline-angel mb-3">
            Experiências
          </p>
          <h1 className="title-h1">
            Momentos que aconteceram
          </h1>
          <p className="mt-4 text-body-lg text-content-muted">
            Eventos, encontros e campanhas reais da
            Angel — registrados no acervo. Sem data
            confirmada, a experiência entra como
            <em> em breve</em>: nunca inventamos um
            calendário.
          </p>
        </div>
      </header>

      <section className="section-angel">
        <div className="container-angel">
          <ExperienciaGaleria experiencias={experiencias} />
        </div>
      </section>
    </div>
  )
}
