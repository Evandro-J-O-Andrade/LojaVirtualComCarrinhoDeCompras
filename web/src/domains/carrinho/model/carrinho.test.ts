import { beforeEach, describe, expect, it } from 'vitest'
import type { Produto } from '@/domains/produtos/model/produto'
import {
  adicionarItem,
  chaveItem,
  contagem,
  montarItem,
  removerItem,
  subtotalBase,
  subtotalOfertado,
  atualizarQuantidade,
  valorPromocao,
  type CarrinhoItem,
} from './carrinho'

function produto(
  sobre: Partial<Produto> = {},
): Produto {
  return {
    id: '1',
    slug: 'produto-1',
    nome: 'Produto 1',
    precoBase: 100,
    sku: 'SKU-1',
    ativo: true,
    imagens: [],
    video: null,
    beneficio: null,
    historia: null,
    descricao: null,
    categorias: [],
    fornecedor: null,
    variantes: [],
    promocoes: [],
    estoque: { disponivel: 10 },
    avaliacao: null,
    comoUsar: null,
    informacoes: null,
    composicao: [],
    source: 'editorial',
    ...sobre,
  }
}

function variante(
  id: string,
  preco: number,
): Produto['variantes'][number] {
  return {
    id,
    sku: `VAR-${id}`,
    preco,
    ativo: true,
    peso: null,
    atributos: [
      { tipo: 'cor', valor: 'Vermelho' },
    ],
  }
}

describe('montarItem', () => {
  it('faz snapshot de preço base e ofertado', () => {
    const item = montarItem(produto(), null, 2)
    expect(item.precoBaseUnitario).toBe(100)
    expect(item.precoUnitario).toBe(100)
    expect(item.quantidade).toBe(2)
    expect(item.disponibilidade).toBe('em_estoque')
    expect(item.composto).toBe(false)
    expect(item.promocao).toBeNull()
  })

  it('usa o preço da variante como base', () => {
    const item = montarItem(
      produto(),
      variante('v1', 150),
      1,
    )
    expect(item.varianteId).toBe('v1')
    expect(item.varianteSku).toBe('VAR-v1')
    expect(item.precoBaseUnitario).toBe(150)
    expect(item.atributosTexto).toContain('Vermelho')
  })

  it('registra promoção vigente como informativa', () => {
    const item = montarItem(
      produto({
        promocoes: [
          {
            id: 'p1',
            tipo: 'percentual',
            valor: 20,
            dataInicio: '2020-01-01',
            dataFim: '2099-12-31',
            ativo: true,
          },
        ],
      }),
      null,
      1,
    )
    expect(item.precoBaseUnitario).toBe(100)
    expect(item.precoUnitario).toBe(80)
    expect(item.promocao?.rotulo).toBe('20% OFF')
  })

  it('sinaliza kit quando há componentes', () => {
    const item = montarItem(
      produto({
        composicao: [
          {
            id: '2',
            slug: 'componente',
            nome: 'Componente',
            preco: 10,
            imagem: null,
          },
        ],
      }),
      null,
      1,
    )
    expect(item.composto).toBe(true)
  })

  it('marca sob consulta sem estoque informado', () => {
    const item = montarItem(
      produto({ estoque: null }),
      null,
      1,
    )
    expect(item.disponibilidade).toBe('sob_consulta')
  })
})

describe('merge de itens', () => {
  it('mescla por produto+variante, nunca por nome', () => {
    const base = produto({ nome: 'Mesmo Nome' })
    const primeiro = montarItem(base, null, 1)
    const segundo = montarItem(base, variante('v1', 120), 2)
    const mesclados = adicionarItem(
      [primeiro],
      segundo,
    )
    expect(mesclados).toHaveLength(2)

    const duplicata = montarItem(base, null, 3)
    const mesclado = adicionarItem(
      [primeiro],
      duplicata,
    )
    expect(mesclado).toHaveLength(1)
    expect(mesclado[0].quantidade).toBe(4)
  })

  it('chave distingue variante nula de preenchida', () => {
    expect(chaveItem('1', null)).not.toBe(
      chaveItem('1', 'v1'),
    )
  })

  it('remove item por produto+variante', () => {
    const base = produto()
    const semVariante = montarItem(base, null, 1)
    const comVariante = montarItem(
      base,
      variante('v1', 120),
      1,
    )
    const itens = [semVariante, comVariante]
    expect(
      removerItem(itens, '1', 'v1'),
    ).toEqual([semVariante])
  })

  it('quantidade zero remove; positiva atualiza', () => {
    const item = montarItem(produto(), null, 2)
    expect(
      atualizarQuantidade([item], '1', null, 0),
    ).toEqual([])
    expect(
      atualizarQuantidade([item], '1', null, 5)
        [0].quantidade,
    ).toBe(5)
  })
})

describe('totais informativos', () => {
  it('calcula base, promoção e ofertado', () => {
    const semPromocao = montarItem(produto(), null, 2)
    const comPromocao = montarItem(
      produto({
        id: '2',
        slug: 'p2',
        promocoes: [
          {
            id: 'p1',
            tipo: 'percentual',
            valor: 50,
            dataInicio: '2020-01-01',
            dataFim: '2099-12-31',
            ativo: true,
          },
        ],
      }),
      null,
      1,
    )
    const itens: CarrinhoItem[] = [
      semPromocao,
      comPromocao,
    ]
    expect(subtotalBase(itens)).toBe(300)
    expect(valorPromocao(itens)).toBe(50)
    expect(subtotalOfertado(itens)).toBe(250)
    expect(contagem(itens)).toBe(3)
  })
})
