import type {
  AcaoOrcamento,
  CondicaoPagamento,
  DescontoComercial,
  Orcamento,
  OrcamentoEntrada,
  OrcamentoStatus,
} from '../model/orcamento'

export class OrcamentoTableMissingError extends Error {
  readonly code = 'ORCAMENTO_TABLE_MISSING' as const

  constructor(
    message = 'A tabela orcamento ainda não existe no banco.',
  ) {
    super(message)
    this.name = 'OrcamentoTableMissingError'
  }
}

export interface OrcamentoRepository {
  criarOrcamento(entrada: OrcamentoEntrada): Promise<Orcamento>
  getOrcamento(id: string): Promise<Orcamento | null>
  listOrcamentos(): Promise<Orcamento[]>
  executarAcao(
    id: string,
    acao: AcaoOrcamento,
    ator: string | null,
  ): Promise<Orcamento>
  aplicarDescontoComercial(
    id: string,
    desconto: DescontoComercial,
    ator: string | null,
  ): Promise<Orcamento>
  definirCondicaoPagamento(
    id: string,
    condicao: CondicaoPagamento,
  ): Promise<Orcamento>
}

export type { OrcamentoStatus }
