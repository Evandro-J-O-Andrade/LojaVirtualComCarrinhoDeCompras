import { formatPrice } from '@/lib/utils'
import { SEO_DEFAULTS } from '@/lib/seo'

export type ServiceSource = 'supabase' | 'editorial'

export interface Service {
  id: string
  slug: string
  nome: string
  descricao: string | null
  duracaoMinutos: number | null
  preco: number | null
  imagemCapa: string | null
  video: string | null
  publicoAlvo: string | null
  preparacao: string | null
  requerAgendamento: boolean
  requerConfirmacao: boolean
  source: ServiceSource
}

export const SERVICE_IMAGE_FALLBACK = '/images/hero-beauty.jpg'

export function formatServiceDuration(minutos: number | null): string | null {
  if (minutos === null || minutos <= 0) return null
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`
}

export function servicePriceLabel(preco: number | null): string {
  return preco === null ? 'Sob consulta' : formatPrice(preco)
}

export type ServiceCtaKind = 'agendar' | 'sob-consulta' | 'atendimento-presencial'

export function resolveServiceCta(service: Service): ServiceCtaKind {
  if (!service.requerAgendamento) return 'atendimento-presencial'
  return service.preco === null ? 'sob-consulta' : 'agendar'
}

export function serviceTimeRequired(minutos: number | null): string | null {
  if (minutos === null || minutos <= 0) return null
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `PT${resto}M`
  return resto === 0 ? `PT${horas}H` : `PT${horas}H${resto}M`
}

export function serviceJsonLd(service: Service): Record<string, unknown> {
  const url = `${SEO_DEFAULTS.siteUrl}/servicos/${service.slug}`
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.nome,
    url,
    provider: {
      '@type': 'Organization',
      name: SEO_DEFAULTS.siteName,
      url: SEO_DEFAULTS.siteUrl,
    },
  }
  if (service.descricao) jsonLd.description = service.descricao
  if (service.imagemCapa) jsonLd.image = service.imagemCapa
  const timeRequired = serviceTimeRequired(service.duracaoMinutos)
  if (timeRequired) jsonLd.timeRequired = timeRequired
  if (service.preco !== null) {
    jsonLd.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'BRL',
      price: service.preco,
    }
  }
  return jsonLd
}
