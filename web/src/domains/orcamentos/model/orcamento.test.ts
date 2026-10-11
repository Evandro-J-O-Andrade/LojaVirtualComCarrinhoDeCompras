import { describe, expect, it } from 'vitest'
import type { OrcamentoItem } from './orcamento'
import {
  calcularTotais,
  gerarProtocolo,
  isProtocoloOrcamento,
  itemJaNoOrcamento,
  proximasAcoes,
  validarDescontoComercial,
  type DescontoComercial,
} from './orcamento'
import type { ProdutoRef } from '@/domains/produtos/model/produto'

function item(
  precoBase: number,
  precoUnitario: number,
  quantidade = 1,
): OrcamentoItem {
  const produto: ProdutoRef = {
    id: '1',
    slug: 'produto',
    nome: 'Produto',
    preco: precoBase,
    imagem: null,
  }
  return {
    produto,
    varianteId: null,
    varianteSku: null,
    atributosTexto: null,
    quantidade,
    precoBaseUnitario: precoBase,
    precoUnitario,
  }
}

describe('calcularTotais', () => {
  it('calcula subtotal base e subtotal ofertado', () => {
    const totais = calcularTotais(
      [item(100, 100, 2), item(50, 40, 1)],
      null,
    )
    expect(totais.subtotal).toBe(250)
    expect(totais.valorPromocao).toBe(10)
    expect(totais.subtotalOfertado).toBe(240)
    expect(totais.valorDescontoComercial).toBe(0)
    expect(totais.total).toBe(240)
  })

  it('aplica desconto comercial após a promoção', () => {
    const desconto: DescontoComercial = {
      tipo: 'percentual',
      valor: 10,
      tetoMaximo: null,
      justificativa: 'negociação',
      concedidoPor: 'vendedor',
    }
    const totais = calcularTotais([item(100, 80, 1)], desconto)
    expect(totais.subtotal).toBe(100)
    expect(totais.subtotalOfertado).toBe(80)
    expect(totais.valorDescontoComercial).toBe(8)
    expect(totais.total).toBe(72)
  })

  it('respeita o teto máximo do desconto comercial', () => {
    const desconto: DescontoComercial = {
      tipo: 'percentual',
      valor: 50,
      tetoMaximo: 10,
      justificativa: null,
      concedidoPor: null,
    }
    const totais = calcularTotais([item(100, 100, 1)], desconto)
    expect(totais.valorDescontoComercial).toBe(10)
    expect(totais.total).toBe(90)
  })

  it('nunca deixa o total negativo', () => {
    const desconto: DescontoComercial = {
      tipo: 'fixo',
      valor: 9999,
      tetoMaximo: null,
      justificativa: null,
      concedidoPor: null,
    }
    const totais = calcularTotais([item(100, 100, 1)], desconto, 0)
    expect(totais.total).toBe(0)
  })

  it('inclui frete no total', () => {
    const totais = calcularTotais([item(100, 100, 1)], null, 25.5)
    expect(totais.frete).toBe(25.5)
    expect(totais.total).toBe(125.5)
  })
})

describe('protocolo', () => {
  it('formata ORC-YYYYMMDD-NNNNNN', () => {
    expect(gerarProtocolo('2026-10-05', 1)).toBe('ORC-20261005-000001')
    expect(gerarProtocolo('2026-10-05', 42)).toBe('ORC-20261005-000042')
    expect(
      gerarProtocolo('2026-10-05T14:30:00Z', 7),
    ).toBe('ORC-20261005-000007')
  })

  it('valida o formato fechado', () => {
    expect(isProtocoloOrcamento('ORC-20261005-000001')).toBe(true)
    expect(isProtocoloOrcamento('AG-20261005-000001')).toBe(false)
    expect(isProtocoloOrcamento('ORC-20261005-123')).toBe(false)
    expect(isProtocoloOrcamento('orc-20261005-000001')).toBe(false)
    expect(isProtocoloOrcamento('')).toBe(false)
  })
})

describe('ciclo comercial', () => {
  it('rascunho pode salvar ou enviar', () => {
    expect(proximasAcoes('rascunho')).toEqual(['salvar', 'enviar'])
  })

  it('enviado aguarda aprovação ou recusa', () => {
    expect(proximasAcoes('enviado')).toEqual(['aprovar', 'recusar'])
  })

  it('aceito converte em pedido', () => {
    expect(proximasAcoes('aceito')).toEqual(['converter'])
  })

  it('recusado e expirado são terminais', () => {
    expect(proximasAcoes('recusado')).toEqual([])
    expect(proximasAcoes('expirado')).toEqual([])
  })
})

describe('validarDescontoComercial', () => {
  it('rejeita percentual fora de 0-100', () => {
    expect(
      validarDescontoComercial({
        tipo: 'percentual',
        valor: 0,
        tetoMaximo: null,
        justificativa: null,
        concedidoPor: null,
      }),
    ).not.toBeNull()
    expect(
      validarDescontoComercial({
        tipo: 'percentual',
        valor: 150,
        tetoMaximo: null,
        justificativa: null,
        concedidoPor: null,
      }),
    ).not.toBeNull()
  })

  it('aceita percentual válido', () => {
    expect(
      validarDescontoComercial({
        tipo: 'percentual',
        valor: 15,
        tetoMaximo: null,
        justificativa: null,
        concedidoPor: null,
      }),
    ).toBeNull()
  })
})

describe('itemJaNoOrcamento', () => {
  it('identifica duplicatas por produto e variante', () => {
    const primeiro = item(100, 100)
    const itens = [primeiro]
    expect(
      itemJaNoOrcamento(itens, '1', null),
    ).toBe(0)
    expect(
      itemJaNoOrcamento(itens, '1', 'var-1'),
    ).toBe(-1)
  })
})
