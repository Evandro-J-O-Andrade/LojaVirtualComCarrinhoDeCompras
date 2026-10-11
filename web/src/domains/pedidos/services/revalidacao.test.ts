import { describe, expect, it } from 'vitest'
import type {
  CatalogoRevalidacao,
  ProdutoRevalidacao,
} from './revalidacao'
import {
  catalogoEstoqueDe,
  itensDeOrcamentoParaIntencao,
  revalidarIntencao,
} from './revalidacao'
import type { IntencaoParaServidor } from '../model/pedido'

function produto(
  sobre: Partial<ProdutoRevalidacao> = {},
): ProdutoRevalidacao {
  return {
    id: '1',
    nome: 'Produto 1',
    sku: 'SKU-1',
    precoBase: 100,
    variantes: [],
    promocoes: [],
    estoque: 10,
    composicao: [],
    ...sobre,
  }
}

function intencao(
  itens: IntencaoParaServidor['itens'],
): IntencaoParaServidor {
  return {
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
    condicaoPagamento: {
      metodo: 'pix',
      parcelas: 1,
    },
    itens,
  }
}

describe('revalidação comercial', () => {
  it('reconstrói preço a partir do catálogo — nunca do cliente', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([['1', produto()]])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 2,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      // A intenção não carrega preço; o
      // snapshot vem do catálogo.
      expect(resultado.itens[0].precoBaseSnapshot).toBe(100)
      expect(resultado.itens[0].precoFinalSnapshot).toBe(100)
      expect(resultado.totais.total).toBe(200)
    }
  })

  it('promoção expirada NÃO é aplicada', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([
        [
          '1',
          produto({
            promocoes: [
              {
                tipo: 'percentual',
                valor: 50,
                dataInicio: '2020-01-01',
                dataFim: '2020-12-31',
                ativo: true,
              },
            ],
          }),
        ],
      ])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.itens[0].promocaoSnapshot).toBeNull()
      expect(resultado.itens[0].precoFinalSnapshot).toBe(100)
      expect(resultado.totais.valorPromocao).toBe(0)
    }
  })

  it('promoção vigente é aplicada com snapshot', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([
        [
          '1',
          produto({
            promocoes: [
              {
                tipo: 'percentual',
                valor: 20,
                dataInicio: '2020-01-01',
                dataFim: '2099-12-31',
                ativo: true,
              },
            ],
          }),
        ],
      ])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.itens[0].promocaoSnapshot).toBe('20% OFF')
      expect(resultado.itens[0].precoFinalSnapshot).toBe(80)
      expect(resultado.totais.valorPromocao).toBe(20)
    }
  })

  it('quantidade inválida bloqueia', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([['1', produto()]])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 0,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erros[0]).toContain(
        'Quantidade inválida',
      )
    }
  })

  it('produto inexistente bloqueia', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([['1', produto()]])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: 'nao-existe',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(false)
  })

  it('estoque insuficiente bloqueia a intenção', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([['1', produto({ estoque: 2 })]]
      )
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 3,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erros[0]).toContain(
        'Estoque insuficiente',
      )
    }
  })

  it('kit com componente esgotado bloqueia', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([
        [
          'kit',
          produto({
            id: 'kit',
            nome: 'Kit',
            composicao: [
              { produtoId: 'a', quantidade: 1 },
              { produtoId: 'b', quantidade: 1 },
            ],
            estoque: null,
          }),
        ],
        ['a', produto({ id: 'a', nome: 'A', estoque: 10 })],
        [
          'b',
          produto({ id: 'b', nome: 'B', estoque: 0 }),
        ],
      ])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: 'kit',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erros.join(' ')).toContain('b')
    }
  })

  it('sob consulta (estoque desconhecido) bloqueia', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([
        ['1', produto({ estoque: null })],
      ])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(false)
  })

  it('variante exige seleção ativa', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([
        [
          '1',
          produto({
            variantes: [
              {
                id: 'v1',
                sku: 'VAR-1',
                preco: 150,
                ativo: true,
              },
              {
                id: 'v2',
                sku: 'VAR-2',
                preco: 200,
                ativo: false,
              },
            ],
          }),
        ],
      ])
    const semVariante = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(semVariante.ok).toBe(false)

    const inativa = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: 'v2',
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(inativa.ok).toBe(false)

    const valida = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: 'v1',
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(valida.ok).toBe(true)
    if (valida.ok) {
      expect(valida.itens[0].precoBaseSnapshot).toBe(150)
      expect(valida.itens[0].skuSnapshot).toBe('VAR-1')
    }
  })

  it('intenção vazia bloqueia', () => {
    const resultado = revalidarIntencao(
      intencao([]),
      new Map(),
    )
    expect(resultado.ok).toBe(false)
  })
})

describe('pedido a partir de orçamento', () => {
  it('só aceita orçamento ACEITO', () => {
    for (const status of [
      'rascunho',
      'enviado',
      'recusado',
      'expirado',
    ]) {
      expect(
        itensDeOrcamentoParaIntencao({
          status,
          itens: [],
        }),
      ).toBeNull()
    }
    expect(
      itensDeOrcamentoParaIntencao({
        status: 'aceito',
        itens: [
          {
            produto: { id: '1' },
            varianteId: null,
            quantidade: 2,
          },
        ],
      }),
    ).toEqual([
      {
        produtoId: '1',
        varianteId: null,
        quantidade: 2,
      },
    ])
  })
})

describe('snapshot imutável', () => {
  it('pedido validado não muda quando o catálogo muda', () => {
    const catalogo: CatalogoRevalidacao =
      new Map([['1', produto()]])
    const resultado = revalidarIntencao(
      intencao([
        {
          produtoId: '1',
          varianteId: null,
          quantidade: 1,
        },
      ]),
      catalogo,
    )
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return

    // O catálogo muda depois da validação...
    const catalogoMutado: CatalogoRevalidacao =
      new Map([
        ['1', produto({ precoBase: 999, estoque: 0 })],
      ])
    const estoqueMutado = catalogoEstoqueDe(
      catalogoMutado,
    )
    expect(
      estoqueMutado.get('1::')?.disponivel,
    ).toBe(0)

    // ...mas o snapshot do pedido preserva
    // o que foi validado.
    expect(resultado.itens[0].precoBaseSnapshot).toBe(100)
    expect(resultado.itens[0].precoFinalSnapshot).toBe(100)
    expect(resultado.totais.total).toBe(100)
  })
})
