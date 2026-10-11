import type { Service } from '../model/service'

export class ServiceTableMissingError extends Error {
  readonly code = 'SERVICE_TABLE_MISSING' as const

  constructor(message = 'A tabela servico ainda não existe no banco.') {
    super(message)
    this.name = 'ServiceTableMissingError'
  }
}

export interface ServiceRepository {
  listServices(): Promise<Service[]>
  getServiceBySlug(slug: string): Promise<Service | null>
}
