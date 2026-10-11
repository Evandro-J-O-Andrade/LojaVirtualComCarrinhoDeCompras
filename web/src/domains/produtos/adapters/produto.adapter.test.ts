import { describe, expect, it } from 'vitest'
import { ProdutoCatalogAdapter } from './produto.adapter'
import {
  ProdutoTableMissingError,
  type ProdutoRepository,
} from '../repositories/produto.repository'
import type {
  CategoriaRef,
  Produto,
  ProdutoFiltro,
} from '../model/produto'

class MissingTableRepository implements ProdutoRepository {
  async listProdutos(): Promise<Produto[]> {
    throw new ProdutoTableMissingError()
  }
  async getProdutoBySlug(): Promise<Produto | null> {
    throw new ProdutoTableMissingError()
  }
  async getProdutosRelacionados(): Promise<Produto[]> {
    throw new ProdutoTableMissingError()
  }
  async listCategorias(): Promise<CategoriaRef[]> {
    throw new ProdutoTableMissingError()
  }
}

class BrokenRepository implements ProdutoRepository {
  async listProdutos(): Promise<Produto[]> {
    throw new Error('network down')
  }
  async getProdutoBySlug(): Promise<Produto | null> {
    throw new Error('network down')
  }
  async getProdutosRelacionados(): Promise<Produto[]> {
    throw new Error('network down')
  }
  async listCategorias(): Promise<CategoriaRef[]> {
    throw new Error('network down')
  }
}

class RealRepository implements ProdutoRepository {
  async listProdutos(): Promise<Produto[]> {
    return [
      {
        id: 'r1',
        sku: 'REAL-001',
        nome: 'Produto Real',
        slug: 'produto-real',
        descricao: null,
        precoBase: 50,
        imagens: [],
        categorias: [],
        fornecedor: null,
        variantes: [],
        promocoes: [],
        estoque: null,
        avaliacao: null,
        comoUsar: null,
        informacoes: null,
        composicao: [],
        ativo: true,
        source: 'supabase',
      },
    ]
  }
  async getProdutoBySlug(): Promise<Produto | null> {
    return null
  }
  async getProdutosRelacionados(): Promise<Produto[]> {
    return []
  }
  async listCategorias(): Promise<CategoriaRef[]> {
    return [{ id: 'c1', nome: 'Real', slug: 'real' }]
  }
}

describe('ProdutoCatalogAdapter', () => {
  it('serve o catálogo editorial quando a tabela não existe', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    const produtos = await adapter.listProdutos()
    expect(produtos.length).toBeGreaterThan(0)
    expect(produtos.every((p) => p.source === 'editorial')).toBe(true)
  })

  it('filtra o editorial por busca', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    const filtro: ProdutoFiltro = { search: 'batom' }
    const produtos = await adapter.listProdutos(filtro)
    expect(produtos.map((p) => p.slug)).toEqual([
      'batom-liquido-matte',
    ])
  })

  it('filtra o editorial por categoria', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    const filtro: ProdutoFiltro = { categoriaSlug: 'casa' }
    const produtos = await adapter.listProdutos(filtro)
    expect(produtos.map((p) => p.slug)).toEqual([
      'toalha-de-banhao-algodao',
    ])
  })

  it('devolve o produto editorial pelo slug', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    const produto = await adapter.getProdutoBySlug(
      'perfume-eau-de-parfum',
    )
    expect(produto?.nome).toBe('Perfume Eau de Parfum')
    expect(produto?.variantes.length).toBeGreaterThan(0)
  })

  it('devolve null para slug inexistente no editorial', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    await expect(
      adapter.getProdutoBySlug('slug-inexistente'),
    ).resolves.toBeNull()
  })

  it('relaciona por categoria compartilhada, excluindo o atual', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    const relacionados = await adapter.getProdutosRelacionados(
      'perfume-eau-de-parfum',
      4,
    )
    expect(relacionados.length).toBe(4)
    expect(
      relacionados.some((p) => p.slug === 'perfume-eau-de-parfum'),
    ).toBe(false)
    expect(
      relacionados.every((p) =>
        p.categorias.some((c) => c.slug === 'beleza-e-maquiagem'),
      ),
    ).toBe(true)
  })

  it('lista categorias do editorial sem duplicatas', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new MissingTableRepository(),
    )
    const categorias = await adapter.listCategorias()
    const slugs = categorias.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toContain('casa')
    expect(slugs).toContain('fragrancias')
  })

  it('expõe dados reais quando o backend responde', async () => {
    const adapter = new ProdutoCatalogAdapter(new RealRepository())
    const produtos = await adapter.listProdutos()
    expect(produtos).toHaveLength(1)
    expect(produtos[0].slug).toBe('produto-real')
    const categorias = await adapter.listCategorias()
    expect(categorias).toEqual([
      { id: 'c1', nome: 'Real', slug: 'real' },
    ])
  })

  it('propaga erros inesperados em vez de mascará-los', async () => {
    const adapter = new ProdutoCatalogAdapter(
      new BrokenRepository(),
    )
    await expect(adapter.listProdutos()).rejects.toThrow(
      'network down',
    )
    await expect(
      adapter.getProdutoBySlug('qualquer'),
    ).rejects.toThrow('network down')
  })
})
