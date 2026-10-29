import type { CategoriaRef, Produto, ProdutoFiltro } from '../model/produto'
import { EDITORIAL_CATALOGO } from './editorial-catalog'
import {
  ProdutoTableMissingError,
  type ProdutoRepository,
  type ProdutoInput,
} from '../repositories/produto.repository'

function filtrar(
  produtos: Produto[],
  filtro?: ProdutoFiltro,
): Produto[] {
  let resultado = produtos
  if (filtro?.search) {
    const busca = filtro.search.toLowerCase()
    resultado = resultado.filter((produto) =>
      produto.nome.toLowerCase().includes(busca),
    )
  }
  if (filtro?.categoriaSlug) {
    resultado = resultado.filter((produto) =>
      produto.categorias.some(
        (categoria) => categoria.slug === filtro.categoriaSlug,
      ),
    )
  }
  return resultado
}

export class ProdutoCatalogAdapter implements ProdutoRepository {
  private readonly database: ProdutoRepository

  constructor(database: ProdutoRepository) {
    this.database = database
  }

  async listProdutos(filtro?: ProdutoFiltro): Promise<Produto[]> {
    try {
      return await this.database.listProdutos(filtro)
    } catch (error) {
      if (error instanceof ProdutoTableMissingError) {
        return filtrar(EDITORIAL_CATALOGO, filtro)
      }
      throw error
    }
  }

  async getProdutoBySlug(slug: string): Promise<Produto | null> {
    try {
      return await this.database.getProdutoBySlug(slug)
    } catch (error) {
      if (error instanceof ProdutoTableMissingError) {
        return (
          EDITORIAL_CATALOGO.find((produto) => produto.slug === slug) ??
          null
        )
      }
      throw error
    }
  }

  async getProdutosRelacionados(
    slug: string,
    limit = 4,
  ): Promise<Produto[]> {
    try {
      return await this.database.getProdutosRelacionados(slug, limit)
    } catch (error) {
      if (error instanceof ProdutoTableMissingError) {
        const atual = EDITORIAL_CATALOGO.find(
          (produto) => produto.slug === slug,
        )
        const categorias = new Set(
          (atual?.categorias ?? []).map((categoria) => categoria.slug),
        )
        return EDITORIAL_CATALOGO.filter(
          (produto) =>
            produto.slug !== slug &&
            produto.categorias.some((categoria) =>
              categorias.has(categoria.slug),
            ),
        ).slice(0, limit)
      }
      throw error
    }
  }

  async listCategorias(): Promise<CategoriaRef[]> {
    try {
      return await this.database.listCategorias()
    } catch (error) {
      if (error instanceof ProdutoTableMissingError) {
        const mapa = new Map<string, CategoriaRef>()
        for (const produto of EDITORIAL_CATALOGO) {
          for (const categoria of produto.categorias) {
            if (!mapa.has(categoria.slug)) {
              mapa.set(categoria.slug, categoria)
            }
          }
        }
        return [...mapa.values()]
      }
      throw error
    }
  }

  async createProduto(data: ProdutoInput): Promise<Produto> {
    return this.database.createProduto(data)
  }

  async updateProduto(id: string, data: ProdutoInput): Promise<Produto> {
    return this.database.updateProduto(id, data)
  }

  async deleteProduto(id: string): Promise<void> {
    return this.database.deleteProduto(id)
  }
}
