import type { CarrinhoItem } from '@/domains/carrinho/model/carrinho'

/**
 * FATIA 6 — Intenção de compra (checkout).
 *
 * A intenção NÃO é pedido: é o registro local do que
 * o cliente quer comprar. A finalização real passa por
 * revalidação de preço, promoção e estoque no backend
 * (Fatia 7+) antes de virar pedido e pagamento.
 */

export type ModalidadeEntrega = 'entrega' | 'retirada'
export type MetodoPagamento = 'pix' | 'cartao'

export interface IntencaoCliente {
  nome: string
  email: string
  whatsapp: string
}

export interface IntencaoEndereco {
  cep: string
  rua: string
  numero: string
  complemento: string | null
  cidade: string
  estado: string
}

export interface IntencaoPagamento {
  metodo: MetodoPagamento
  parcelas: number
}

export interface TotaisIntencao {
  subtotalBase: number
  valorPromocao: number
  subtotalOfertado: number
  /** Informativo: frete só é autoridade após cálculo no backend. */
  frete: number | null
  totalInformativo: number
}

export interface IntencaoDeCompra {
  id: string
  criadaEm: string
  cliente: IntencaoCliente
  endereco: IntencaoEndereco
  modalidadeEntrega: ModalidadeEntrega
  pagamento: IntencaoPagamento
  itens: CarrinhoItem[]
  totais: TotaisIntencao
  /** Sempre local nesta fatia — nunca finge confirmação de pedido. */
  source: 'local'
}

export const INTENCAO_STORAGE_KEY = 'angel-intencoes-compra'

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}
