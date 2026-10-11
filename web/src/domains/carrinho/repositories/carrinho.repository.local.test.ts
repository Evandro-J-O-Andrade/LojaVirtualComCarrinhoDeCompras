import { describe, it, expect, beforeEach } from 'vitest'
import { LocalCarrinhoRepository } from './carrinho.repository.local'
import { CARRINHO_STORAGE_KEY } from '../model/carrinho'
import type { CarrinhoItem } from '../model/carrinho'

/**
 * Contrato de persistência do carrinho:
 *
 *   recarregar a página não perde o carrinho
 *   variante e snapshot de preço sobrevivem
 *   armazenamento corrompido nunca quebra a loja
 */

const item = (
  sobrescritas: Partial<CarrinhoItem> = {},
): CarrinhoItem => ({
  produto: {
    id: 'p1',
    slug: 'batom-liquido-matte',
    nome: 'Batom Líquido Matte',
    preco: 34.9,
    imagem: null,
  },
  varianteId: 'v1',
  varianteSku: 'ANG-BAT-001-VLR',
  atributosTexto: 'cor: Vermelho Rubi',
  quantidade: 2,
  precoBaseUnitario: 34.9,
  precoUnitario: 29.67,
  promocao: { rotulo: '15% OFF', dataFim: '2026-12-31' },
  disponibilidade: 'em_estoque',
  composto: false,
  ...sobrescritas,
})

describe('LocalCarrinhoRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persiste e recupera variante e snapshot de preço', () => {
    const repositorio = new LocalCarrinhoRepository()
    repositorio.salvar({
      itens: [item()],
      source: 'local',
    })

    const carregado = repositorio.carregar()
    expect(carregado.itens).toHaveLength(1)
    expect(carregado.itens[0].varianteId).toBe('v1')
    expect(carregado.itens[0].varianteSku).toBe(
      'ANG-BAT-001-VLR',
    )
    expect(carregado.itens[0].atributosTexto).toBe(
      'cor: Vermelho Rubi',
    )
    expect(carregado.itens[0].precoBaseUnitario).toBe(34.9)
    expect(carregado.itens[0].precoUnitario).toBe(29.67)
    expect(carregado.source).toBe('local')
  })

  it('JSON corrompido não quebra a loja', () => {
    localStorage.setItem(
      CARRINHO_STORAGE_KEY,
      '{não é json válido',
    )
    const repositorio = new LocalCarrinhoRepository()
    expect(repositorio.carregar().itens).toEqual([])
  })

  it('itens malformados são descartados; válidos permanecem', () => {
    const malformado = {
      produto: 'não é objeto',
      quantidade: 2,
    }
    const semPreco = item({
      precoUnitario: 'quebra' as unknown as number,
    })
    localStorage.setItem(
      CARRINHO_STORAGE_KEY,
      JSON.stringify({
        itens: [malformado, semPreco, item()],
      }),
    )

    const carregado = new LocalCarrinhoRepository().carregar()
    expect(carregado.itens).toHaveLength(1)
    expect(carregado.itens[0].produto.id).toBe('p1')
    expect(carregado.itens[0].quantidade).toBe(2)
  })

  it('limpar remove o carrinho persistido', () => {
    const repositorio = new LocalCarrinhoRepository()
    repositorio.salvar({
      itens: [item()],
      source: 'local',
    })
    repositorio.limpar()
    expect(repositorio.carregar().itens).toEqual([])
    expect(
      localStorage.getItem(CARRINHO_STORAGE_KEY),
    ).toBeNull()
  })
})
