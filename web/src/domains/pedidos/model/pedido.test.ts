import { describe, expect, it } from 'vitest'
import {
  gerarProtocoloPedido,
  isProtocoloPedido,
  podeTransicionarPedido,
  transicionarPedido,
  type Pedido,
} from './pedido'

function pedido(
  status: Pedido['status'] = 'criado',
): Pedido {
  return {
    id: '1',
    protocolo: 'PED-20261005-000001',
    cliente: {
      nome: 'Ana',
      email: 'ana@email.com',
      whatsapp: '11999999999',
    },
    endereco: {
      cep: '01001000',
      rua: 'Rua X',
      numero: '1',
      complemento: null,
      cidade: 'São Paulo',
      estado: 'SP',
    },
    modalidadeEntrega: 'entrega',
    itens: [],
    frete: null,
    condicaoPagamento: {
      metodo: 'pix',
      parcelas: 1,
    },
    subtotalBase: 100,
    valorPromocao: 0,
    total: 100,
    status,
    pagamentoId: null,
    criadoEm: '2026-10-05T10:00:00Z',
    atualizadoEm: '2026-10-05T10:00:00Z',
    historico: [],
  }
}

describe('protocolo de pedido', () => {
  it('usa PED-YYYYMMDD-NNNNNN', () => {
    expect(gerarProtocoloPedido('2026-10-05', 1)).toBe(
      'PED-20261005-000001',
    )
    expect(
      isProtocoloPedido('PED-20261005-000001'),
    ).toBe(true)
    expect(
      isProtocoloPedido('AG-20261005-000001'),
    ).toBe(false)
    expect(
      isProtocoloPedido('ORC-20261005-000001'),
    ).toBe(false)
    expect(isProtocoloPedido('PED-20261005-12')).toBe(
      false,
    )
  })
})

describe('máquina de estados do pedido', () => {
  it('criado processa ou cancela', () => {
    expect(podeTransicionarPedido('criado', 'em_processamento')).toBe(true)
    expect(podeTransicionarPedido('criado', 'cancelado')).toBe(true)
    expect(podeTransicionarPedido('criado', 'confirmado')).toBe(false)
  })

  it('confirmado e cancelado são terminais', () => {
    expect(podeTransicionarPedido('confirmado', 'cancelado')).toBe(false)
    expect(podeTransicionarPedido('cancelado', 'criado')).toBe(false)
  })

  it('transição válida registra histórico', () => {
    const processado = transicionarPedido(
      pedido('criado'),
      'em_processamento',
      'sistema',
    )
    expect(processado.status).toBe('em_processamento')
    expect(processado.historico).toHaveLength(1)
    expect(processado.historico[0].statusAnterior).toBe('criado')
    expect(processado.historico[0].statusNovo).toBe('em_processamento')
  })

  it('transição inválida lança — nunca corrige silenciosamente', () => {
    expect(() =>
      transicionarPedido(pedido('confirmado'), 'criado', null),
    ).toThrow('Transição de pedido inválida')
  })
})
