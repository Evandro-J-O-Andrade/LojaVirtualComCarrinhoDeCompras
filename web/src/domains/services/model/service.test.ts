import { describe, expect, it } from 'vitest'
import {
  formatServiceDuration,
  resolveServiceCta,
  servicePriceLabel,
  serviceTimeRequired,
  type Service,
} from './service'
import { ServiceCatalogAdapter } from '../adapters/service.adapter'
import {
  ServiceTableMissingError,
  type ServiceRepository,
} from '../repositories/service.repository'

function makeService(overrides: Partial<Service>): Service {
  return {
    id: '1',
    slug: 'servico-teste',
    nome: 'Serviço de Teste',
    descricao: null,
    duracaoMinutos: null,
    preco: null,
    imagemCapa: null,
    video: null,
    publicoAlvo: null,
    preparacao: null,
    requerAgendamento: true,
    requerConfirmacao: true,
    source: 'supabase',
    ...overrides,
  }
}

describe('Service view-model', () => {
  it('deriva CTA de agendar somente com preço conhecido', () => {
    const service = makeService({ preco: 120, requerAgendamento: true })
    expect(resolveServiceCta(service)).toBe('agendar')
  })

  it('deriva sob consulta quando o preço é desconhecido', () => {
    const service = makeService({ preco: null, requerAgendamento: true })
    expect(resolveServiceCta(service)).toBe('sob-consulta')
  })

  it('deriva atendimento presencial quando não requer agendamento', () => {
    const service = makeService({ requerAgendamento: false })
    expect(resolveServiceCta(service)).toBe('atendimento-presencial')
  })

  it('formata duração somente quando conhecida', () => {
    expect(formatServiceDuration(null)).toBeNull()
    expect(formatServiceDuration(45)).toBe('45 min')
    expect(formatServiceDuration(60)).toBe('1h')
    expect(formatServiceDuration(90)).toBe('1h30')
  })

  it('exibe sob consulta sem inventar preço', () => {
    expect(servicePriceLabel(null)).toBe('Sob consulta')
    expect(servicePriceLabel(120)).toMatch(/^R\$\s120,00$/)
  })

  it('gera timeRequired em ISO-8601 somente quando conhecido', () => {
    expect(serviceTimeRequired(null)).toBeNull()
    expect(serviceTimeRequired(45)).toBe('PT45M')
    expect(serviceTimeRequired(90)).toBe('PT1H30M')
  })
})

class MissingTableRepository implements ServiceRepository {
  async listServices(): Promise<Service[]> {
    throw new ServiceTableMissingError()
  }

  async getServiceBySlug(): Promise<Service | null> {
    throw new ServiceTableMissingError()
  }
}

class FailingRepository implements ServiceRepository {
  async listServices(): Promise<Service[]> {
    throw new Error('network down')
  }

  async getServiceBySlug(): Promise<Service | null> {
    throw new Error('network down')
  }
}

describe('ServiceCatalogAdapter', () => {
  it('recua para o catálogo editorial somente quando a tabela não existe', async () => {
    const adapter = new ServiceCatalogAdapter(new MissingTableRepository())
    const services = await adapter.listServices()
    expect(services.length).toBeGreaterThan(0)
    expect(services.every((item) => item.source === 'editorial')).toBe(true)
    expect(services.every((item) => item.preco === null)).toBe(true)
    expect(services.every((item) => item.duracaoMinutos === null)).toBe(true)
  })

  it('propaga erros reais em vez de mascará-los como editorial', async () => {
    const adapter = new ServiceCatalogAdapter(new FailingRepository())
    await expect(adapter.listServices()).rejects.toThrow('network down')
  })

  it('retorna null para slug inexistente no catálogo editorial', async () => {
    const adapter = new ServiceCatalogAdapter(new MissingTableRepository())
    await expect(adapter.getServiceBySlug('nao-existente')).resolves.toBeNull()
  })

  it('preserva o invariante sob consulta no detalhe editorial', async () => {
    const adapter = new ServiceCatalogAdapter(new MissingTableRepository())
    const service = await adapter.getServiceBySlug('sessao-de-maquiagem')
    expect(service).not.toBeNull()
    expect(service?.preco).toBeNull()
    expect(resolveServiceCta(service!)).toBe('sob-consulta')
  })
})
