import { describe, expect, it } from 'vitest'
import {
  registrarEstorno,
  saldoEstornavel,
  transicionarPagamento,
  type Estorno,
  type Pagamento,
} from './pagamento'

function pagamento(
  status: Pagamento['status'] = 'pendente',
  valor = 200,
): Pagamento {
  return {
    id: 'pag-1',
    pedidoId: 'ped-1',
    metodo: 'pix',
    parcelas: 1,
    valor,
    status,
    gateway: null,
    chavesProcessadas: [],
    criadoEm: '2026-10-05T10:00:00Z',
    atualizadoEm: '2026-10-05T10:00:00Z',
    historico: [],
  }
}

describe('máquina de estados do pagamento', () => {
  it('pendente processa ou falha', () => {
    const processando = transicionarPagamento(
      pagamento(),
      'processando',
      'cliente',
    )
    expect(processando.status).toBe('processando')
    expect(processando.historico[0].origem).toBe('cliente')
  })

  it('confirmado NUNCA volta silenciosamente para pendente', () => {
    expect(() =>
      transicionarPagamento(
        pagamento('confirmado'),
        'pendente',
        'webhook',
      ),
    ).toThrow('Transição de pagamento inválida')
    expect(() =>
      transicionarPagamento(
        pagamento('confirmado'),
        'processando',
        'operador',
      ),
    ).toThrow('Transição de pagamento inválida')
  })

  it('falhou e estornado são terminais', () => {
    expect(() =>
      transicionarPagamento(
        pagamento('falhou'),
        'confirmado',
        'webhook',
      ),
    ).toThrow('Transição de pagamento inválida')
    expect(() =>
      transicionarPagamento(
        pagamento('estornado'),
        'confirmado',
        'operador',
      ),
    ).toThrow('Transição de pagamento inválida')
  })
})

describe('estorno', () => {
  it('não excede o valor pago', () => {
    expect(() =>
      registrarEstorno(
        pagamento('confirmado', 200),
        [],
        200.01,
        'teste',
      ),
    ).toThrow('excede o saldo estornável')
  })

  it('exige pagamento confirmado', () => {
    expect(() =>
      registrarEstorno(pagamento(), [], 50, 'teste'),
    ).toThrow('Estorno exige pagamento confirmado')
  })

  it('exige valor positivo', () => {
    expect(() =>
      registrarEstorno(
        pagamento('confirmado', 200),
        [],
        0,
        null,
      ),
    ).toThrow('maior que zero')
  })

  it('estorno total move para estornado', () => {
    const { pagamento: atualizado, estorno } =
      registrarEstorno(
        pagamento('confirmado', 200),
        [],
        200,
        'cliente desistiu',
      )
    expect(atualizado.status).toBe('estornado')
    expect(estorno.valor).toBe(200)
    expect(estorno.motivo).toBe('cliente desistiu')
  })

  it('estorno parcial mantém confirmado e limita o saldo', () => {
    const primeiro = registrarEstorno(
      pagamento('confirmado', 200),
      [],
      120,
      null,
    )
    expect(primeiro.pagamento.status).toBe('confirmado')

    const estornos: Estorno[] = [primeiro.estorno]
    expect(
      saldoEstornavel(
        primeiro.pagamento,
        estornos,
      ),
    ).toBe(80)

    // Segundo estorno não pode passar do saldo restante.
    expect(() =>
      registrarEstorno(
        primeiro.pagamento,
        estornos,
        81,
        null,
      ),
    ).toThrow('excede o saldo estornável')

    const segundo = registrarEstorno(
      primeiro.pagamento,
      estornos,
      80,
      null,
    )
    expect(segundo.pagamento.status).toBe('estornado')
  })
})
