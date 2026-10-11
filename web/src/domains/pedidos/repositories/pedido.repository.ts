import type {
  IntencaoParaServidor,
  Pedido,
} from '../model/pedido'

/**
 * Pedido é autoridade EXCLUSIVA do backend.
 * Enquanto a Etapa 8 (Supabase) estiver
 * congelada, o repositório recusa honestamente:
 * nunca fabrica pedido local confirmado.
 */
export class PedidoBackendIndisponivelError
  extends Error
{
  readonly code = 'PEDIDO_BACKEND_INDISPONIVEL' as const

  constructor(
    message = 'A criação de pedido requer a Edge Function (Etapa 8).',
  ) {
    super(message)
    this.name = 'PedidoBackendIndisponivelError'
  }
}

export interface PedidoRepository {
  /**
   * Envia a intenção (IDs + quantidades)
   * para a Edge Function, que revalida
   * e cria o pedido com snapshot.
   */
  criarPedido(
    intencao: IntencaoParaServidor,
  ): Promise<Pedido>
}
