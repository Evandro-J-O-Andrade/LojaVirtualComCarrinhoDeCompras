import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import type { Service } from '@/domains/services/model/service'
import {
  SERVICE_IMAGE_FALLBACK,
  formatServiceDuration,
} from '@/domains/services/model/service'
import { ServicePrice } from '@/domains/services/components/ServicePrice'

interface BookingServiceStepProps {
  services: Service[] | undefined
  isLoading: boolean
  selected: Service | null
  onSelect: (slug: string) => void
  onChange: () => void
}

export function BookingServiceStep({
  services,
  isLoading,
  selected,
  onSelect,
  onChange,
}: BookingServiceStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-surface-sunken" />
        ))}
      </div>
    )
  }

  if (selected) {
    return (
      <div className="surface-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
            <img
              src={selected.imagemCapa || SERVICE_IMAGE_FALLBACK}
              alt={selected.nome}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-xl text-content">
              {selected.nome}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-content-muted">
              <ServicePrice preco={selected.preco} />
              {formatServiceDuration(selected.duracaoMinutos) && (
                <span>· {formatServiceDuration(selected.duracaoMinutos)}</span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onChange}>
            Trocar
          </Button>
        </div>
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="surface-card px-6 py-16 text-center">
        <h3 className="font-display font-bold text-xl text-content">
          Nenhum serviço disponível
        </h3>
        <p className="mt-2 text-body text-content-muted">
          Volte mais tarde ou fale com nosso atendimento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-body text-content-muted">
        Escolha o serviço para começar o agendamento.
      </p>
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => onSelect(service.slug)}
          className="card-angel group flex w-full items-center gap-4 p-4 text-left"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
            <img
              src={service.imagemCapa || SERVICE_IMAGE_FALLBACK}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display font-semibold text-lg text-content">
              {service.nome}
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-content-muted">
              <ServicePrice preco={service.preco} />
              {formatServiceDuration(service.duracaoMinutos) && (
                <span>· {formatServiceDuration(service.duracaoMinutos)}</span>
              )}
            </div>
          </div>
          <ChevronRight
            size={18}
            className="shrink-0 text-content-subtle transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
          />
        </button>
      ))}
    </div>
  )
}
