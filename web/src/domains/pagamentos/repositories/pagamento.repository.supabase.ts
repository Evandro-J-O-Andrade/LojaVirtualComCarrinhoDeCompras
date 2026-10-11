import { supabase } from '@/lib/supabase'
import type {
  Pagamento,
} from '../model/pagamento'
import {
  PagamentoBackendIndisponivelError,
  type PagamentoRepository,
} from './pagamento.repository'

/**
 * A Edge Function `criar-pagamento`
 * define o valor a partir do pedido
 * e aciona o provider. Qualquer
 * falha é recusada como backend
 * indisponível. Nenhum pagamento
 * local.
 */
export class SupabasePagamentoRepository
  implements PagamentoRepository
{
  async criarPagamento(input: {
    pedidoId: string
    metodo: 'pix' | 'cartao'
    parcelas: number
  }): Promise<Pagamento> {
    try {
      const { data, error } =
        await supabase.functions.invoke<Pagamento>(
          'criar-pagamento',
          { body: input },
        )
      if (error) throw error
      if (!data) throw new Error('Resposta vazia.')
      return data
    } catch {
      throw new PagamentoBackendIndisponivelError()
    }
  }
}
