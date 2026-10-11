import { HISTORIA_MARCA } from '@/domains/institucional/model/marca'
import { BrilhoShimmer } from './BrilhoShimmer'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'

/**
 * História / marca: narrativa institucional com
 * imagem real do acervo e os valores da casa.
 */
export function HistoriaMarca() {
  return (
    <section className="section-angel">
      <div className="container-angel">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-4xl shadow-xl">
            <ImagemEditorial
              src={HISTORIA_MARCA.imagem}
              alt={HISTORIA_MARCA.titulo}
              className="aspect-[4/5]"
            />
            <BrilhoShimmer />
          </div>
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
  )
}
