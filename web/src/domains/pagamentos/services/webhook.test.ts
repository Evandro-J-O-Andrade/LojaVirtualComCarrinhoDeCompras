import { describe, expect, it } from 'vitest'
import {
  processarConfirmacaoWebhook,
  validarAssinaturaWebhook,
} from './webhook'
import type { Pagamento } from '../model/pagamento'

function pagamento(): Pagamento {
  return {
    id: 'pag-1',
    pedidoId: 'ped-1',
    metodo: 'pix',
    parcelas: 1,
    valor: 200,
    status: 'processando',
    gateway: null,
    chavesProcessadas: [],
    criadoEm: '2026-10-05T10:00:00Z',
    atualizadoEm: '2026-10-05T10:00:00Z',
    historico: [],
  }
}

describe('webhook de pagamento', () => {
  it('confirma pagamento via webhook', () => {
    const confirmado = processarConfirmacaoWebhook(
      pagamento(),
      {
        chaveIdempotencia: 'evt-123',
        status: 'confirmado',
        recebidoEm: '2026-10-05T10:05:00Z',
      },
    )
    expect(confirmado.status).toBe('confirmado')
    expect(confirmado.chavesProcessadas).toEqual([
      'evt-123',
    ])
    expect(confirmado.historico[0].origem).toBe(
      'webhook',
    )
  })

  it('webhook duplicado NÃO duplica pagamento nem evento', () => {
    const base = pagamento()
    const primeira = processarConfirmacaoWebhook(
      base,
      {
        chaveIdempotencia: 'evt-123',
        status: 'confirmado',
        recebidoEm: '2026-10-05T10:05:00Z',
      },
    )
    const duplicada = processarConfirmacaoWebhook(
      primeira,
      {
        chaveIdempotencia: 'evt-123',
        status: 'confirmado',
        recebidoEm: '2026-10-05T10:06:00Z',
      },
    )
    // Idempotência: histórico e chaves inalterados.
    expect(duplicada.historico).toHaveLength(1)
    expect(duplicada.chavesProcessadas).toEqual([
      'evt-123',
    ])
    expect(duplicada.status).toBe('confirmado')
  })

  it('falha via webhook é registrada', () => {
    const falhou = processarConfirmacaoWebhook(
      pagamento(),
      {
        chaveIdempotencia: 'evt-456',
        status: 'falhou',
        recebidoEm: '2026-10-05T10:05:00Z',
      },
    )
    expect(falhou.status).toBe('falhou')
  })

  it('valida assinatura HMAC-SHA256', async () => {
    const segredo = 'segredo-webhook'
    const payload = '{"evt":"pag-1","status":"confirmado"}'

    // Assinatura correta (calculada com o mesmo algoritmo).
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
    const esperada = Array.from(
      new Uint8Array(assinatura),
    )
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')

    expect(
      await validarAssinaturaWebhook(
        payload,
        esperada,
        segredo,
      ),
    ).toBe(true)

    // Assinatura incorreta.
    expect(
      await validarAssinaturaWebhook(
        payload,
        'abc123',
        segredo,
      ),
    ).toBe(false)

    // Segredo diferente.
    expect(
      await validarAssinaturaWebhook(
        payload,
        esperada,
        'outro-segredo',
      ),
    ).toBe(false)

    // Assinatura ausente.
    expect(
      await validarAssinaturaWebhook(
        payload,
        '',
        segredo,
      ),
    ).toBe(false)
  })
})
