import { type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, Mail, Send } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import {
  ATENDIMENTO_CONTEXTO_LISTA,
  ATENDIMENTO_CONTEXTOS,
  MENSAGEM_MAX,
  atendimentoMailto,
  type AtendimentoContexto,
} from '../model/atendimento'
import type { UseAtendimentoReturn } from '../hooks/useAtendimento'

interface AtendimentoFormProps {
  atendimento: UseAtendimentoReturn
  /** Quando falso, o contexto é escolhido fora do formulário (cartões). */
  mostrarContexto: boolean
}

/**
 * Formulário único de atendimento, contextualizado.
 *
 * - Rascunho persistido a cada digitação: um erro
 *   nunca apaga o que foi escrito.
 * - Erros por campo com aria; falha de envio é
 *   honesta e oferece o canal externo real.
 * - Consentimento explícito: só respondemos pelo
 *   canal que a cliente informou.
 */
export function AtendimentoForm({
  atendimento,
  mostrarContexto,
}: AtendimentoFormProps) {
  const { campos, erros, status } = atendimento
  const enviando = status === 'enviando'
  const info = ATENDIMENTO_CONTEXTOS[campos.contexto]

  const submeter = (evento: FormEvent) => {
    evento.preventDefault()
    void atendimento.enviar()
  }

  if (status === 'enviado') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-champagne bg-white p-8 text-center shadow-sm"
      >
        <CheckCircle2
          size={40}
          className="mx-auto mb-4 text-deep-rose"
          aria-hidden
        />
        <h2 className="font-display text-2xl font-bold text-soft-black mb-2">
          Solicitação registrada
        </h2>
        <p className="text-body text-content-muted mb-1">
          Recebido em{' '}
          {atendimento.recebidoEm
            ? new Date(atendimento.recebidoEm).toLocaleString(
                'pt-BR',
              )
            : '—'}
        </p>
        <p className="text-body-sm text-content-muted">
          Respondemos pelo canal que você informou.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={atendimento.tentarNovamente}
        >
          Enviar outra mensagem
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={submeter}
      noValidate
      className="space-y-5"
      aria-label="Formulário de atendimento"
    >
      {mostrarContexto && (
        <div className="space-y-1.5">
          <label
            htmlFor="atendimento-contexto"
            className="block text-sm font-medium text-warm-gray"
          >
            Sobre o quê
          </label>
          <select
            id="atendimento-contexto"
            value={campos.contexto}
            onChange={(evento) =>
              atendimento.atualizar(
                'contexto',
                evento.target
                  .value as AtendimentoContexto,
              )
            }
            className="w-full rounded-lg border-2 border-champagne bg-ivory px-4 py-2.5 focus:border-deep-rose focus:outline-none"
          >
            {ATENDIMENTO_CONTEXTO_LISTA.map((c) => (
              <option key={c.contexto} value={c.contexto}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </div>
      )}

      {info.aceitaReferencia && (
        <Input
          id="atendimento-referencia"
          label={info.referenciaRotulo ?? 'Referência'}
          placeholder={info.referenciaPlaceholder}
          value={campos.referencia}
          onChange={(evento) =>
            atendimento.atualizar(
              'referencia',
              evento.target.value,
            )
          }
          error={erros.referencia}
          aria-invalid={erros.referencia ? true : undefined}
        />
      )}

      <Input
        id="atendimento-nome"
        label="Seu nome"
        placeholder="Como podemos chamá-la?"
        value={campos.nome}
        onChange={(evento) =>
          atendimento.atualizar('nome', evento.target.value)
        }
        error={erros.nome}
        aria-invalid={erros.nome ? true : undefined}
        required
      />

      <Input
        id="atendimento-contato"
        label="E-mail ou telefone com DDD"
        placeholder="seu@email.com ou 11987654321"
        value={campos.contato}
        onChange={(evento) =>
          atendimento.atualizar(
            'contato',
            evento.target.value,
          )
        }
        error={erros.contato}
        aria-invalid={erros.contato ? true : undefined}
        required
      />

      <div className="space-y-1.5">
        <label
          htmlFor="atendimento-mensagem"
          className="block text-sm font-medium text-warm-gray"
        >
          Mensagem
        </label>
        <textarea
          id="atendimento-mensagem"
          rows={5}
          maxLength={MENSAGEM_MAX}
          placeholder="Conte o que precisa…"
          value={campos.mensagem}
          onChange={(evento) =>
            atendimento.atualizar(
              'mensagem',
              evento.target.value,
            )
          }
          aria-invalid={erros.mensagem ? true : undefined}
          aria-describedby={
            erros.mensagem
              ? 'atendimento-mensagem-erro'
              : 'atendimento-mensagem-contagem'
          }
          className="w-full resize-none rounded-lg border-2 border-champagne bg-ivory px-4 py-3 focus:border-deep-rose focus:outline-none"
        />
        {erros.mensagem ? (
          <p
            id="atendimento-mensagem-erro"
            className="text-sm text-coral"
            role="alert"
          >
            {erros.mensagem}
          </p>
        ) : (
          <p
            id="atendimento-mensagem-contagem"
            className="text-sm text-warm-gray"
          >
            {campos.mensagem.length}/{MENSAGEM_MAX}
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={campos.consentimento}
          onChange={(evento) =>
            atendimento.atualizar(
              'consentimento',
              evento.target.checked,
            )
          }
          aria-invalid={erros.consentimento ? true : undefined}
          className="mt-1 h-4 w-4 accent-deep-rose"
        />
        <span className="text-sm text-warm-gray">
          Autorizo a Angel Cosméticos a responder esta
          mensagem pelo e-mail ou telefone que informei.
        </span>
      </label>
      {erros.consentimento && (
        <p className="text-sm text-coral" role="alert">
          {erros.consentimento}
        </p>
      )}

      {status === 'erro' && (
        <div
          role="alert"
          className="rounded-xl border border-coral/40 bg-coral/10 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-coral"
              aria-hidden
            />
            <div className="space-y-3">
              <p className="text-sm text-soft-black">
                Não conseguimos registrar sua solicitação
                agora — nada do que você escreveu se
                perdeu.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={atendimento.enviar}
                >
                  Tentar novamente
                </Button>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-champagne px-3 py-1.5 text-sm font-medium text-soft-black transition-colors hover:border-deep-rose hover:bg-blush"
                  href={atendimentoMailto({
                    contexto: campos.contexto,
                    nome: campos.nome,
                    contato: campos.contato,
                    referencia: campos.referencia ||
                      undefined,
                    mensagem: campos.mensagem,
                    consentimento: campos.consentimento,
                  })}
                >
                  <Mail size={16} aria-hidden />
                  Enviar por e-mail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={enviando}
      >
        <Send size={18} aria-hidden />
        {enviando ? 'Enviando…' : 'Enviar mensagem'}
      </Button>
    </form>
  )
}
