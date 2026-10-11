import type { Service } from '../model/service'
import { EDITORIAL_SERVICES } from './editorial-catalog'
import {
  ServiceTableMissingError,
  type ServiceRepository,
} from '../repositories/service.repository'

function toEditorialService(entry: (typeof EDITORIAL_SERVICES)[number]): Service {
  return {
    id: `editorial-${entry.slug}`,
    slug: entry.slug,
    nome: entry.nome,
    descricao: entry.descricao,
    duracaoMinutos: null,
    preco: null,
    imagemCapa: entry.imagemCapa,
    video: entry.video ?? null,
    publicoAlvo: null,
    preparacao: null,
    requerAgendamento: true,
    requerConfirmacao: true,
    source: 'editorial',
  }
}

export class ServiceCatalogAdapter implements ServiceRepository {
  private readonly database: ServiceRepository

  constructor(database: ServiceRepository) {
    this.database = database
  }

  async listServices(): Promise<Service[]> {
    try {
      return await this.database.listServices()
    } catch (error) {
      if (error instanceof ServiceTableMissingError) {
        return EDITORIAL_SERVICES.map(toEditorialService)
      }
      throw error
    }
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    try {
      return await this.database.getServiceBySlug(slug)
    } catch (error) {
      if (error instanceof ServiceTableMissingError) {
        const entry = EDITORIAL_SERVICES.find((item) => item.slug === slug)
        return entry ? toEditorialService(entry) : null
      }
      throw error
    }
  }
}
