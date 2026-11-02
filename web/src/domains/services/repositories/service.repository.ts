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
  listAllServices?(): Promise<Service[]>
  createService?(input: ServiceInput): Promise<Service>
  updateService?(id: string, input: Partial<ServiceInput>): Promise<Service>
  deleteService?(id: string): Promise<void>
}

export interface ServiceInput {
  nome: string
  slug: string
  descricao?: string | null
  duracaoMinutos?: number | null
  preco?: number | null
  imagemCapa?: string | null
  video?: string | null
  publicoAlvo?: string | null
  preparacao?: string | null
  requerAgendamento?: boolean
  requerConfirmacao?: boolean
  ativo?: boolean
}
