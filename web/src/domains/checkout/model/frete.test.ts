import { describe, expect, it } from 'vitest'
import { calcularFrete } from './frete'

/**
 * Contrato de frete (DECISÃO 5):
 *
 *   retirada -> grátis de verdade (nada se entrega)
 *   entrega  -> nunca inventa valor sem regra real
 */
describe('calcularFrete', () => {
  it('retirada na loja é frete grátis real (R$ 0,00)', () => {
    const resultado = calcularFrete('retirada')
    expect(resultado.tipo).toBe('gratis')
    expect(resultado.valor).toBe(0)
    expect(resultado.rotulo).toContain('Frete grátis')
  })

  it('entrega não inventa valor enquanto a regra não existe', () => {
    const resultado = calcularFrete('entrega')
    expect(resultado.tipo).toBe('a_calcular')
    expect(resultado.valor).toBeNull()
  })
})
