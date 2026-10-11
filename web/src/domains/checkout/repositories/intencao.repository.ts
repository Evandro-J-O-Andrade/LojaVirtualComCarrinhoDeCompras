import type { IntencaoDeCompra } from '../model/intencao'

export interface IntencaoRepository {
  salvar(intencao: IntencaoDeCompra): void
  ultima(): IntencaoDeCompra | null
}
