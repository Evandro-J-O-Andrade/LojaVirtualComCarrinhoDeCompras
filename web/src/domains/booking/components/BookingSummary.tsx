import type { AppointmentDraft } from '../model/appointment'
import type { Service } from '@/domains/services/model/service'
import { formatServiceDuration } from '@/domains/services/model/service'
import { ServicePrice } from '@/domains/services/components/ServicePrice'
import { formatDateBR, formatTimeBR } from '../model/availability'

interface BookingSummaryProps {
  service: Service | null
  draft: AppointmentDraft
}

export function BookingSummary({ service, draft }: BookingSummaryProps) {
  const profissional = draft.profissionalNome ?? 'A definir pelo atendimento'

  return (
    <div className="surface-card p-6">
      <h3 className="title-h3 mb-4">Resumo do agendamento</h3>
      <dl className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-body-sm text-content-muted">Serviço</dt>
          <dd className="text-right font-medium text-content">
            {service?.nome ?? '—'}
          </dd>
        </div>
        {service && formatServiceDuration(service.duracaoMinutos) && (
          <div className="flex items-start justify-between gap-4">
            <dt className="text-body-sm text-content-muted">Duração</dt>
            <dd className="text-right text-content">
              {formatServiceDuration(service.duracaoMinutos)}
            </dd>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <dt className="text-body-sm text-content-muted">Profissional</dt>
          <dd className="text-right text-content">{profissional}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-body-sm text-content-muted">Data</dt>
          <dd className="text-right text-content">
            {draft.data ? formatDateBR(draft.data) : 'A escolher'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-body-sm text-content-muted">Horário</dt>
          <dd className="text-right text-content">
            {draft.horarioInicio
              ? formatTimeBR(draft.horarioInicio)
              : 'A confirmar'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-body-sm text-content-muted">Preço</dt>
          <dd className="text-right">
            <ServicePrice preco={service?.preco ?? null} size="lg" />
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-champagne pt-4">
          <dt className="text-body-sm text-content-muted">Cliente</dt>
          <dd className="text-right text-content">
            {draft.contatoNome || '—'} · {draft.contatoTelefone || '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
