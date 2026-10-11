import { cn, formatPrice } from '@/lib/utils'
import type { MimoPromocao } from '../model/mimo'
import { aplicarPromocao, formatDateBR } from '../model/mimo'

interface MimoPrecoPromocionalProps {
  precoBase: number
  promocao: MimoPromocao
  className?: string
}

export function MimoPrecoPromocional({
  precoBase,
  promocao,
  className,
}: MimoPrecoPromocionalProps) {
  const precoFinal = aplicarPromocao(precoBase, promocao)

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="font-display font-bold text-2xl text-primary">
        {formatPrice(precoFinal)}
      </span>
      <span className="text-sm text-content-subtle line-through">
        {formatPrice(precoBase)}
      </span>
      <span className="text-xs text-content-muted">
        válido até {formatDateBR(promocao.dataFim)}
      </span>
    </div>
  )
}
