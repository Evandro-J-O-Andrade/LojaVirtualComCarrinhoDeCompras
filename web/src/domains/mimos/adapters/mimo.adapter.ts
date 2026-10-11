import type { Mimo } from '../model/mimo'
import { EDITORIAL_MIMOS } from './editorial-catalog'
import {
  MimoTableMissingError,
  type MimoRepository,
} from '../repositories/mimo.repository'

function toEditorialMimo(entry: (typeof EDITORIAL_MIMOS)[number]): Mimo {
  return {
    id: `editorial-${entry.slug}`,
    slug: entry.slug,
    nome: entry.nome,
    titulo: entry.titulo,
    descricao: entry.descricao,
    contexto: entry.contexto,
    imagem: entry.imagem,
    video: entry.video ?? null,
    seoTitulo: null,
    seoDescricao: null,
    produtos: [],
    kit: null,
    promocao: null,
    source: 'editorial',
  }
}

export class MimoCatalogAdapter implements MimoRepository {
  private readonly database: MimoRepository

  constructor(database: MimoRepository) {
    this.database = database
  }

  async listMimos(): Promise<Mimo[]> {
    try {
      return await this.database.listMimos()
    } catch (error) {
      if (error instanceof MimoTableMissingError) {
        return EDITORIAL_MIMOS.map(toEditorialMimo)
      }
      throw error
    }
  }

  async getMimoBySlug(slug: string): Promise<Mimo | null> {
    try {
      return await this.database.getMimoBySlug(slug)
    } catch (error) {
      if (error instanceof MimoTableMissingError) {
        const entry = EDITORIAL_MIMOS.find((item) => item.slug === slug)
        return entry ? toEditorialMimo(entry) : null
      }
      throw error
    }
  }

  async listMimosPorProduto(_produtoSlug: string): Promise<Mimo[]> {
    try {
      return await this.database.listMimosPorProduto(_produtoSlug)
    } catch (error) {
      if (error instanceof MimoTableMissingError) {
        // Curadorias editoriais não vinculam produtos: sem vínculo
        // real, não inventamos estado comercial.
        return []
      }
      throw error
    }
  }
}
