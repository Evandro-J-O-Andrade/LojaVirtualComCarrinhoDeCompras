import {
  ORCAMENTO_STORAGE_KEY,
  agoraISO,
  hojeISODate,
  calcularTotais,
  gerarProtocolo,
  type AcaoOrcamento,
  type CondicaoPagamento,
  type DescontoComercial,
  type EventoOrcamento,
  type Orcamento,
  type OrcamentoEntrada,
  type OrcamentoStatus,
} from '../model/orcamento'
import {
  OrcamentoTableMissingError,
  type OrcamentoRepository,
} from './orcamento.repository'

/**
 * Rascunhos locais: fallback honesto enquanto as
 * tabelas de orçamento não existem no Supabase.
 * O dado vive no navegador e é marcado com
 * source: 'local' — nunca finge persistência
 * de backend. Quando a Etapa 8 for autorizada,
 * o adapter passa a apontar para as tabelas
 * reais sem mudar o contrato.
 */
export class LocalOrcamentoRepository
  implements OrcamentoRepository
{
 private sequencial = 1

  private ler(): Orcamento[] {
    try {
      const salvo = localStorage.getItem(
        ORCAMENTO_STORAGE_KEY,
      )
      if (!salvo) return []
      const parsed = JSON.parse(salvo) as Orcamento[]
      this.sequencial = Math.max(
        this.sequencial,
        ...parsed.map((orcamento) => {
          const partes = orcamento.id.split('-')
          const numero = Number(
            partes[partes.length - 1],
          )
          return Number.isFinite(numero) ? numero : 0
        }),
      )
      return parsed
    } catch {
      return []
    }
  }

  private salvar(orcamentos: Orcamento[]): void {
    try {
      localStorage.setItem(
        ORCAMENTO_STORAGE_KEY,
        JSON.stringify(orcamentos),
      )
    } catch {
      // Armazenamento indisponível: o rascunho
      // vive em memória durante a sessão.
    }
  }

  private async criar(
    entrada: OrcamentoEntrada,
  ): Promise<Orcamento> {
    const numero = this.sequencial
    this.sequencial += 1
    const id = `local-${Date.now()}-${numero}`
    const agora = agoraISO()
    const totais = calcularTotais(entrada.itens, null)
    const orcamento: Orcamento = {
      id,
      protocolo: gerarProtocolo(hojeISODate(), numero),
      cliente: entrada.cliente,
      itens: entrada.itens,
      observacoes: entrada.observacoes,
      subtotal: totais.subtotal,
      valorPromocao: totais.valorPromocao,
      subtotalOfertado: totais.subtotalOfertado,
      descontoComercial: null,
      valorDescontoComercial: 0,
      frete: totais.frete,
      total: totais.total,
      validade: entrada.validade,
      condicaoPagamento: null,
      status: 'rascunho',
      pedidoId: null,
      criadoEm: agora,
      atualizadoEm: agora,
      historico: [
        {
          em: agora,
          statusAnterior: null,
          statusNovo: 'rascunho',
          ator: null,
        },
      ],
      source: 'local',
    }
    const orcamentos = this.ler()
    orcamentos.unshift(orcamento)
    this.salvar(orcamentos)
    return orcamento
  }

  async criarOrcamento(
    entrada: OrcamentoEntrada,
  ): Promise<Orcamento> {
    return this.criar(entrada)
  }

  async getOrcamento(id: string): Promise<Orcamento | null> {
    return (
      this.ler().find((orcamento) => orcamento.id === id) ??
      null
    )
  }

  async listOrcamentos(): Promise<Orcamento[]> {
    return this.ler()
  }

  private registrarTransicao(
    orcamento: Orcamento,
    statusNovo: OrcamentoStatus,
    ator: string | null,
  ): Orcamento {
    const evento: EventoOrcamento = {
      em: agoraISO(),
      statusAnterior: orcamento.status,
      statusNovo,
      ator,
    }
    return {
      ...orcamento,
      status: statusNovo,
      atualizadoEm: evento.em,
      historico: [...orcamento.historico, evento],
    }
  }

  private persistir(atualizado: Orcamento): Orcamento {
    const orcamentos = this.ler()
    const indice = orcamentos.findIndex(
      (orcamento) => orcamento.id === atualizado.id,
    )
    if (indice >= 0) {
      orcamentos[indice] = atualizado
      this.salvar(orcamentos)
    }
    return atualizado
  }

  async executarAcao(
    id: string,
    acao: AcaoOrcamento,
    ator: string | null,
  ): Promise<Orcamento> {
    const atual = await this.getOrcamento(id)
    if (!atual) throw new OrcamentoTableMissingError()

    let atualizado: Orcamento = atual
    if (acao === 'enviar') {
      atualizado = this.registrarTransicao(
        atual,
        'enviado',
        ator,
      )
    } else if (acao === 'aprovar') {
      atualizado = this.registrarTransicao(
        atual,
        'aceito',
        ator,
      )
    } else if (acao === 'recusar') {
      atualizado = this.registrarTransicao(
        atual,
        'recusado',
        ator,
      )
    } else if (acao === 'converter') {
      // Conversão em pedido: registra o vínculo e
      // o evento; o pedido em si é a Fatia 7.
      atualizado = {
        ...atual,
        pedidoId: `local-pedido-${Date.now()}`,
        atualizadoEm: agoraISO(),
        historico: [
          ...atual.historico,
          {
            em: agoraISO(),
            statusAnterior: atual.status,
            statusNovo: atual.status,
            ator,
          },
        ],
      }
    }
    // 'salvar' mantém o rascunho como está.
    return this.persistir(atualizado)
  }

  async aplicarDescontoComercial(
    id: string,
    desconto: DescontoComercial,
    ator: string | null,
  ): Promise<Orcamento> {
    const atual = await this.getOrcamento(id)
    if (!atual) throw new OrcamentoTableMissingError()

    const totais = calcularTotais(
      atual.itens,
      desconto,
      atual.frete,
    )
    const atualizado: Orcamento = {
      ...atual,
      descontoComercial: desconto,
      valorDescontoComercial: totais.valorDescontoComercial,
      subtotal: totais.subtotal,
      valorPromocao: totais.valorPromocao,
      subtotalOfertado: totais.subtotalOfertado,
      total: totais.total,
      atualizadoEm: agoraISO(),
      historico: [
        ...atual.historico,
        {
          em: agoraISO(),
          statusAnterior: atual.status,
          statusNovo: atual.status,
          ator,
        },
      ],
    }
    return this.persistir(atualizado)
  }

  async definirCondicaoPagamento(
    id: string,
    condicao: CondicaoPagamento,
  ): Promise<Orcamento> {
    const atual = await this.getOrcamento(id)
    if (!atual) throw new OrcamentoTableMissingError()
    const atualizado: Orcamento = {
      ...atual,
      condicaoPagamento: condicao,
      atualizadoEm: agoraISO(),
    }
    return this.persistir(atualizado)
  }
}
