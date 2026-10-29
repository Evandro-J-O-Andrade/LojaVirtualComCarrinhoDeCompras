import type { Produto, ProdutoFiltro } from '../model/produto'

export class ProdutoTableMissingError extends Error {
  readonly code = 'PRODUTO_TABLE_MISSING' as const

  constructor(message = 'A tabela produto ainda não existe no banco.') {
    super(message)
    this.name = 'ProdutoTableMissingError'
  }
}

export interface ProdutoRepository {
  listProdutos(filtro?: ProdutoFiltro): Promise<Produto[]>
  getProdutoBySlug(slug: string): Promise<Produto | null>
  getProdutosRelacionados(slug: string, limit?: number): Promise<Produto[]>
  listCategorias(): Promise<Produto['categorias']>
  createProduto(data: ProdutoInput): Promise<Produto>
  updateProduto(id: string, data: ProdutoInput): Promise<Produto>
  deleteProduto(id: string): Promise<void>
}

export interface ProdutoInput {
  nome: string
  slug: string
  precoBase: number
  descricao?: string | null
  sku?: string | null
  ativo?: boolean
  fornecedorId?: string | null
  categoriaIds?: string[]
}
