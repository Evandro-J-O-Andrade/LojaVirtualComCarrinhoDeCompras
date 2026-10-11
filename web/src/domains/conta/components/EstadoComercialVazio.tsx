import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface EstadoComercialVazioProps {
  icon: LucideIcon
  titulo: string
  descricao: string
}

/**
 * Estado vazio honesto para as seções
 * comerciais da conta (pedidos,
 * orçamentos, agendamentos).
 *
 * Enquanto a Etapa 8 não entrar, não
 * há histórico para mostrar — e não
 * inventamos nenhum. O texto diz o
 * que falta, sem fingir dados.
 */
export function EstadoComercialVazio({
  icon: Icon,
  titulo,
  descricao,
}: EstadoComercialVazioProps) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-champagne-light">
        <Icon
          size={36}
          className="text-primary"
          aria-hidden
        />
      </div>
      <h2 className="title-h2">{titulo}</h2>
      <p className="mt-3 max-w-md text-body text-content-muted">
        {descricao}
      </p>
      <p className="mt-6 max-w-md text-body-sm text-content-muted">
        Seu histórico aparece aqui quando a
        integração com o backend entrar —
        nunca por dados inventados.
      </p>
      <Link
        to="/atendimento"
        className="mt-8 inline-flex items-center gap-2 rounded-lg border-2 border-champagne px-4 py-2 text-sm font-medium text-soft-black transition-colors hover:border-deep-rose hover:bg-blush"
      >
        Falar com o atendimento
        <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  )
}
