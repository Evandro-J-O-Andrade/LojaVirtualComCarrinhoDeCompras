import {
  INTENCAO_STORAGE_KEY,
  type IntencaoDeCompra,
} from '../model/intencao'
import type { IntencaoRepository } from './intencao.repository'

/**
 * Intenções ficam no navegador nesta fatia. Quando a
 * Fatia 7 (Pedidos) for autorizada, a intenção sobe
 * para o backend e vira pedido de verdade.
 */
export class LocalIntencaoRepository
  implements IntencaoRepository
{
  salvar(intencao: IntencaoDeCompra): void {
    try {
      localStorage.setItem(
        INTENCAO_STORAGE_KEY,
        JSON.stringify(intencao),
      )
    } catch {
      // Armazenamento indisponível: a intenção
      // vive em memória durante a sessão.
    }
  }

  ultima(): IntencaoDeCompra | null {
    try {
      const salvo = localStorage.getItem(
        INTENCAO_STORAGE_KEY,
      )
      return salvo ? (JSON.parse(salvo) as IntencaoDeCompra) : null
    } catch {
      return null
    }
  }
}
