import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrilhoShimmer } from './BrilhoShimmer'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'

const HERO_IMAGEM = '/images/hero-beauty.jpg'

interface Campanha {
  id: string
  titulo: string
  descricao: string
  imagem: string
  imagemAlt: string
  cta: { rotulo: string; to: string }
}

/**
 * Campanhas da hero — todas com mídia real do
 * patrimônio. Nenhuma imagem inventada: são
 * fotos de produto/galeria/evento já existentes.
 */
const CAMPANHAS: Campanha[] = [
  {
    id: 'ritual',
    titulo: 'Seu momento de beleza',
    descricao:
      'Cuide de você com produtos escolhidos para transformar o seu dia em ritual.',
    imagem: '/images/hero-beauty.jpg',
    imagemAlt:
      'Composição de beleza com produtos da curadoria Angel',
    cta: { rotulo: 'Explorar produtos', to: '/produtos' },
  },
  {
    id: 'mimos',
    titulo: 'Pequenos detalhes que importam',
    descricao:
      'Cuidar, ritual e presentear — composições selecionadas para cada momento do seu dia.',
    imagem: '/assets/img/galeria-2.jpg',
    imagemAlt: 'Mimo Angel em composição editorial',
    cta: { rotulo: 'Descobrir mimos', to: '/mimos' },
  },
  {
    id: 'experiencia',
    titulo: 'Beleza também é viver',
    descricao:
      'Atendimento, produção e encontros — a Angel também é presença.',
    imagem: '/assets/img/evento1.jpeg',
    imagemAlt: 'Evento de beleza Angel',
    cta: { rotulo: 'Agendar experiência', to: '/agendamento' },
  },
]

const INTERVALO_MS = 6500

/**
 * Hero cinematográfico da Home.
 *
 * Estrutura (referência: hero split da J&S,
 * adaptada para a Angel):
 * - fundo cinematográfico FIXO — a atmosfera
 *   não troca a cada slide;
 * - texto e mídia são atores independentes:
 *   entram de lados opostos e alternam de lado
 *   a cada campanha;
 * - autoplay com pausa em hover/foco, setas,
 *   indicadores e teclado;
 * - reduced-motion: sem autoplay e sem animações.
 */
export function HeroCinematico() {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [reduzMovimento, setReduzMovimento] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      )?.matches ??
        false),
  )

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const aoMudar = () => setReduzMovimento(media.matches)
    media.addEventListener('change', aoMudar)
    return () => media.removeEventListener('change', aoMudar)
  }, [])

  useEffect(() => {
    if (pausado || reduzMovimento || CAMPANHAS.length < 2)
      return
    const id = setInterval(
      () => setIndice((atual) => (atual + 1) % CAMPANHAS.length),
      INTERVALO_MS,
    )
    return () => clearInterval(id)
  }, [pausado, reduzMovimento])

  /** Paridade define de que lado cada ator entra. */
  const par = indice % 2 === 0

  const irPara = (novo: number) =>
    setIndice(((novo % CAMPANHAS.length) + CAMPANHAS.length) % CAMPANHAS.length)

  const aoTeclado = (evento: React.KeyboardEvent) => {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      irPara(indice - 1)
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      irPara(indice + 1)
    }
  }

  return (
    <section
      role="region"
      aria-label="Destaques da casa"
      aria-roledescription="carrossel"
      tabIndex={0}
      onKeyDown={aoTeclado}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className="relative flex min-h-[calc(100dvh-var(--header-h))] items-center overflow-hidden bg-charcoal outline-none"
    >
      {/* ---------- FUNDO CINEMATOGRÁFICO FIXO ---------- */}
      <div className="absolute inset-0" aria-hidden="true">
        <ImagemEditorial
          src={HERO_IMAGEM}
          alt=""
          prioridade
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/55 to-charcoal/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/40" />
        <BrilhoShimmer />
      </div>

      <div className="container-angel relative grid flex-1 items-center gap-12 py-20 lg:grid-cols-2">
        {/* ---------- PAINEL EDITORIAL (texto) ---------- */}
        <div
          className={cn(
            'space-y-6',
            !par && 'lg:order-2',
          )}
        >
          <p className="overline-angel text-champagne">
            Angel Cosméticos
          </p>

          <div className="min-h-[15rem] lg:min-h-[17rem]">
            {CAMPANHAS.map((c, i) =>
              i === indice ? (
                <div
                  key={c.id}
                  className={cn(
                    'space-y-5',
                    par
                      ? 'animate-hero-panel-in'
                      : 'animate-hero-panel-in-alt',
                  )}
                >
                  <h1 className="font-display text-display font-semibold leading-[1.02] text-cream">
                    {c.titulo}
                  </h1>
                  <p className="max-w-xl text-body-lg text-cream/85">
                    {c.descricao}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link to={c.cta.to} className="btn-angel">
                      {c.cta.rotulo}
                      <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/sobre"
                      className="btn-angel inline-flex items-center justify-center gap-2 rounded-full border-2 border-cream/60 px-6 py-3 font-medium leading-none text-cream transition-all duration-300 ease-angel hover:bg-cream hover:text-charcoal"
                    >
                      Conheça a ANGEL
                    </Link>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>

        {/* ---------- MÍDIA EDITORIAL ---------- */}
        <div className={cn('relative', par || 'lg:order-1')}>
          {CAMPANHAS.map((c, i) =>
            i === indice ? (
              <figure
                key={c.id}
                className={cn(
                  'relative overflow-hidden rounded-4xl shadow-2xl',
                  par
                    ? 'animate-hero-media-in'
                    : 'animate-hero-media-in-alt',
                )}
              >
                <ImagemEditorial
                  src={c.imagem}
                  alt={c.imagemAlt}
                  prioridade={i === 0}
                  className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5]"
                  imgClassName="animate-hero-kenburns"
                />
              </figure>
            ) : null,
          )}
        </div>
      </div>

      {/* ---------- CONTROLES ---------- */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={() => irPara(indice - 1)}
          aria-label="Campanha anterior"
          className="btn-angel-icon !h-11 !w-11 !bg-charcoal/60 text-cream backdrop-blur-sm hover:!bg-charcoal/80"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Campanhas"
        >
          {CAMPANHAS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Campanha: ${c.titulo}`}
              aria-current={i === indice ? 'true' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-500 ease-angel',
                i === indice
                  ? 'w-8 bg-champagne'
                  : 'w-2 bg-cream/40 hover:bg-cream/70',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => irPara(indice + 1)}
          aria-label="Próxima campanha"
          className="btn-angel-icon !h-11 !w-11 !bg-charcoal/60 text-cream backdrop-blur-sm hover:!bg-charcoal/80"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  )
}
