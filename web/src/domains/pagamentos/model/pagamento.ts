/**
 * FATIA 7 — Pagamento.
 *
 * Pagamento é evento financeiro próprio,
 * separado do pedido. Confirmação vem
 * de WEBHOOK (nunca da tela). Estorno
 * é evento auditável que devolve estoque —
 * não é simplesmente "alterar status".
 */

export type MetodoPagamento = 'pix' | 'cartao'

export type StatusPagamento =
  | 'pendente'
  | 'processando'
  | 'confirmado'
  | 'falhou'
  | 'estornado'

export type OrigemEventoPagamento =
  | 'cliente'
  | 'webhook'
  | 'operador'

export interface EventoPagamento {
  em: string
  statusAnterior: StatusPagamento | null
  statusNovo: StatusPagamento
  origem: OrigemEventoPagamento
}

export interface Pagamento {
  id: string
  pedidoId: string
  metodo: MetodoPagamento
  parcelas: number
  /** Valor definido pelo servidor a partir do pedido — nunca pelo cliente. */
  valor: number
  status: StatusPagamento
  /** Provedor de pagamento; null enquanto nenhum gateway estiver conectado. */
  gateway: string | null
  /** Chaves de idempotência já processadas (webhook duplicado não duplica). */
  chavesProcessadas: string[]
  criadoEm: string
  atualizadoEm: string
  historico: EventoPagamento[]
}

export interface Estorno {
  id: string
  pagamentoId: string
  valor: number
  motivo: string | null
  criadoEm: string
}

const TRANSOES_PAGAMENTO: Record<
  StatusPagamento,
  StatusPagamento[]
> = {
  pendente: ['processando', 'falhou'],
  processando: ['confirmado', 'falhou', 'pendente'],
  // Confirmado NUNCA volta silenciosamente
  // para pendente/processando.
  confirmado: ['estornado'],
  falhou: [],
  estornado: [],
}

export function podeTransicionarPagamento(
  de: StatusPagamento,
  para: StatusPagamento,
): boolean {
  return (
    TRANSOES_PAGAMENTO[de]?.includes(para) ??
    false
  )
}

export function transicionarPagamento(
  pagamento: Pagamento,
  proximo: StatusPagamento,
  origem: OrigemEventoPagamento,
): Pagamento {
  if (
    !podeTransicionarPagamento(
      pagamento.status,
      proximo,
    )
  ) {
    throw new Error(
      `Transição de pagamento inválida: ${pagamento.status} → ${proximo}.`,
    )
  }
  const em = new Date().toISOString()
  return {
    ...pagamento,
    status: proximo,
    atualizadoEm: em,
    historico: [
      ...pagamento.historico,
      {
        em,
        statusAnterior: pagamento.status,
        statusNovo: proximo,
        origem,
      },
    ],
  }
}

export class EstornoInvalidoError extends Error {
  readonly code = 'ESTORNO_INVALIDO' as const

  constructor(message: string) {
    super(message)
    this.name = 'EstornoInvalidoError'
  }
}

/**
 * Saldo ainda não estornado.
 * Estorno nunca excede o valor pago.
 */
export function saldoEstornavel(
  pagamento: Pagamento,
  estornos: Estorno[],
): number {
  const estornado = estornos
    .filter((estorno) => estorno.pagamentoId === pagamento.id)
    .reduce((soma, estorno) => soma + estorno.valor, 0)
  return Math.max(0, pagamento.valor - estornado)
}

/**
 * Registra o estorno — evento financeiro
 * próprio. Regras:
 *   - pagamento confirmado;
 *   - valor > 0;
 *   - acumulado de estornos ≤ valor pago.
 * A devolução de estoque é decidida pelo
 * backend na mesma transação.
 */
export function registrarEstorno(
  pagamento: Pagamento,
  estornosAnteriores: Estorno[],
  valor: number,
  motivo: string | null,
): { pagamento: Pagamento; estorno: Estorno } {
  if (pagamento.status !== 'confirmado') {
    throw new EstornoInvalidoError(
      'Estorno exige pagamento confirmado.',
    )
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new EstornoInvalidoError(
      'Estorno deve ser maior que zero.',
    )
  }
  const saldo = saldoEstornavel(
    pagamento,
    estornosAnteriores,
  )
  if (valor > saldo) {
    throw new EstornoInvalidoError(
      `Estorno de ${valor} excede o saldo estornável de ${saldo}.`,
    )
  }
  const estorno: Estorno = {
    id: `estorno-${Date.now()}`,
    pagamentoId: pagamento.id,
    valor,
    motivo,
    criadoEm: new Date().toISOString(),
  }
  const estornadoAnterior = estornosAnteriores
    .filter(
      (estorno) =>
        estorno.pagamentoId === pagamento.id,
    )
    .reduce((soma, estorno) => soma + estorno.valor, 0)
  const novoTotal = estornadoAnterior + valor
  // Estorno total move o pagamento para
  // 'estornado'; parcial mantém 'confirmado'.
  const pagamentoAtualizado =
    novoTotal >= pagamento.valor
      ? transicionarPagamento(
          pagamento,
          'estornado',
          'operador',
        )
      : {
          ...pagamento,
          atualizadoEm: estorno.criadoEm,
        }
  return {
    pagamento: pagamentoAtualizado,
    estorno,
  }
}
