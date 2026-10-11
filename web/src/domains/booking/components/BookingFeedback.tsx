import { CalendarClock, CheckCircle2, MessageCircle, RefreshCw } from 'lucide-react'
import type { BookingConfirmation } from '../model/appointment'
import { Button } from '@/components/common/Button'
import { formatDateBR, formatTimeBR } from '../model/availability'

interface BookingFeedbackProps {
  state: 'submitting' | 'confirmed' | 'error'
  confirmation: BookingConfirmation | null
  onRetry: () => void
  onNewBooking: () => void
  onContact: () => void
}

export function BookingFeedback({
  state,
  confirmation,
  onRetry,
  onNewBooking,
  onContact,
}: BookingFeedbackProps) {
  if (state === 'submitting') {
    return (
      <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-champagne border-t-primary" />
        <h2 className="title-h3 mt-6">Enviando sua solicitação…</h2>
        <p className="mt-2 max-w-md text-body text-content-muted">
          Validando o horário e criando seu agendamento.
        </p>
      </div>
    )
  }

  if (state === 'confirmed' && confirmation) {
    return (
      <div className="surface-card px-6 py-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 size={40} className="text-primary" />
        </div>
        <h2 className="title-h1 mt-6">
          {confirmation.status === 'confirmado'
            ? 'Agendamento confirmado'
            : 'Agendamento solicitado'}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-body text-content-muted">
          {confirmation.status === 'confirmado'
            ? 'Seu horário já está garantido. Até breve!'
            : 'Sua solicitação foi registrada com o protocolo abaixo. Nossa equipe confirma o horário em breve.'}
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-champagne bg-surface-alt p-6">
          <p className="overline-angel mb-1">Protocolo</p>
          <p className="font-mono text-2xl font-bold tracking-wider text-content">
            {confirmation.protocolo}
          </p>
          <dl className="mt-5 space-y-2 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-content-muted">Serviço</dt>
              <dd className="font-medium text-content">{confirmation.servicoNome}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-content-muted">Data</dt>
              <dd className="font-medium text-content">
                {formatDateBR(confirmation.data)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-content-muted">Horário</dt>
              <dd className="font-medium text-content">
                {formatTimeBR(confirmation.horarioInicio)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" onClick={onNewBooking}>
            Fazer novo agendamento
          </Button>
          <Button variant="outline" size="lg" onClick={onContact}>
            <MessageCircle size={18} />
            Falar com o atendimento
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-champagne-light">
        <CalendarClock size={40} className="text-primary" />
      </div>
      <h2 className="title-h2 mt-6">Solicitação indisponível no momento</h2>
      <p className="mx-auto mt-3 max-w-md text-body text-content-muted">
        Não foi possível enviar sua solicitação de agendamento online agora.
        Nossa equipe confirma seu horário pelo atendimento.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button variant="primary" size="lg" onClick={onRetry}>
          <RefreshCw size={18} />
          Tentar novamente
        </Button>
        <Button variant="outline" size="lg" onClick={onContact}>
          <MessageCircle size={18} />
          Falar com o atendimento
        </Button>
      </div>
    </div>
  )
}
