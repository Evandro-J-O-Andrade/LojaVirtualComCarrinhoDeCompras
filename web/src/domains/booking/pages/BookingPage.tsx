import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/utils'
import { useServices, useService } from '@/domains/services/hooks/useServices'
import { useServiceProfessionals } from '../hooks/useServiceProfessionals'
import { useAvailability } from '../hooks/useAvailability'
import { useCreateAppointment } from '../hooks/useAppointment'
import {
  emptyDraft,
  type AppointmentDraft,
  type BookingConfirmation,
} from '../model/appointment'
import {
  BOOKING_STEPS,
  BOOKING_STEP_LABELS,
  isCustomerStepComplete,
  professionalStepOutcome,
  stepIndex,
  timeStepOutcome,
  type BookingStepId,
} from '../model/booking-state'
import { BookingServiceStep } from '../components/BookingServiceStep'
import { BookingProfessionalStep } from '../components/BookingProfessionalStep'
import { BookingDateStep } from '../components/BookingDateStep'
import { BookingTimeStep } from '../components/BookingTimeStep'
import { atendimentoHref } from '@/domains/atendimento/model/atendimento'
import { BookingCustomerStep } from '../components/BookingCustomerStep'
import { BookingSummary } from '../components/BookingSummary'
import { BookingFeedback } from '../components/BookingFeedback'

export function BookingPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('servico')

  return (
    <div>
      <SeoHead
        title="Agendamento"
        description="Agende seu serviço de beleza na ANGEL Cosméticos: escolha o serviço, a data e confirme com nossa equipe."
        canonical="/agendamento"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Agendamento', href: '/agendamento' },
        ])}
      />
      <BookingWizard key={slug ?? 'selecione'} slug={slug} />
    </div>
  )
}

function Stepper({ current }: { current: BookingStepId }) {
  const atual = stepIndex(current)

  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {BOOKING_STEPS.map((stepId, index) => {
        const estado =
          index < atual ? 'concluida' : index === atual ? 'atual' : 'proxima'
        return (
          <li key={stepId} className="flex flex-1 items-center gap-1 sm:gap-2">
            <span
              aria-current={estado === 'atual' ? 'step' : undefined}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                estado === 'concluida' && 'bg-primary text-primary-contrast',
                estado === 'atual' && 'border-2 border-primary text-primary',
                estado === 'proxima' && 'border border-champagne text-content-subtle',
              )}
            >
              {estado === 'concluida' ? <Check size={16} /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm font-medium md:block',
                estado === 'atual' ? 'text-content' : 'text-content-subtle',
              )}
            >
              {BOOKING_STEP_LABELS[stepId]}
            </span>
            {index < BOOKING_STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1',
                  index < atual ? 'bg-primary' : 'bg-champagne',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ServiceUnavailable({ onBack }: { onBack: () => void }) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
      <h2 className="font-display font-bold text-2xl text-content">
        Serviço indisponível
      </h2>
      <p className="mt-2 max-w-md text-body text-content-muted">
        O serviço selecionado não está disponível para agendamento.
      </p>
      <Button variant="outline" className="mt-6" onClick={onBack}>
        Escolher outro serviço
      </Button>
    </div>
  )
}

function BookingWizard({ slug }: { slug: string | null }) {
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const { data: servicos, isLoading: servicosLoading } = useServices()
  const {
    data: servico,
    isLoading: servicoLoading,
    error: servicoError,
    refetch,
  } = useService(slug ?? undefined)
  const [draft, setDraft] = useState<AppointmentDraft>(emptyDraft)
  const [step, setStep] = useState<BookingStepId>('servico')
  const [feedback, setFeedback] = useState<{
    state: 'idle' | 'submitting' | 'confirmed' | 'error'
    confirmation: BookingConfirmation | null
  }>({ state: 'idle', confirmation: null })

  const service = servico ?? null
  const serviceInfo = servico
    ? {
        servicoId: servico.id,
        servicoSlug: servico.slug,
        servicoNome: servico.nome,
        duracaoMinutos: servico.duracaoMinutos,
      }
    : null

  const professionalsQuery = useServiceProfessionals(
    serviceInfo?.servicoId ?? null,
  )
  const linkage = professionalsQuery.data
  const availabilityQuery = useAvailability(
    serviceInfo?.servicoId ?? null,
    draft.profissionalId,
    draft.data,
  )
  const availability = availabilityQuery.data
  const createAppointment = useCreateAppointment()

  const patchDraft = (patch: Partial<AppointmentDraft>) => {
    setDraft((anterior) => ({ ...anterior, ...patch }))
  }

  const selectService = (serviceSlug: string) => {
    setSearchParams({ servico: serviceSlug }, { replace: true })
  }

  const clearService = () => {
    setSearchParams({}, { replace: true })
  }

  const selectProfessional = (professional: { id: string; nome: string }) => {
    patchDraft({
      profissionalId: professional.id,
      profissionalNome: professional.nome,
    })
  }

  const contact = () => {
    navigate(
      atendimentoHref(
        'agendamento',
        feedback.confirmation?.protocolo,
      ),
    )
  }

  const canAdvance = ((): boolean => {
    switch (step) {
      case 'servico':
        return serviceInfo !== null
      case 'profissional':
        return professionalStepOutcome(linkage, draft).kind === 'allowed'
      case 'data':
        return draft.data !== null
      case 'horario':
        return timeStepOutcome(availability, draft).kind === 'ready'
      case 'dados':
        return isCustomerStepComplete(draft)
      case 'resumo':
        return true
    }
  })()

  const submit = async () => {
    if (!serviceInfo) return
    setFeedback({ state: 'submitting', confirmation: null })
    try {
      const confirmation = await createAppointment.mutateAsync({
        ...draft,
        ...serviceInfo,
      })
      setFeedback({ state: 'confirmed', confirmation })
    } catch {
      setFeedback({ state: 'error', confirmation: null })
    }
  }

  const advance = () => {
    if (step === 'resumo') {
      submit()
      return
    }
    setStep(BOOKING_STEPS[stepIndex(step) + 1])
  }

  const back = () => {
    const index = stepIndex(step)
    if (index > 0) setStep(BOOKING_STEPS[index - 1])
  }

  if (feedback.state !== 'idle') {
    return (
      <div className="section-angel">
        <div className="container-angel">
          <BookingFeedback
            state={feedback.state}
            confirmation={feedback.confirmation}
            onRetry={() => setFeedback({ state: 'idle', confirmation: null })}
            onNewBooking={() => navigate('/agendamento')}
            onContact={contact}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="section-angel">
      <div className="container-angel">
        <header className="mb-10 max-w-2xl">
          <p className="overline-angel mb-3">Angel Cosméticos</p>
          <h1 className="title-h1">Agendamento</h1>
          <p className="body-angel-lg mt-4">
            Escolha o serviço, a data e o horário. Nossa equipe confirma o
            agendamento em seguida.
          </p>
        </header>

        <Stepper current={step} />

        <div className="mt-10">
          {slug === null || servicoLoading ? (
            <BookingServiceStep
              services={slug === null ? servicos : undefined}
              isLoading={slug !== null}
              selected={null}
              onSelect={selectService}
              onChange={clearService}
            />
          ) : servicoError ? (
            <ErrorState
              message="Não foi possível carregar o serviço."
              onRetry={() => refetch()}
            />
          ) : !servico ? (
            <ServiceUnavailable onBack={clearService} />
          ) : (
            <div className="space-y-10">
              {step === 'servico' && (
                <BookingServiceStep
                  services={servicos}
                  isLoading={servicosLoading}
                  selected={service}
                  onSelect={selectService}
                  onChange={clearService}
                />
              )}
              {step === 'profissional' && serviceInfo && (
                <BookingProfessionalStep
                  linkage={linkage}
                  selectedId={draft.profissionalId}
                  onSelect={selectProfessional}
                  onContact={contact}
                />
              )}
              {step === 'data' && (
                <BookingDateStep
                  selected={draft.data}
                  onSelect={(data) => patchDraft({ data })}
                />
              )}
              {step === 'horario' && (
                <BookingTimeStep
                  availability={availability}
                  selected={draft.horarioInicio}
                  onSelect={(slot) => patchDraft({ horarioInicio: slot.inicio })}
                  onContact={contact}
                />
              )}
              {step === 'dados' && (
                <BookingCustomerStep draft={draft} onChange={patchDraft} />
              )}
              {step === 'resumo' && serviceInfo && (
                <BookingSummary service={service} draft={draft} />
              )}
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          {stepIndex(step) > 0 ? (
            <Button variant="ghost" onClick={back}>
              <ArrowLeft size={18} />
              Voltar
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="primary"
            size="lg"
            disabled={!canAdvance || createAppointment.isPending}
            onClick={advance}
          >
            {step === 'resumo' ? 'Solicitar agendamento' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
