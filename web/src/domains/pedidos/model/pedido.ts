import type { ModalidadeEntrega, MetodoPagamento } from '@/domains/checkout/model/intencao'

/**
 * FATIA 7 — Pedido.
 *
 * Regra central: pedido NUNCA nasce no frontend.
 * O frontend envia apenas IDs e quantidades; o
 * backend reconstrói preço, promoção, estoque e
 * composição de kit — e só então cria o pedido.
 *
 * O pedido carrega SNAPSHOT comercial: o histórico
 * não muda quando o catálogo muda.
 */

export const PEDIDO_PROTOCOLO_REGEX = /^PED-[0-9]{8}-[0-9]{6}$/

export function isProtocoloPedido(valor: string): boolean {
  return PEDIDO_PROTOCOLO_REGEX.test(valor)
}

export function gerarProtocoloPedido(
  dataISO: string,
  sequencial: number,
): string {
  const data = dataISO.slice(0, 10).replace(/-/g, '')
  return `PED-${data}-${String(sequencial).padStart(6, '0')}`
}

export type StatusPedido =
  | 'criado'
  | 'em_processamento'
  | 'confirmado'
  | 'cancelado'

export interface PedidoCliente {
  nome: string
  email: string
  whatsapp: string
}

export interface PedidoEndereco {
  cep: string
  rua: string
  numero: string
  complemento: string | null
  cidade: string
  estado: string
}

export interface CondicaoPagamentoPedido {
  metodo: MetodoPagamento
  parcelas: number
}

/**
 * Snapshot imutável do item no momento da
 * confirmação. Nunca é recalculado a partir
 * do catálogo — preserva o que foi vendido.
 */
export interface PedidoItemSnapshot {
  produtoId: string
  varianteId: string | null
  nomeSnapshot: string
  skuSnapshot: string | null
  precoBaseSnapshot: number
  /** Rótulo da promoção vigente na confirmação. */
  promocaoSnapshot: string | null
  /** Preço final unitário na confirmação. */
  precoFinalSnapshot: number
  quantidade: number
}

export interface EventoPedido {
  em: string
  statusAnterior: StatusPedido | null
  statusNovo: StatusPedido
  ator: string | null
}

export interface Pedido {
  id: string
  protocolo: string
  cliente: PedidoCliente
  endereco: PedidoEndereco
  modalidadeEntrega: ModalidadeEntrega
  itens: PedidoItemSnapshot[]
  frete: number | null
  condicaoPagamento: CondicaoPagamentoPedido
  subtotalBase: number
  valorPromocao: number
  total: number
  status: StatusPedido
  pagamentoId: string | null
  criadoEm: string
  atualizadoEm: string
  historico: EventoPedido[]
}

/**
 * Intenção enviada ao backend. Estruturalmente
 * SEM preços: o valor exibido no navegador é
 * informativo e nunca é autoridade.
 */
export interface IntencaoItemServidor {
  produtoId: string
  varianteId: string | null
  quantidade: number
}

export interface IntencaoParaServidor {
  cliente: PedidoCliente
  endereco: PedidoEndereco
  modalidadeEntrega: ModalidadeEntrega
  condicaoPagamento: CondicaoPagamentoPedido
  itens: IntencaoItemServidor[]
}

const TRANSOES_PEDIDO: Record<StatusPedido, StatusPedido[]> = {
  criado: ['em_processamento', 'cancelado'],
  em_processamento: ['confirmado', 'cancelado'],
  confirmado: [],
  cancelado: [],
}

export function transicoesPedido(
  status: StatusPedido,
): StatusPedido[] {
  return TRANSOES_PEDIDO[status]
}

export function podeTransicionarPedido(
  de: StatusPedido,
  para: StatusPedido,
): boolean {
  return TRANSOES_PEDIDO[de]?.includes(para) ?? false
}

/**
 * Máquina de estados do pedido. Transição inválida
 * lança — nunca corrige silenciosamente.
 */
export function transicionarPedido(
  pedido: Pedido,
  proximo: StatusPedido,
  ator: string | null,
): Pedido {
  if (!podeTransicionarPedido(pedido.status, proximo)) {
    throw new Error(
      `Transição de pedido inválida: ${pedido.status} → ${proximo}.`,
    )
  }
  const em = new Date().toISOString()
  return {
    ...pedido,
    status: proximo,
    atualizadoEm: em,
    historico: [
      ...pedido.historico,
      {
        em,
        statusAnterior: pedido.status,
        statusNovo: proximo,
        ator,
      },
    ],
  }
}
