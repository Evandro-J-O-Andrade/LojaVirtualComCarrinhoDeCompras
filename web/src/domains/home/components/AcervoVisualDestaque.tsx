import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const DESTAQUES = [
  { src: '/assets/img/beleza/AVON_BATOM_POWER_STAY_16H_01.webp', alt: 'Batom Avon Power Stay' },
  { src: '/assets/img/beleza/EUDORA_BASE_DAILY_TINT_30ML_01.webp', alt: 'Base Eudora Daily Tint' },
  { src: '/assets/img/beleza/MARY_KAY_CREME_DIURNO_01.webp', alt: 'Creme diurno Mary Kay' },
  { src: '/assets/img/casa/CAMA_JOGO_CAMA_CASAL_200_FIOS.webp', alt: 'Jogo de cama casal' },
]

export function AcervoVisualDestaque() {
  return (
    <section className="section-angel-tight">
      <div className="container-angel">
        <div className="grid items-center gap-8 rounded-3xl border border-border bg-surface-alt/60 p-5 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="overline-angel mb-2">Novidades no acervo</p>
            <h2 className="title-h2">Um universo de imagens para descobrir</h2>
            <p className="mt-3 text-body text-content-muted">Explore o acervo visual organizado por finalidade. As imagens ficam disponíveis para curadoria sem criar vínculos fictícios com produtos do catálogo.</p>
            <Link to="/acervo-visual" className="btn-angel-subtle mt-5 inline-flex items-center gap-2">Explorar acervo <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {DESTAQUES.map((imagem) => <div key={imagem.src} className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-surface p-2"><img src={imagem.src} alt={imagem.alt} loading="lazy" decoding="async" className="h-full w-full object-contain" /></div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
