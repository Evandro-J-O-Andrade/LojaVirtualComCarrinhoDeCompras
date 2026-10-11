import { useNavigate } from 'react-router-dom'
import { CalendarDays, FileText, MapPin } from 'lucide-react'
import { Button } from '@/components/common/Button'
import type { Service } from '../model/service'
import { resolveServiceCta } from '../model/service'

export function ServiceCta({ service }: { service: Service }) {
  const navigate = useNavigate()
  const cta = resolveServiceCta(service)

  if (cta === 'sob-consulta') {
    return (
      <div className="surface-card p-6">
        <p className="overline-angel mb-2">Preço</p>
        <p className="font-display font-bold text-2xl text-content">Sob consulta</p>
        <p className="mt-2 mb-5 text-body-sm text-content-muted">
          O valor deste serviço é definido conforme o atendimento. Solicite um
          orçamento sem compromisso.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/orcamentos/novo')}
        >
          <FileText size={20} />
          Solicitar orçamento
        </Button>
      </div>
    )
  }

  if (cta === 'atendimento-presencial') {
    return (
      <div className="surface-card p-6">
        <p className="overline-angel mb-2">Atendimento</p>
        <p className="font-display font-bold text-2xl text-content">Presencial</p>
        <p className="mt-2 mb-5 text-body-sm text-content-muted">
          Este serviço é realizado no nosso espaço, sem agendamento online.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate('/contato')}
        >
          <MapPin size={20} />
          Ver endereço e contato
        </Button>
      </div>
    )
  }

  return (
    <div className="surface-card p-6">
      <p className="overline-angel mb-2">Agendamento</p>
      <p className="font-display font-bold text-2xl text-content">
        {service.requerConfirmacao ? 'Solicitar agendamento' : 'Agendamento instantâneo'}
      </p>
      <p className="mt-2 mb-5 text-body-sm text-content-muted">
        {service.requerConfirmacao
          ? 'Sua solicitação é analisada pela nossa equipe, que confirma o horário em seguida.'
          : 'Escolha o horário e o agendamento é confirmado automaticamente.'}
      </p>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() =>
          navigate(`/agendamento?servico=${encodeURIComponent(service.slug)}`)
        }
      >
        <CalendarDays size={20} />
        Agendar
      </Button>
      <p className="mt-3 text-body-sm text-content-subtle">
        A disponibilidade real de horários é confirmada durante o atendimento.
      </p>
    </div>
  )
}
