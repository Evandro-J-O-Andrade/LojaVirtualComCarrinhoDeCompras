import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import type { Service } from '../model/service'
import { SERVICE_IMAGE_FALLBACK, formatServiceDuration } from '../model/service'
import { ServicePrice } from './ServicePrice'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const duracao = formatServiceDuration(service.duracaoMinutos)

  return (
    <div className="card-angel group">
      <Link to={`/servicos/${service.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-sunken">
          <img
            src={service.imagemCapa || SERVICE_IMAGE_FALLBACK}
            alt={service.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {service.source === 'editorial' && (
            <div className="absolute left-3 top-3">
              <Badge variant="default">Em breve</Badge>
            </div>
          )}
          {duracao && (
            <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-content">
              {duracao}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="truncate font-display font-semibold text-xl text-content transition-colors group-hover:text-primary">
            {service.nome}
          </h3>
          {service.descricao && (
            <p className="mt-2 line-clamp-2 text-body-sm text-content-muted">
              {service.descricao}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <ServicePrice preco={service.preco} />
            <ArrowRight
              size={18}
              className="translate-x-0 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
            />
          </div>
        </div>
      </Link>
    </div>
  )
}
