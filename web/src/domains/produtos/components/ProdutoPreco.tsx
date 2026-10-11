import { cn, formatPrice } from '@/lib/utils'
import { DiscountBadge } from '@/components/commerce/DiscountBadge'
import type { Produto, ProdutoVariante } from '../model/produto'
import {
  formatDateBR,
  melhorPromocao,
  precoBase,
  precoOfertado,
  rotuloDisponibilidade,
} from '../model/produto'

interface ProdutoPrecoProps {
  produto: Produto
  variante?: ProdutoVariante | null
  className?: string
}

/**
 * Oferta não é preço: o bloco exibe a cadeia semântica
 * preço_base → promoção válida → preço ofertado,
 * sem achatá-la em um único "preço com desconto".
 */
export function ProdutoPreco({
  produto,
  variante,
  className,
}: ProdutoPrecoProps) {
  const base = precoBase(produto, variante)
  const ofertado = precoOfertado(produto, variante)
  const promocao = melhorPromocao(produto, base)
  const comDesconto = promocao !== null && ofertado < base
  const sku = variante?.sku ?? produto.sku

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display font-bold text-3xl text-primary">
          {formatPrice(ofertado)}
        </span>
        {comDesconto && (
          <>
            <s className="text-lg text-content-subtle">
              {formatPrice(base)}
            </s>
            <DiscountBadge originalPrice={base} currentPrice={ofertado} />
          </>
        )}
      </div>
      {comDesconto && promocao && (
        <p className="text-sm text-content-muted">
          Oferta válida até {formatDateBR(promocao.dataFim)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-content-muted">
          Condição: {rotuloDisponibilidade(produto)}
        </span>
        {sku && <span className="text-content-subtle">SKU: {sku}</span>}
      </div>
    </div>
  )
}
