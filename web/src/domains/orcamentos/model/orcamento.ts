import type { ProdutoRef } from '@/domains/produtos/model/produto'

/**
 * FATIA 5 — Orçamento comercial.
 *
 * O orçamento consome ProdutoRef do domínio de produtos:
 * um único modelo de produto alimenta catálogo, mimos,
 * orçamento, carrinho e pedido. Nenhuma tela inventa
 * o seu próprio "produto".
 *
 * Semântica comercial preservada (oferta não é preço):
 *   preco_base → promoção válida → preco_ofertado (snapshot)
 *   → desconto comercial (ato de negociação) → total
 *
 * O cliente NUNCA escolhe o desconto: ele pede orçamento.
 * Desconto comercial é ato autorizado de vendedor/admin.
 */

export type OrcamentoStatus =
  | 'rascunho'
  | 'enviado'
  | 'aceito'
  | 'recusado'
  | 'expirado'

export type MetodoPagamento = 'pix' | 'cartao'

export interface OrcamentoCliente {
  nome: string
  whatsapp: string
  email: string
}

export interface OrcamentoItem {
  /** Referência ao mesmo catálogo — nunca um produto duplicado. */
  produto: ProdutoRef
  varianteId: string | null
  varianteSku: string | null
  atributosTexto: string | null
  quantidade: number
  /** Snapshot do preço base no momento da montagem. */
  precoBaseUnitario: number
  /** Snapshot do preço ofertado (base − promoção válida). */
  precoUnitario: number
}

export interface DescontoComercial {
  tipo: 'percentual' | 'fixo'
  valor: number
  tetoMaximo: number | null
  justificativa: string | null
  concedidoPor: string | null
}

export interface CondicaoPagamento {
  metodo: MetodoPagamento
  parcelas: number
  semJuros: boolean
}

export interface EventoOrcamento {
  em: string
  statusAnterior: OrcamentoStatus | null
  statusNovo: OrcamentoStatus
  ator: string | null
}

export interface OrcamentoEntrada {
  cliente: OrcamentoCliente
  itens: OrcamentoItem[]
  observacoes: string | null
  validade: string | null
}

export interface TotaisOrcamento {
  subtotal: number
  valorPromocao: number
  subtotalOfertado: number
  valorDescontoComercial: number
  descontoTotal: number
  frete: number
  total: number
}

export interface Orcamento {
  id: string
  protocolo: string
  cliente: OrcamentoCliente
  itens: OrcamentoItem[]
  observacoes: string | null
  subtotal: number
  valorPromocao: number
  subtotalOfertado: number
  descontoComercial: DescontoComercial | null
  valorDescontoComercial: number
  frete: number
  total: number
  validade: string | null
  condicaoPagamento: CondicaoPagamento | null
  status: OrcamentoStatus
  pedidoId: string | null
  criadoEm: string
  atualizadoEm: string
  historico: EventoOrcamento[]
  source: 'supabase' | 'local'
}

export type AcaoOrcamento =
  | 'salvar'
  | 'enviar'
  | 'aprovar'
  | 'recusar'
  | 'converter'

export const ORCAMENTO_STORAGE_KEY = 'angel-orcamentos'

/**
 * Protocolo operacional de orçamento. AG-YYYYMMDD-NNNNNN
 * já é o protocolo fechado de agendamento — orçamento
 * tem prefixo próprio para nunca ambiguizar os dois.
 */
export const ORCAMENTO_PROTOCOLO_REGEX = /^ORC-[0-9]{8}-[0-9]{6}$/

export function isProtocoloOrcamento(valor: string): boolean {
  return ORCAMENTO_PROTOCOLO_REGEX.test(valor)
}

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function hojeISODate(): string {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'America/Sao_Paulo',
  })
}

export function agoraISO(): string {
  return new Date().toISOString()
}

/**
 * Protocolo de orçamento: ORC-YYYYMMDD-NNNNNN.
 * dataISO aceita data ou datetime; apenas a data
 * compõe o protocolo.
 */
export function gerarProtocolo(
  dataISO: string,
  sequencial: number,
): string {
  const data = dataISO.slice(0, 10).replace(/-/g, '')
  return `ORC-${data}-${String(sequencial).padStart(6, '0')}`
}

export function subtotalBase(itens: OrcamentoItem[]): number {
  return arredondar(
    itens.reduce(
      (soma, item) => soma + item.precoBaseUnitario * item.quantidade,
      0,
    ),
  )
}

export function valorPromocao(itens: OrcamentoItem[]): number {
  return arredondar(
    itens.reduce(
      (soma, item) =>
        soma +
        (item.precoBaseUnitario - item.precoUnitario) * item.quantidade,
      0,
    ),
  )
}

export function subtotalOfertado(itens: OrcamentoItem[]): number {
  return arredondar(
    itens.reduce(
      (soma, item) => soma + item.precoUnitario * item.quantidade,
      0,
    ),
  )
}

/**
 * Desconto comercial é aplicado APÓS a promoção e respeita
 * o teto de margem. Nunca deixa o total negativo.
 */
export function aplicarDescontoComercial(
  preco: number,
  desconto: DescontoComercial,
): number {
  let calculado = preco
  if (desconto.tipo === 'percentual') {
    calculado = preco * (1 - desconto.valor / 100)
  } else {
    calculado = preco - desconto.valor
  }
  if (desconto.tetoMaximo !== null) {
    const descontoAplicado = preco - calculado
    if (descontoAplicado > desconto.tetoMaximo) {
      calculado = preco - desconto.tetoMaximo
    }
  }
  return arredondar(Math.max(0, calculado))
}

export function valorDescontoComercial(
  subtotalOfertado: number,
  desconto: DescontoComercial | null,
): number {
  if (!desconto) return 0
  return arredondar(
    Math.max(
      0,
      subtotalOfertado - aplicarDescontoComercial(subtotalOfertado, desconto),
    ),
  )
}

export function calcularTotais(
  itens: OrcamentoItem[],
  descontoComercial: DescontoComercial | null,
  frete = 0,
): TotaisOrcamento {
  const subtotal = subtotalBase(itens)
  const promocao = valorPromocao(itens)
  const ofertado = subtotalOfertado(itens)
  const comercial = valorDescontoComercial(ofertado, descontoComercial)
  return {
    subtotal,
    valorPromocao: promocao,
    subtotalOfertado: ofertado,
    valorDescontoComercial: comercial,
    descontoTotal: arredondar(promocao + comercial),
    frete: arredondar(Math.max(0, frete)),
    total: arredondar(Math.max(0, ofertado - comercial + frete)),
  }
}

export function validarDescontoComercial(
  desconto: DescontoComercial,
): string | null {
  if (desconto.tipo === 'percentual') {
    if (desconto.valor <= 0 || desconto.valor > 100) {
      return 'Desconto percentual deve estar entre 0% e 100%.'
    }
  } else if (desconto.valor <= 0) {
    return 'Desconto fixo deve ser maior que zero.'
  }
  if (
    desconto.tetoMaximo !== null &&
    desconto.tetoMaximo < 0
  ) {
    return 'Teto máximo não pode ser negativo.'
  }
  return null
}

export function rotuloStatus(status: OrcamentoStatus): string {
  switch (status) {
    case 'rascunho':
      return 'Rascunho'
    case 'enviado':
      return 'Enviado'
    case 'aceito':
      return 'Aceito'
    case 'recusado':
      return 'Recusado'
    case 'expirado':
      return 'Expirado'
  }
}

export function rotuloAcao(acao: AcaoOrcamento): string {
  switch (acao) {
    case 'salvar':
      return 'Salvar rascunho'
    case 'enviar':
      return 'Enviar ao cliente'
    case 'aprovar':
      return 'Aprovar'
    case 'recusar':
      return 'Recusar'
    case 'converter':
      return 'Converter em pedido'
  }
}

/**
 * Ciclo comercial canônico:
 * rascunho → enviado → aceito | recusado | expirado.
 * Aceito converte em pedido (pedidoId).
 */
export function proximasAcoes(status: OrcamentoStatus): AcaoOrcamento[] {
  switch (status) {
    case 'rascunho':
      return ['salvar', 'enviar']
    case 'enviado':
      return ['aprovar', 'recusar']
    case 'aceito':
      return ['converter']
    case 'recusado':
    case 'expirado':
      return []
  }
}

/** Cliente só edita enquanto rascunho; após enviado, o ciclo é conduzido por vendedor/admin. */
export function podeSerEditadoPorCliente(orcamento: Orcamento): boolean {
  return orcamento.status === 'rascunho'
}

export function itemJaNoOrcamento(
  itens: OrcamentoItem[],
  produtoId: string,
  varianteId: string | null,
): number {
  return itens.findIndex(
    (item) =>
      item.produto.id === produtoId &&
      item.varianteId === varianteId,
  )
}

export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
    'pt-BR',
    { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' },
  )
}

export function formatDateTimeBR(isoDateTime: string): string {
  const data = new Date(isoDateTime)
  return `${data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}
