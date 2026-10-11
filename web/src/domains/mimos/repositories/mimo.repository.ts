import type { Mimo } from '../model/mimo'

export class MimoTableMissingError extends Error {
  readonly code = 'MIMO_TABLE_MISSING' as const

  constructor(message = 'A tabela mimo ainda não existe no banco.') {
    super(message)
    this.name = 'MimoTableMissingError'
  }
}

export interface MimoRepository {
  listMimos(): Promise<Mimo[]>
  getMimoBySlug(slug: string): Promise<Mimo | null>
  listMimosPorProduto(produtoSlug: string): Promise<Mimo[]>
}
