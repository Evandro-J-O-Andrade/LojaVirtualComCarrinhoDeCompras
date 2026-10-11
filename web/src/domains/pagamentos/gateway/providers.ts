/**
 * FATIA 7 — Gateway de pagamento.
 *
 * Nenhum provedor é escolhido agora.
 * A arquitetura depende apenas do
 * contrato PaymentProvider — Pix e
 * Cartão são adapters. Conectar o
 * provedor depois não contaminará
 * Pedido, Checkout, Produto nem
 * Pagamento com lógica de gateway.
 */

export interface CobrancaGateway {
  idExterno: string
  status: 'pendente'
  /** URL/QR para o cliente pagar (quando aplicável). */
  referencia: string | null
}

export interface PaymentProvider {
  readonly nome: string
  /**
   * Cria a cobrança no gateway.
   * O valor vem do PEDIDO (servidor),
   * nunca do navegador.
   */
  criarCobranca(input: {
    pedidoId: string
    valor: number
    metodo: 'pix' | 'cartao'
    parcelas: number
  }): Promise<CobrancaGateway>
}

export class GatewayNaoConectadoError
  extends Error
{
  readonly code =
    'GATEWAY_NAO_CONECTADO' as const

  constructor(provedor: string) {
    super(
      `Gateway ${provedor} não conectado (Etapa 8 congelada). Nenhum pagamento é processado localmente.`,
    )
    this.name = 'GatewayNaoConectadoError'
  }
}

export class PixProvider implements PaymentProvider {
  readonly nome = 'pix'

  async criarCobranca(): Promise<CobrancaGateway> {
    throw new GatewayNaoConectadoError('Pix')
  }
}

export class CartaoProvider
  implements PaymentProvider
{
  readonly nome = 'cartao'

  async criarCobranca(): Promise<CobrancaGateway> {
    throw new GatewayNaoConectadoError('Cartão')
  }
}

/**
 * Resolvedor de provider por método.
 * Adicionar um provedor novo = novo
 * adapter, sem tocar nos domínios.
 */
export function providerPara(
  metodo: 'pix' | 'cartao',
): PaymentProvider {
  return metodo === 'pix'
    ? new PixProvider()
    : new CartaoProvider()
}
