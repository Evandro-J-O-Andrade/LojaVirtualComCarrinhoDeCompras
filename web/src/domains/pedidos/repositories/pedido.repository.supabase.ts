import { supabase } from '@/lib/supabase'
import type {
  IntencaoParaServidor,
  Pedido,
} from '../model/pedido'
import {
  PedidoBackendIndisponivelError,
  type PedidoRepository,
} from './pedido.repository'

/**
 * A Edge Function `criar-pedido` é quem
 * revalida (preço, promoção, estoque, kit)
 * e cria o pedido. Qualquer falha — tabela
 * ausente, função inexistente, rede — é
 * recusada como backend indisponível.
 * Nenhuma criação local.
 */
export class SupabasePedidoRepository
  implements PedidoRepository
{
  async criarPedido(
    intencao: IntencaoParaServidor,
  ): Promise<Pedido> {
    try {
      const { data, error } =
        await supabase.functions.invoke<Pedido>(
          'criar-pedido',
          { body: intencao },
        )
      if (error) throw error
      if (!data) throw new Error('Resposta vazia.')
      return data
    } catch {
      throw new PedidoBackendIndisponivelError()
    }
  }
}
