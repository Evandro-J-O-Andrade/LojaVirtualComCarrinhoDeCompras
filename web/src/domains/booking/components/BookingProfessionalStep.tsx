import { CalendarOff, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/common/Button'
import type { ProfessionalPick, ServiceProfessionalLink } from '../model/appointment'

interface BookingProfessionalStepProps {
  linkage: ServiceProfessionalLink | undefined
  selectedId: string | null
  onSelect: (professional: ProfessionalPick) => void
  onContact: () => void
}

export function BookingProfessionalStep({
  linkage,
  selectedId,
  onSelect,
  onContact,
}: BookingProfessionalStepProps) {
  if (linkage === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-surface-sunken" />
        ))}
      </div>
    )
  }

  if (linkage.kind === 'unknown') {
    return (
      <div className="surface-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-champagne-light">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-xl text-content">
              Profissional a definir
            </h3>
            <p className="mt-2 text-body text-content-muted">
              Nossa equipe escolhe o profissional ideal para o seu serviço e
              confirma durante o atendimento.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (linkage.professionals.length === 0) {
    return (
      <div className="surface-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-light">
          <CalendarOff size={32} className="text-primary" />
        </div>
        <h3 className="font-display font-bold text-xl text-content">
          Sem profissional habilitado
        </h3>
        <p className="mx-auto mt-2 max-w-md text-body text-content-muted">
          Este serviço não tem profissional disponível para agendamento no
          momento.
        </p>
        <Button variant="outline" className="mt-6" onClick={onContact}>
          Falar com o atendimento
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-body text-content-muted">
        Escolha o profissional que fará o atendimento.
      </p>
      {linkage.professionals.map((professional) => (
        <button
          key={professional.id}
          type="button"
          onClick={() => onSelect(professional)}
          aria-pressed={selectedId === professional.id}
          className={cn(
            'card-angel flex w-full items-center gap-4 p-4 text-left',
            selectedId === professional.id && 'ring-2 ring-primary',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne-light">
            <User size={20} className="text-primary" />
          </div>
          <span className="flex-1 font-display font-semibold text-lg text-content">
            {professional.nome}
          </span>
          {selectedId === professional.id && (
            <span className="text-sm font-medium text-primary">Selecionado</span>
          )}
        </button>
      ))}
    </div>
  )
}
