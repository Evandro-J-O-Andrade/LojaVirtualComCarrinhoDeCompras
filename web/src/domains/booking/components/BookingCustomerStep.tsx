import { cn } from '@/lib/utils'
import { isEmailValid, isPhoneValid, type AppointmentDraft } from '../model/appointment'

interface BookingCustomerStepProps {
  draft: AppointmentDraft
  onChange: (patch: Partial<AppointmentDraft>) => void
}

export function BookingCustomerStep({ draft, onChange }: BookingCustomerStepProps) {
  const telefoneInvalido =
    draft.contatoTelefone.trim() !== '' && !isPhoneValid(draft.contatoTelefone)
  const emailInvalido =
    draft.contatoEmail.trim() !== '' && !isEmailValid(draft.contatoEmail)

  return (
    <div className="surface-card space-y-5 p-6">
      <div>
        <label htmlFor="booking-nome" className="label-angel">
          Nome completo <span className="text-primary">*</span>
        </label>
        <input
          id="booking-nome"
          type="text"
          value={draft.contatoNome}
          onChange={(event) => onChange({ contatoNome: event.target.value })}
          placeholder="Seu nome"
          autoComplete="name"
          className="field-angel"
        />
      </div>

      <div>
        <label htmlFor="booking-telefone" className="label-angel">
          Telefone <span className="text-primary">*</span>
        </label>
        <input
          id="booking-telefone"
          type="tel"
          value={draft.contatoTelefone}
          onChange={(event) => onChange({ contatoTelefone: event.target.value })}
          placeholder="(11) 96320-5776"
          autoComplete="tel"
          className={cn('field-angel', telefoneInvalido && 'border-error')}
        />
        {telefoneInvalido && (
          <p className="mt-1.5 text-sm text-error">
            Informe um telefone válido com DDD.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="booking-email" className="label-angel">
          E-mail{' '}
          <span className="text-content-subtle">(opcional)</span>
        </label>
        <input
          id="booking-email"
          type="email"
          value={draft.contatoEmail}
          onChange={(event) => onChange({ contatoEmail: event.target.value })}
          placeholder="seu@email.com"
          autoComplete="email"
          className={cn('field-angel', emailInvalido && 'border-error')}
        />
        {emailInvalido && (
          <p className="mt-1.5 text-sm text-error">
            Informe um e-mail válido ou deixe em branco.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="booking-observacao" className="label-angel">
          Observação <span className="text-content-subtle">(opcional)</span>
        </label>
        <textarea
          id="booking-observacao"
          rows={4}
          value={draft.observacao}
          onChange={(event) => onChange({ observacao: event.target.value })}
          placeholder="Conte-nos o que precisa"
          className="field-angel resize-none"
        />
      </div>
    </div>
  )
}
