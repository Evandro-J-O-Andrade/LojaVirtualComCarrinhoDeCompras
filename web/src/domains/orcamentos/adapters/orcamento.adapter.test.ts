import { beforeEach, describe, expect, it } from 'vitest'
import {
  ORCAMENTO_STORAGE_KEY,
  gerarProtocolo,
  hojeISODate,
  isProtocoloOrcamento,
  type AcaoOrcamento,
  type Orcamento,
  type OrcamentoEntrada,
} from '../model/orcamento'
import { OrcamentoTableMissingError } from '../repositories/orcamento.repository'
import { LocalOrcamentoRepository } from '../repositories/orcamento.repository.local'
import { OrcamentoAdapter } from './orcamento.adapter'
import type { ProdutoRef } from '@/domains/produtos/model/produto'

function entrada(): OrcamentoEntrada {
  const produto: ProdutoRef = {
    id: '1',
    slug: 'kit-beleza',
    nome: 'Kit Beleza',
    preco: 120,
    imagem: null,
  }
  return {
    cliente: {
      nome: 'Ana',
      whatsapp: '11999999999',
      email: 'ana@email.com',
    },
    itens: [
      {
        produto,
        varianteId: null,
        varianteSku: null,
        atributosTexto: null,
        quantidade: 2,
        precoBaseUnitario: 120,
        precoUnitario: 100,
      },
    ],
    observacoes: 'para 15/12',
    validade: null,
  }
}

/** Repositório que simula as tabelas de orçamento inexistentes. */
class RepositorioSemTabela {
  async criarOrcamento(): Promise<Orcamento> {
    throw new OrcamentoTableMissingError()
  }
  async getOrcamento(): Promise<Orcamento | null> {
    throw new OrcamentoTableMissingError()
  }
  async listOrcamentos(): Promise<Orcamento[]> {
    throw new OrcamentoTableMissingError()
  }
  async executarAcao(): Promise<Orcamento> {
    throw new OrcamentoTableMissingError()
  }
  async aplicarDescontoComercial(): Promise<Orcamento> {
    throw new OrcamentoTableMissingError()
  }
  async definirCondicaoPagamento(): Promise<Orcamento> {
    throw new OrcamentoTableMissingError()
  }
}

describe('OrcamentoAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('degrada para o repositório local quando a tabela não existe', async () => {
    const adapter = new OrcamentoAdapter(
      new RepositorioSemTabela() as never,
      new LocalOrcamentoRepository(),
    )
    const orcamento = await adapter.criarOrcamento(entrada())
    expect(orcamento.source).toBe('local')
    expect(orcamento.status).toBe('rascunho')
    expect(orcamento.protocolo).toBe(
      gerarProtocolo(hojeISODate(), 1),
    )
    expect(isProtocoloOrcamento(orcamento.protocolo)).toBe(true)
    expect(orcamento.subtotalOfertado).toBe(200)
    expect(orcamento.total).toBe(200)
    expect(orcamento.observacoes).toBe('para 15/12')
  })

  it('persiste e lista rascunhos locais', async () => {
    const adapter = new OrcamentoAdapter(
      new RepositorioSemTabela() as never,
      new LocalOrcamentoRepository(),
    )
    const criado = await adapter.criarOrcamento(entrada())
    const lista = await adapter.listOrcamentos()
    expect(lista).toHaveLength(1)
    expect(lista[0].id).toBe(criado.id)

    const recuperado = await adapter.getOrcamento(criado.id)
    expect(recuperado?.cliente.nome).toBe('Ana')
  })

  it('transiciona status registrando histórico', async () => {
    const adapter = new OrcamentoAdapter(
      new RepositorioSemTabela() as never,
      new LocalOrcamentoRepository(),
    )
    const criado = await adapter.criarOrcamento(entrada())

    const enviado = await adapter.executarAcao(
      criado.id,
      'enviar' as AcaoOrcamento,
      null,
    )
    expect(enviado.status).toBe('enviado')
    expect(enviado.historico).toHaveLength(2)
    expect(enviado.historico[1].statusAnterior).toBe('rascunho')
    expect(enviado.historico[1].statusNovo).toBe('enviado')

    const aceito = await adapter.executarAcao(
      criado.id,
      'aprovar' as AcaoOrcamento,
      'vendedor-1',
    )
    expect(aceito.status).toBe('aceito')
    expect(aceito.historico[2].ator).toBe('vendedor-1')
  })

  it('aplica desconto comercial e recalcula totais', async () => {
    const adapter = new OrcamentoAdapter(
      new RepositorioSemTabela() as never,
      new LocalOrcamentoRepository(),
    )
    const criado = await adapter.criarOrcamento(entrada())

    const atualizado = await adapter.aplicarDescontoComercial(
      criado.id,
      {
        tipo: 'percentual',
        valor: 10,
        tetoMaximo: null,
        justificativa: 'negociação',
        concedidoPor: 'vendedor-1',
      },
      'vendedor-1',
    )
    expect(atualizado.valorDescontoComercial).toBe(20)
    expect(atualizado.total).toBe(180)
    expect(atualizado.descontoComercial?.valor).toBe(10)
  })
})

describe('LocalOrcamentoRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('mantém rascunhos isolados do localStorage', () => {
    const repositorio = new LocalOrcamentoRepository()
    expect(localStorage.getItem(ORCAMENTO_STORAGE_KEY)).toBeNull()
  })

  it('recusa ação sobre orçamento inexistente', async () => {
    const repositorio = new LocalOrcamentoRepository()
    await expect(
      repositorio.executarAcao('nao-existe', 'enviar', null),
    ).rejects.toBeInstanceOf(OrcamentoTableMissingError)
  })
})
