import {
  EXPERIENCIA_ANGEL,
} from '@/domains/institucional/model/marca'

/**
 * Experiência Angel: vídeo real do acervo com
 * capa real e narrativa. O vídeo não autoplay:
 * o usuário escolhe assistir.
 */
export function ExperienciaAngel() {
  return (
    <section className="section-angel bg-charcoal">
      <div className="container-angel">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="overline-angel text-champagne">
              Experiência
            </p>
            <h2 className="title-h2 text-cream">
              {EXPERIENCIA_ANGEL.titulo}
            </h2>
            <p className="text-body-lg text-cream/80">
              {EXPERIENCIA_ANGEL.narrativa}
            </p>
          </div>
          <figure className="space-y-3">
            <div className="overflow-hidden rounded-4xl shadow-2xl">
              <video
                controls
                preload="metadata"
                poster={EXPERIENCIA_ANGEL.imagem}
                className="aspect-video w-full bg-charcoal object-cover"
                aria-label={EXPERIENCIA_ANGEL.titulo}
              >
                <source
                  src={EXPERIENCIA_ANGEL.video}
                  type="video/mp4"
                />
                Seu navegador não suporta vídeo.
              </video>
            </div>
            <figcaption className="text-body-sm text-cream/60">
              Sessão de maquiagem no espaço Angel —
              atendimento personalizado, do diagnóstico
              à finalização.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
