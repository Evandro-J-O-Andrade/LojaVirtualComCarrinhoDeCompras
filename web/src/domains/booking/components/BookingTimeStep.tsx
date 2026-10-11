import { AlertCircle, CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/common/Button'
import type { AvailabilityState, TimeSlot } from '../model/availability'
import { formatTimeBR } from '../model/availability'

interface BookingTimeStepProps {
  availability: AvailabilityState | undefined
  selected: string | null
  onSelect: (slot: TimeSlot) => void
  onContact: () => void
}

export function BookingTimeStep({
  availability,
  selected,
  onSelect,
  onContact,
}: BookingTimeStepProps) {
  if (availability === undefined) {
    return (
      <div className="surface-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-champagne border-t-primary" />
          <p className="text-body text-content-muted">
            Calculando os horários disponíveis…
          </p>
        </div>
      </div>
    )
  }

  if (availability.kind === 'unknown') {
    return (
      <div className="surface-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-light">
          <AlertCircle size={32} className="text-primary" />
        </div>
        <h3 className="font-display font-bold text-xl text-content">
          Horários sob consulta
        </h3>
        <p className="mx-auto mt-2 max-w-md text-body text-content-muted">
          Não foi possível calcular os horários para esta data no momento.
          Nossa equipe confirma o horário durante o atendimento.
        </p>
        <Button variant="outline" className="mt-6" onClick={onContact}>
          Falar com o atendimento
        </Button>
      </div>
    )
  }

  if (availability.kind === 'unavailable') {
    return (
      <div className="surface-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-light">
          <CalendarX size={32} className="text-primary" />
        </div>
        <h3 className="font-display font-bold text-xl text-content">
          Sem horários nesta data
        </h3>
        <p className="mx-auto mt-2 max-w-md text-body text-content-muted">
          Todos os horários desta data já estão ocupados. Escolha outra data.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-body text-content-muted">
        Horários livres para a data selecionada:
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {availability.slots.map((slot) => (
          <button
            key={slot.inicio}
            type="button"
            onClick={() => onSelect(slot)}
            aria-pressed={selected === slot.inicio}
            className={cn(
              'rounded-xl border px-4 py-3 text-center font-medium transition-all',
              'focus-visible:ring-2 focus-visible:ring-primary',
              selected === slot.inicio
                ? 'border-primary bg-primary text-primary-contrast'
                : 'border-champagne bg-surface text-content hover:border-primary hover:text-primary',
            )}
          >
            {formatTimeBR(slot.inicio)}
          </button>
        ))}
      </div>
    </div>
  )
}
