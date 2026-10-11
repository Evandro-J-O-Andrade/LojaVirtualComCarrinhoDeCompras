import type {
  MetodoPagamento,
  Pagamento,
} from '../model/pagamento'

export class PagamentoBackendIndisponivelError
  extends Error
{
  readonly code =
    'PAGAMENTO_BACKEND_INDISPONIVEL' as const

  constructor(
    message = 'A criação de pagamento requer a Edge Function (Etapa 8).',
  ) {
    super(message)
    this.name = 'PagamentoBackendIndisponivelError'
  }
}

export interface PagamentoRepository {
  /**
   * Cria o pagamento a partir do
   * pedido. O valor é definido pelo
   * servidor — o cliente nunca
   * informa valor.
   */
  criarPagamento(input: {
    pedidoId: string
    metodo: MetodoPagamento
    parcelas: number
  }): Promise<Pagamento>
}
