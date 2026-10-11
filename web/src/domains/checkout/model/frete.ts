import type { ModalidadeEntrega } from './intencao'

export type FreteTipo = 'gratis' | 'a_calcular'

export interface ResultadoFrete {
  tipo: FreteTipo
  /**
   * null = sem regra real disponível. Frete só é
   * autoridade após cálculo no backend; nunca
   * inventamos valor aqui.
   */
  valor: number | null
  rotulo: string
}

/**
 * DECISÃO 5 — Frete é regra configurável no
 * admin (tabela `frete_regra`), não hardcoded
 * no frontend. Hoje essa tabela está vazia e
 * não há integração com transportadora: nenhum
 * valor de entrega é calculado, estimado ou
 * inventado ("qualquer valor exibido hoje seria
 * simulação — proibido", CONTRATO_FUNCIONAL).
 *
 * A única modalidade genuinamente sem custo de
 * frete é a retirada na loja: nada é entregue,
 * logo o frete é R$ 0,00 de verdade — não uma
 * regra inventada.
 *
 * Seam: quando `frete_regra` tiver dados ou a
 * integração com transportadora (Correios/Jadlog)
 * for autorizada, a modalidade 'entrega' consulta
 * a regra real por CEP/região/subtotal — incluindo
 * frete grátis a partir de subtotal mínimo — e
 * deixa de ser 'a_calcular'.
 */
export function calcularFrete(
  modalidade: ModalidadeEntrega,
): ResultadoFrete {
  if (modalidade === 'retirada') {
    return {
      tipo: 'gratis',
      valor: 0,
      rotulo: 'Frete grátis — retirada na loja',
    }
  }
  return {
    tipo: 'a_calcular',
    valor: null,
    rotulo: 'A calcular na finalização',
  }
}
