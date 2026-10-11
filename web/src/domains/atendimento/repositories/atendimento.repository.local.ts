import {
  AtendimentoBackendIndisponivelError,
  type AtendimentoRepository,
  type AtendimentoResultado,
} from './atendimento.repository'
import type {
  AtendimentoRequest,
  RascunhoAtendimento,
} from '../model/atendimento'

export const ATENDIMENTO_STORAGE_KEY =
  'angel-atendimento-rascunho'

/**
 * Repositório local honesto.
 *
 * - `enviar` NUNCA finge sucesso: sem backend
 *   integrado, lança `AtendimentoBackendIndisponivelError`.
 *   `enviado ≠ ticket criado no servidor`.
 * - Rascunho em localStorage próprio da fatia,
 *   isolado de outros domínios, para que um
 *   erro nunca perca o que a cliente escreveu.
 */
export class LocalAtendimentoRepository
  implements AtendimentoRepository
{
  async enviar(
    _request: AtendimentoRequest,
  ): Promise<AtendimentoResultado> {
    // Integração real: Edge Function de
    // atendimento (Fatia 13). Até lá,
    // falha honesta — nunca sucesso falso.
    throw new AtendimentoBackendIndisponivelError()
  }

  salvarRascunho(rascunho: RascunhoAtendimento): void {
    try {
      localStorage.setItem(
        ATENDIMENTO_STORAGE_KEY,
        JSON.stringify(rascunho),
      )
    } catch {
      // Sem armazenamento: segue sem rascunho,
      // nunca quebra o envio.
    }
  }

  carregarRascunho(): RascunhoAtendimento | null {
    try {
      const salvo = localStorage.getItem(
        ATENDIMENTO_STORAGE_KEY,
      )
      if (!salvo) return null
      return JSON.parse(salvo) as RascunhoAtendimento
    } catch {
      return null
    }
  }

  limparRascunho(): void {
    try {
      localStorage.removeItem(ATENDIMENTO_STORAGE_KEY)
    } catch {
      // Silencioso: ausência de rascunho é o estado limpo.
    }
  }
}
