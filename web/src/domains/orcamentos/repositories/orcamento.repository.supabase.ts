import { supabase } from '@/lib/supabase'
import type { ProdutoRef } from '@/domains/produtos/model/produto'
import {
  agoraISO,
  arredondar,
  calcularTotais,
  gerarProtocolo,
  type CondicaoPagamento,
  type DescontoComercial,
  type EventoOrcamento,
  type MetodoPagamento,
  type Orcamento,
  type OrcamentoEntrada,
  type OrcamentoItem,
  type OrcamentoStatus,
} from '../model/orcamento'
import type { AcaoOrcamento } from '../model/orcamento'
import {
  OrcamentoTableMissingError,
  type OrcamentoRepository,
} from './orcamento.repository'

interface OrcamentoRow {
  id: number
  status: string
  subtotal: number
  desconto_total: number
  frete: number
  total: number
  validade: string | null
  metodo_pagamento: string | null
  parcelas: number | null
  observacoes: string | null
  pedido_id: number | null
  criado_em: string
  atualizado_em: string
  cliente: { nome: string; whatsapp: string; email: string } | null
  itens: Array<{
    id: number
    produto_id: number
    produto_variante_id: number | null
    quantidade: number
    preco_unitario: number
    atributos_texto: string | null
    produto: {
      id: number
      nome: string
      slug: string
      preco_base: number
      produto_imagem?: Array<{ url: string; principal: boolean; ordem: number }>
    }
    produto_variante?: { id: number; sku: string } | null
  }>
  desconto_comercial?: Array<{
    tipo: string
    valor: number
    teto_maximo: number | null
    justificativa: string | null
  }>
  historico: Array<{
    status_anterior: string | null
    status_novo: string
    criado_em: string
    ator_auth_id: string | null
  }>
}

const ORCAMENTO_SELECT = `
  id,
  status,
  subtotal,
  desconto_total,
  frete,
  total,
  validade,
  metodo_pagamento,
  parcelas,
  observacoes,
  pedido_id,
  criado_em,
  atualizado_em,
  cliente:cliente_id (nome, whatsapp, email),
  itens:orcamento_item (
    id,
    produto_id,
    produto_variante_id,
    quantidade,
    preco_unitario,
    atributos_texto,
    produto:produto_id (
      id,
      nome,
      slug,
      preco_base,
      produto_imagem (url, principal, ordem)
    ),
    produto_variante:produto_variante_id (id, sku)
  ),
  desconto_comercial (tipo, valor, teto_maximo, justificativa),
  historico:orcamento_status_historico (status_anterior, status_novo, criado_em, ator_auth_id)
`

function imagemPrincipal(
  imagens:
    | Array<{ url: string; principal: boolean; ordem: number }>
    | undefined,
): string | null {
  if (!imagens || imagens.length === 0) return null
  const ordenadas = [...imagens].sort((a, b) => a.ordem - b.ordem)
  const principal = ordenadas.find((imagem) => imagem.principal) ?? ordenadas[0]
  return principal?.url ?? null
}

function toProdutoRef(produto: {
  id: number
  nome: string
  slug: string
  preco_base: number
  produto_imagem?: Array<{ url: string; principal: boolean; ordem: number }>
}): ProdutoRef {
  return {
    id: String(produto.id),
    slug: produto.slug,
    nome: produto.nome,
    preco: produto.preco_base,
    imagem: imagemPrincipal(produto.produto_imagem),
  }
}

function toItem(
  item: OrcamentoRow['itens'][number],
): OrcamentoItem {
  const variante = item.produto_variante ?? null
  return {
    produto: toProdutoRef(item.produto),
    varianteId: variante ? String(variante.id) : null,
    varianteSku: variante?.sku ?? null,
    atributosTexto: item.atributos_texto ?? null,
    quantidade: Number(item.quantidade),
    precoBaseUnitario: Number(item.produto.preco_base),
    precoUnitario: Number(item.preco_unitario),
  }
}

function toOrcamento(linha: OrcamentoRow): Orcamento {
  const itens = (linha.itens ?? []).map(toItem)
  const descontoComercial: DescontoComercial | null =
    linha.desconto_comercial && linha.desconto_comercial.length > 0
      ? {
          tipo:
            linha.desconto_comercial[0].tipo === 'fixo'
              ? 'fixo'
              : 'percentual',
          valor: Number(linha.desconto_comercial[0].valor),
          tetoMaximo:
            linha.desconto_comercial[0].teto_maximo === null
              ? null
              : Number(linha.desconto_comercial[0].teto_maximo),
          justificativa:
            linha.desconto_comercial[0].justificativa ?? null,
          concedidoPor: null,
        }
      : null

  const totais = calcularTotais(itens, descontoComercial, Number(linha.frete))

  const historico: EventoOrcamento[] = (linha.historico ?? [])
    .slice()
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em))
    .map((evento) => ({
      em: evento.criado_em,
      statusAnterior:
        (evento.status_anterior as OrcamentoStatus | null) ?? null,
      statusNovo: evento.status_novo as OrcamentoStatus,
      ator: evento.ator_auth_id,
    }))

  return {
    id: String(linha.id),
    protocolo: gerarProtocolo(linha.criado_em, linha.id),
    cliente: linha.cliente ?? {
      nome: '',
      whatsapp: '',
      email: '',
    },
    itens,
    observacoes: linha.observacoes ?? null,
    subtotal: totais.subtotal,
    valorPromocao: totais.valorPromocao,
    subtotalOfertado: totais.subtotalOfertado,
    descontoComercial,
    valorDescontoComercial: totais.valorDescontoComercial,
    frete: totais.frete,
    total: totais.total,
    validade: linha.validade,
    condicaoPagamento:
      linha.metodo_pagamento === null
        ? null
        : {
            metodo: linha.metodo_pagamento as MetodoPagamento,
            parcelas: linha.parcelas ?? 1,
            semJuros: false,
          },
    status: linha.status as OrcamentoStatus,
    pedidoId:
      linha.pedido_id === null ? null : String(linha.pedido_id),
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
    historico,
    source: 'supabase',
  }
}

function erroDeTabela(error: { code?: string }): Error {
  if (error.code === '42P01') return new OrcamentoTableMissingError()
  return error as Error
}

export class SupabaseOrcamentoRepository
  implements OrcamentoRepository
{
  async criarOrcamento(
    entrada: OrcamentoEntrada,
  ): Promise<Orcamento> {
    const totais = calcularTotais(entrada.itens, null)
    const { data, error } = await supabase
      .from('orcamento')
      .insert({
        status: 'rascunho',
        subtotal: totais.subtotal,
        desconto_total: totais.descontoTotal,
        frete: totais.frete,
        total: totais.total,
        validade: entrada.validade,
        observacoes: entrada.observacoes,
        cliente_id: null,
      })
      .select()
      .single()
    if (error) throw erroDeTabela(error)

    const orcamentoId = (data as { id: number }).id
    for (const item of entrada.itens) {
      const { error: erroItem } = await supabase
        .from('orcamento_item')
        .insert({
          orcamento_id: orcamentoId,
          produto_id: Number(item.produto.id),
          produto_variante_id:
            item.varianteId === null
              ? null
              : Number(item.varianteId),
          quantidade: item.quantidade,
          preco_unitario: item.precoUnitario,
          desconto_unitario: arredondar(
            item.precoBaseUnitario - item.precoUnitario,
          ),
          total: arredondar(
            item.precoUnitario * item.quantidade,
          ),
          atributos_texto: item.atributosTexto,
        })
      if (erroItem) throw erroDeTabela(erroItem)
    }

    const { error: erroHistorico } = await supabase
      .from('orcamento_status_historico')
      .insert({
        orcamento_id: orcamentoId,
        status_anterior: null,
        status_novo: 'rascunho',
      })
      .select()
    if (erroHistorico) throw erroDeTabela(erroHistorico)

    const criado = await this.getOrcamentoPorId(orcamentoId)
    if (!criado) throw new OrcamentoTableMissingError()
    return criado
  }

  async getOrcamento(id: string): Promise<Orcamento | null> {
    return this.getOrcamentoPorId(Number(id))
  }

  private async getOrcamentoPorId(
    id: number,
  ): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('orcamento')
      .select(ORCAMENTO_SELECT)
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw erroDeTabela(error)
    }
    return toOrcamento(data as unknown as OrcamentoRow)
  }

  async listOrcamentos(): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('orcamento')
      .select(ORCAMENTO_SELECT)
      .order('criado_em', { ascending: false })
    if (error) throw erroDeTabela(error)
    return ((data ?? []) as unknown as OrcamentoRow[]).map(toOrcamento)
  }

  async executarAcao(
    id: string,
    acao: AcaoOrcamento,
    ator: string | null,
  ): Promise<Orcamento> {
    const statusPorAcao: Record<string, OrcamentoStatus> = {
      enviar: 'enviado',
      aprovar: 'aceito',
      recusar: 'recusado',
    }
    const novoStatus = statusPorAcao[acao]
    if (!novoStatus) {
      // 'salvar' e 'converter' não mudam o status;
      // conversão é tratada em converterEmPedido.
      const atual = await this.getOrcamento(id)
      if (!atual) throw new OrcamentoTableMissingError()
      return atual
    }

    const { data: anterior } = await supabase
      .from('orcamento')
      .select('status')
      .eq('id', id)
      .single()
    if (!anterior) throw new OrcamentoTableMissingError()

    const { error } = await supabase
      .from('orcamento')
      .update({
        status: novoStatus,
        enviado_em:
          acao === 'enviar' ? agoraISO() : undefined,
        respondido_em:
          acao === 'aprovar' || acao === 'recusar'
            ? agoraISO()
            : undefined,
      })
      .eq('id', id)
    if (error) throw erroDeTabela(error)

    const { error: erroHistorico } = await supabase
      .from('orcamento_status_historico')
      .insert({
        orcamento_id: Number(id),
        status_anterior: (anterior as { status: string }).status,
        status_novo: novoStatus,
        ator_auth_id: ator,
      })
    if (erroHistorico) throw erroDeTabela(erroHistorico)

    const atualizado = await this.getOrcamento(id)
    if (!atualizado) throw new OrcamentoTableMissingError()
    return atualizado
  }

  async aplicarDescontoComercial(
    id: string,
    desconto: DescontoComercial,
    ator: string | null,
  ): Promise<Orcamento> {
    const { error: erroRemove } = await supabase
      .from('desconto_comercial')
      .delete()
      .eq('orcamento_id', Number(id))
    if (erroRemove) throw erroDeTabela(erroRemove)

    const { error } = await supabase
      .from('desconto_comercial')
      .insert({
        tipo: desconto.tipo,
        valor: desconto.valor,
        teto_maximo: desconto.tetoMaximo,
        justificativa: desconto.justificativa,
        concedido_por: ator,
        orcamento_id: Number(id),
      })
    if (error) throw erroDeTabela(error)

    const atual = await this.getOrcamento(id)
    if (!atual) throw new OrcamentoTableMissingError()
    const totais = calcularTotais(
      atual.itens,
      desconto,
      atual.frete,
    )
    const { error: erroTotal } = await supabase
      .from('orcamento')
      .update({
        desconto_total: totais.descontoTotal,
        total: totais.total,
      })
      .eq('id', id)
    if (erroTotal) throw erroDeTabela(erroTotal)

    const atualizado = await this.getOrcamento(id)
    if (!atualizado) throw new OrcamentoTableMissingError()
    return atualizado
  }

  async definirCondicaoPagamento(
    id: string,
    condicao: CondicaoPagamento,
  ): Promise<Orcamento> {
    const { error } = await supabase
      .from('orcamento')
      .update({
        metodo_pagamento: condicao.metodo,
        parcelas: condicao.parcelas,
      })
      .eq('id', id)
    if (error) throw erroDeTabela(error)

    const atualizado = await this.getOrcamento(id)
    if (!atualizado) throw new OrcamentoTableMissingError()
    return atualizado
  }
}
