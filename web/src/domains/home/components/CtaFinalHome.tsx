import { Link } from 'react-router-dom'
import { ArrowRight, CalendarHeart, MessageCircle } from 'lucide-react'
import { CTA_FINAL } from '@/domains/institucional/model/marca'

/**
 * CTA final da Home: três portas reais — catálogo,
 * agendamento e atendimento. Sem número inventado:
 * "Falar com a equipe" aponta para /atendimento.
 */
export function CtaFinalHome() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-charcoal"
      />
      <div className="container-angel relative py-20 text-center md:py-24">
        <p className="overline-angel text-champagne">
          Angel Cosméticos
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl title-h1 text-cream">
          Pronta para o seu momento?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-cream/85">
          Explore a curadoria, agende uma experiência ou
          fale com quem entende de beleza.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to={CTA_FINAL.comprar.href} className="btn-angel !bg-cream !text-charcoal hover:!bg-white">
            {CTA_FINAL.comprar.rotulo}
            <ArrowRight size={18} />
          </Link>
          <Link
            to={CTA_FINAL.agendar.href}
            className="btn-angel inline-flex items-center justify-center gap-2 rounded-full border-2 border-cream/60 px-6 py-3 font-medium leading-none text-cream transition-all duration-300 ease-angel hover:bg-cream hover:text-charcoal"
          >
            <CalendarHeart size={18} />
            {CTA_FINAL.agendar.rotulo}
          </Link>
          <Link
            to={CTA_FINAL.equipe.href}
            className="btn-angel inline-flex items-center justify-center gap-2 rounded-full border border-cream/30 px-6 py-3 font-medium leading-none text-cream/90 transition-all duration-300 ease-angel hover:border-champagne hover:text-cream"
          >
            <MessageCircle size={18} />
            {CTA_FINAL.equipe.rotulo}
          </Link>
        </div>
      </div>
    </section>
  )
}
