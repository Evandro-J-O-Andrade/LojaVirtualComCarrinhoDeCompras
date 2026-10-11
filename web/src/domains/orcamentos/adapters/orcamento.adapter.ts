import type {
  AcaoOrcamento,
  CondicaoPagamento,
  DescontoComercial,
  Orcamento,
  OrcamentoEntrada,
} from '../model/orcamento'
import {
  OrcamentoTableMissingError,
  type OrcamentoRepository,
} from '../repositories/orcamento.repository'
import { SupabaseOrcamentoRepository } from '../repositories/orcamento.repository.supabase'
import { LocalOrcamentoRepository } from '../repositories/orcamento.repository.local'

/**
 * Adapter orçamento: tenta o Supabase; quando a tabela
 * ainda não existe (Etapa 8 não autorizada), degrada para
 * o repositório local — rascunhos no navegador, marcados
 * com source: 'local'. Nunca finge persistência de backend.
 */
export class OrcamentoAdapter implements OrcamentoRepository {
  private readonly database: OrcamentoRepository
  private readonly local: OrcamentoRepository

  constructor(
    database: OrcamentoRepository = new SupabaseOrcamentoRepository(),
    local: OrcamentoRepository = new LocalOrcamentoRepository(),
  ) {
    this.database = database
    this.local = local
  }

  private async comFallback(
    acao: (repositorio: OrcamentoRepository) => Promise<Orcamento>,
  ): Promise<Orcamento> {
    try {
      return await acao(this.database)
    } catch (error) {
      if (error instanceof OrcamentoTableMissingError) {
        return acao(this.local)
      }
      throw error
    }
  }

  private async comFallbackNulo(
    acao: (repositorio: OrcamentoRepository) => Promise<Orcamento | null>,
  ): Promise<Orcamento | null> {
    try {
      return await acao(this.database)
    } catch (error) {
      if (error instanceof OrcamentoTableMissingError) {
        return acao(this.local)
      }
      throw error
    }
  }

  criarOrcamento(entrada: OrcamentoEntrada): Promise<Orcamento> {
    return this.comFallback((repositorio) =>
      repositorio.criarOrcamento(entrada),
    )
  }

  getOrcamento(id: string): Promise<Orcamento | null> {
    return this.comFallbackNulo((repositorio) =>
      repositorio.getOrcamento(id),
    )
  }

  async listOrcamentos(): Promise<Orcamento[]> {
    try {
      return await this.database.listOrcamentos()
    } catch (error) {
      if (error instanceof OrcamentoTableMissingError) {
        return this.local.listOrcamentos()
      }
      throw error
    }
  }

  executarAcao(
    id: string,
    acao: AcaoOrcamento,
    ator: string | null,
  ): Promise<Orcamento> {
    return this.comFallback((repositorio) =>
      repositorio.executarAcao(id, acao, ator),
    )
  }

  aplicarDescontoComercial(
    id: string,
    desconto: DescontoComercial,
    ator: string | null,
  ): Promise<Orcamento> {
    return this.comFallback((repositorio) =>
      repositorio.aplicarDescontoComercial(id, desconto, ator),
    )
  }

  definirCondicaoPagamento(
    id: string,
    condicao: CondicaoPagamento,
  ): Promise<Orcamento> {
    return this.comFallback((repositorio) =>
      repositorio.definirCondicaoPagamento(id, condicao),
    )
  }
}
