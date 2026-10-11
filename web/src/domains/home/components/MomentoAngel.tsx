import {
  MOMENTO_ANGEL,
  MOMENTOS_MARCA,
} from '@/domains/institucional/model/marca'
import { BrilhoShimmer } from './BrilhoShimmer'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'

/**
 * Momento Angel: a narrativa da marca em duas
 * colunas — o que somos, com imagem real do
 * patrimônio e brilho controlado.
 */
export function MomentoAngel() {
  return (
    <section className="section-angel bg-blush/40">
      <div className="container-angel">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="overline-angel">O momento</p>
            <h2 className="title-h2">{MOMENTO_ANGEL.titulo}</h2>
            <p className="text-body-lg text-content-muted">
              {MOMENTO_ANGEL.narrativa}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-4xl shadow-xl">
            <ImagemEditorial
              src={MOMENTO_ANGEL.imagem}
              alt={MOMENTO_ANGEL.titulo}
              className="aspect-[4/3]"
            />
            <BrilhoShimmer />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {MOMENTOS_MARCA.map((momento) => (
            <article
              key={momento.rotulo}
              className="surface-card p-6"
            >
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
  )
}
