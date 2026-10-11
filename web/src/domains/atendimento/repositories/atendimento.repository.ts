import type {
  AtendimentoRequest,
  RascunhoAtendimento,
} from '../model/atendimento'

/**
 * O backend de atendimento ainda não existe
 * (integração é a Fatia 13). Enquanto isso,
 * `enviar` falha de forma honesta: a UI diz
 * que a solicitação não pôde ser registrada
 * e oferece o canal externo real. Nunca
 * fingimos um ticket criado.
 */
export class AtendimentoBackendIndisponivelError extends Error {
  constructor() {
    super(
      'AtendimentoBackendIndisponivelError: backend de atendimento não integrado',
    )
    this.name = 'AtendimentoBackendIndisponivelError'
  }
}

export interface AtendimentoResultado {
  recebidoEm: string
}

export interface AtendimentoRepository {
  /**
   * Envia a solicitação. Falha com
   * `AtendimentoBackendIndisponivelError`
   * até a integração real (Edge Function,
   * Fatia 13).
   */
  enviar(request: AtendimentoRequest): Promise<AtendimentoResultado>

  /** Rascunho local: preserva o preenchido. */
  salvarRascunho(rascunho: RascunhoAtendimento): void
  carregarRascunho(): RascunhoAtendimento | null
  limparRascunho(): void
}
