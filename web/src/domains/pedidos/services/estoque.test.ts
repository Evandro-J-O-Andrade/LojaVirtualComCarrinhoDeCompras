import { describe, expect, it } from 'vitest'
import {
  chaveEstoque,
  devolverEstoque,
  expandirNecessidades,
  reservarEstoque,
  type CatalogoEstoque,
} from './estoque'

function catalogo(
  entradas: Array<{
    produtoId: string
    disponivel: number | null
    composicao?: Array<{
      produtoId: string
      quantidade: number
    }>
  }>,
): CatalogoEstoque {
  const mapa: CatalogoEstoque = new Map()
  for (const entrada of entradas) {
    mapa.set(chaveEstoque(entrada.produtoId, null), {
      disponivel: entrada.disponivel,
      composicao: entrada.composicao ?? [],
    })
  }
  return mapa
}

describe('expandirNecessidades (fan-out de kit)', () => {
  it('kit × 2 com A×2, B×1 exige A×4, B×2', () => {
    const cat = catalogo([
      {
        produtoId: 'kit',
        disponivel: null,
        composicao: [
          { produtoId: 'a', quantidade: 2 },
          { produtoId: 'b', quantidade: 1 },
        ],
      },
    ])
    const expandidas = expandirNecessidades(
      [
        {
          produtoId: 'kit',
          varianteId: null,
          quantidade: 2,
        },
      ],
      cat,
    )
    expect(expandidas.get(chaveEstoque('a', null))).toEqual(
      {
        produtoId: 'a',
        varianteId: null,
        quantidade: 4,
      },
    )
    expect(expandidas.get(chaveEstoque('b', null))).toEqual(
      {
        produtoId: 'b',
        varianteId: null,
        quantidade: 2,
      },
    )
    // O kit em si não gera necessidade de estoque.
    expect(
      expandidas.has(chaveEstoque('kit', null)),
    ).toBe(false)
  })
})

describe('reserva atômica', () => {
  it('reserva quando tudo está disponível', () => {
    const cat = catalogo([
      { produtoId: 'a', disponivel: 10 },
      { produtoId: 'b', disponivel: 5 },
    ])
    const resultado = reservarEstoque(
      [
        {
          produtoId: 'a',
          varianteId: null,
          quantidade: 3,
        },
        {
          produtoId: 'b',
          varianteId: null,
          quantidade: 2,
        },
      ],
      cat,
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.reservas).toHaveLength(2)
    }
  })

  it('estoque insuficiente bloqueia', () => {
    const cat = catalogo([
      { produtoId: 'a', disponivel: 2 },
    ])
    const resultado = reservarEstoque(
      [
        {
          produtoId: 'a',
          varianteId: null,
          quantidade: 3,
        },
      ],
      cat,
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erros[0].motivo).toBe('insuficiente')
    }
  })

  it('kit: se faltar UM componente, NENHUM é reservado', () => {
    const cat = catalogo([
      {
        produtoId: 'kit',
        disponivel: null,
        composicao: [
          { produtoId: 'a', quantidade: 1 },
          { produtoId: 'b', quantidade: 1 },
        ],
      },
      { produtoId: 'a', disponivel: 10 },
      // b tem estoque insuficiente
      { produtoId: 'b', disponivel: 0 },
    ])
    const resultado = reservarEstoque(
      [
        {
          produtoId: 'kit',
          varianteId: null,
          quantidade: 1,
        },
      ],
      cat,
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erros).toHaveLength(1)
      expect(resultado.erros[0].produtoId).toBe('b')
    }
  })

  it('disponibilidade desconhecida (sob consulta) bloqueia', () => {
    const cat = catalogo([
      { produtoId: 'a', disponivel: null },
    ])
    const resultado = reservarEstoque(
      [
        {
          produtoId: 'a',
          varianteId: null,
          quantidade: 1,
        },
      ],
      cat,
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erros[0].motivo).toBe('desconhecido')
    }
  })
})

describe('devolverEstoque', () => {
  it('devolve as reservas ao estoque', () => {
    const cat = catalogo([
      { produtoId: 'a', disponivel: 7 },
    ])
    const devolvido = devolverEstoque(cat, [
      {
        produtoId: 'a',
        varianteId: null,
        quantidade: 3,
      },
    ])
    expect(
      devolvido.get(chaveEstoque('a', null))?.disponivel,
    ).toBe(10)
  })
})
