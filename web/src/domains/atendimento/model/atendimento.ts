/**
 * FATIA 10 — Atendimento + Contato.
 *
 * Contato é aquisição/comunicação; atendimento
 * é operação de suporte. Um único formulário
 * contextualizado — nunca seis formulários.
 *
 * Regras fechadas:
 * - Nenhum canal inventado: só o que é real
 *   (e-mail contato@angelcosmeticos.com.br,
 *   endereço de Poá/SP, CNPJ). Sem telefone,
 *   horário, SLA ou social sem URL real.
 * - Enviar ≠ ticket criado: enquanto o backend
 *   não existir, a UI diz que a solicitação
 *   não pôde ser registrada e oferece o canal
 *   externo real.
 * - Validação client-side é UX; sanitização
 *   e rate limiting são do backend (Fatia 13).
 */

export type AtendimentoContexto =
  | 'produto'
  | 'pedido-orcamento'
  | 'agendamento'
  | 'pagamento'
  | 'entrega'
  | 'equipe'

export interface AtendimentoContextoInfo {
  contexto: AtendimentoContexto
  rotulo: string
  descricao: string
  /** O contexto aceita referência (produto, orçamento, agendamento)? */
  aceitaReferencia: boolean
  referenciaRotulo?: string
  referenciaPlaceholder?: string
}

export const ATENDIMENTO_CONTEXTOS: Record<
  AtendimentoContexto,
  AtendimentoContextoInfo
> = {
  produto: {
    contexto: 'produto',
    rotulo: 'Dúvidas sobre produtos',
    descricao:
      'Sobre um produto da vitrine: composição, variante, tamanho ou disponibilidade.',
    aceitaReferencia: true,
    referenciaRotulo: 'Produto',
    referenciaPlaceholder: 'Nome ou slug do produto',
  },
  'pedido-orcamento': {
    contexto: 'pedido-orcamento',
    rotulo: 'Pedido ou orçamento',
    descricao:
      'Sobre um orçamento em aberto: itens, valores, validade ou próximos passos.',
    aceitaReferencia: true,
    referenciaRotulo: 'Protocolo',
    referenciaPlaceholder: 'ORC- ou PED-…',
  },
  agendamento: {
    contexto: 'agendamento',
    rotulo: 'Agendamento',
    descricao:
      'Sobre um agendamento: confirmar, remarcar, cancelar ou saber como chegar.',
    aceitaReferencia: true,
    referenciaRotulo: 'Protocolo',
    referenciaPlaceholder: 'AG-…',
  },
  pagamento: {
    contexto: 'pagamento',
    rotulo: 'Pagamento',
    descricao:
      'Sobre pagamento: condição, parcelamento ou confirmação de recebimento.',
    aceitaReferencia: false,
  },
  entrega: {
    contexto: 'entrega',
    rotulo: 'Entrega ou retirada',
    descricao:
      'Sobre entrega ou retirada no espaço de Poá/SP: prazo, acompanhamento ou retirada.',
    aceitaReferencia: false,
  },
  equipe: {
    contexto: 'equipe',
    rotulo: 'Falar com a equipe',
    descricao:
      'Outro assunto, parceria, imprensa ou elogio: fale direto com a equipe Angel.',
    aceitaReferencia: false,
  },
}

export const ATENDIMENTO_CONTEXTO_LISTA: AtendimentoContextoInfo[] =
  Object.values(ATENDIMENTO_CONTEXTOS)

export interface AtendimentoRequest {
  contexto: AtendimentoContexto
  nome: string
  /** Canal de resposta: e-mail ou telefone. */
  contato: string
  /** Referência comercial, quando o contexto aceitar. */
  referencia?: string
  mensagem: string
  consentimento: boolean
}

/** Rascunho local: nunca se perde o que foi preenchido. */
export interface RascunhoAtendimento
  extends Omit<AtendimentoRequest, 'consentimento'> {
  consentimento: boolean
}

export type StatusEnvio = 'idle' | 'enviando' | 'enviado' | 'erro'

export type ErrosCampo = Partial<
  Record<
    'contexto' | 'nome' | 'contato' | 'referencia' | 'mensagem' | 'consentimento',
    string
  >
>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEFONE_REGEX = /^\d{10,11}$/

export const MENSAGEM_MIN = 10
export const MENSAGEM_MAX = 2000
export const NOME_MIN = 2

/**
 * Sanitização: trim e remoção de caracteres
 * de controle. Defesa em profundidade — a
 * sanitização de verdade e o rate limiting
 * moram no backend (Fatia 13).
 */
export function sanitizarAtendimento(
  valor: string,
): string {
  // Caracteres de controle (U+0000–U+001F,
  // U+007F) removidos por código de caractere.
  const semControle = Array.from(valor)
    .filter((caractere) => {
      const codigo = caractere.charCodeAt(0)
      return codigo >= 32 && codigo !== 127
    })
    .join('')
  return semControle
    .trim()
    .replace(/\s{2,}/g, ' ')
}

export function contatoEhValido(contato: string): boolean {
  const valor = sanitizarAtendimento(contato)
  return EMAIL_REGEX.test(valor) || TELEFONE_REGEX.test(valor)
}

/**
 * Validação client-side, apenas para UX.
 * Nela não confere segredo nem autorização:
 * quem decide é o backend.
 */
export function validarAtendimentoRequest(
  request: AtendimentoRequest,
): ErrosCampo {
  const erros: ErrosCampo = {}

  const nome = sanitizarAtendimento(request.nome)
  if (nome.length < NOME_MIN) {
    erros.nome = 'Informe seu nome.'
  }

  if (!contatoEhValido(request.contato)) {
    erros.contato =
      'Informe um e-mail válido ou um telefone com DDD (10–11 dígitos).'
  }

  const info = ATENDIMENTO_CONTEXTOS[request.contexto]
  const referencia = sanitizarAtendimento(
    request.referencia ?? '',
  )
  if (info.aceitaReferencia && referencia.length > 0 && referencia.length < 2) {
    erros.referencia = 'Referência muito curta.'
  }

  const mensagem = sanitizarAtendimento(request.mensagem)
  if (mensagem.length < MENSAGEM_MIN) {
    erros.mensagem = `Conte um pouco mais (mínimo ${MENSAGEM_MIN} caracteres).`
  } else if (mensagem.length > MENSAGEM_MAX) {
    erros.mensagem = `Mensagem muito longa (máximo ${MENSAGEM_MAX} caracteres).`
  }

  if (!request.consentimento) {
    erros.consentimento =
      'Precisamos do consentimento para responder pelo canal informado.'
  }

  return erros
}

/**
 * Deep-link para o atendimento com referência
 * comercial: Produto → Atendimento, Orçamento →
 * Atendimento, Agendamento → Atendimento.
 */
export function atendimentoHref(
  contexto: AtendimentoContexto,
  referencia?: string,
): string {
  const params = new URLSearchParams()
  params.set('contexto', contexto)
  if (referencia) {
    params.set('referencia', referencia)
  }
  return `/atendimento?${params.toString()}`
}

/** Canal externo real: o e-mail da empresa, pré-preenchido. */
export function atendimentoMailto(
  request: AtendimentoRequest,
): string {
  const info = ATENDIMENTO_CONTEXTOS[request.contexto]
  const assunto = `Atendimento — ${info.rotulo}`
  const linhas = [
    `Contexto: ${info.rotulo}`,
    `Nome: ${sanitizarAtendimento(request.nome)}`,
    `Contato: ${sanitizarAtendimento(request.contato)}`,
  ]
  if (request.referencia) {
    linhas.push(`Referência: ${sanitizarAtendimento(request.referencia)}`)
  }
  linhas.push('', sanitizarAtendimento(request.mensagem))
  const corpo = encodeURIComponent(linhas.join('\n'))
  return `mailto:contato@angelcosmeticos.com.br?subject=${encodeURIComponent(assunto)}&body=${corpo}`
}
