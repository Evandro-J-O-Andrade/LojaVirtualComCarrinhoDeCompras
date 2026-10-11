import type { Pagamento } from '../model/pagamento'
import {
  transicionarPagamento,
  type StatusPagamento,
} from '../model/pagamento'

/**
 * FATIA 7 — Webhook de pagamento.
 *
 * Pagamento não depende da tela do
 * navegador: o gateway notifica a
 * Edge Function, que valida a
 * assinatura e processa com
 * idempotência. Webhook duplicado
 * NÃO duplica pagamento.
 */

export interface ConfirmacaoWebhook {
  /** Chave única do evento no gateway. */
  chaveIdempotencia: string
  status: Extract<
    StatusPagamento,
    'confirmado' | 'falhou'
  >
  recebidoEm: string
}

/**
 * Processa a confirmação do gateway.
 * Chave já processada = retorno
 * inalterado (idempotência).
 */
export function processarConfirmacaoWebhook(
  pagamento: Pagamento,
  confirmacao: ConfirmacaoWebhook,
): Pagamento {
  if (
    pagamento.chavesProcessadas.includes(
      confirmacao.chaveIdempotencia,
    )
  ) {
    // Evento duplicado: nada a fazer.
    return pagamento
  }
  const atualizado = transicionarPagamento(
    pagamento,
    confirmacao.status,
    'webhook',
  )
  return {
    ...atualizado,
    chavesProcessadas: [
      ...pagamento.chavesProcessadas,
      confirmacao.chaveIdempotencia,
    ],
  }
}

/**
 * Validação de assinatura HMAC-SHA256.
 * A Edge Function compara com timing
 * seguro; aqui a especificação pura
 * é testável com o webcrypto.
 */
export async function validarAssinaturaWebhook(
  payload: string,
  assinaturaRecebida: string,
  segredo: string,
): Promise<boolean> {
  if (!assinaturaRecebida) return false
  const encoder = new TextEncoder()
  const chave = await crypto.subtle.importKey(
    'raw',
    encoder.encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const assinatura = await crypto.subtle.sign(
    'HMAC',
    chave,
    encoder.encode(payload),
  )
  const esperado = Array.from(
    new Uint8Array(assinatura),
  )
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  if (esperado.length !== assinaturaRecebida.length) {
    return false
  }
  // Comparação constante para evitar
  // timing attack.
  let diferenca = 0
  for (let indice = 0; indice < esperado.length; indice++) {
    diferenca |=
      esperado.charCodeAt(indice) ^
      assinaturaRecebida.charCodeAt(indice)
  }
  return diferenca === 0
}
