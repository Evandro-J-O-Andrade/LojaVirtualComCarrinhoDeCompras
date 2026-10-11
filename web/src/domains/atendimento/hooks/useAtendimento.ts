import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  AtendimentoContexto,
  AtendimentoRequest,
  ErrosCampo,
  RascunhoAtendimento,
  StatusEnvio,
} from '../model/atendimento'
import {
  ATENDIMENTO_CONTEXTOS,
  sanitizarAtendimento,
  validarAtendimentoRequest,
} from '../model/atendimento'
import type { AtendimentoRepository } from '../repositories/atendimento.repository'
import { LocalAtendimentoRepository } from '../repositories/atendimento.repository.local'

const VAZIO: RascunhoAtendimento = {
  contexto: 'equipe',
  nome: '',
  contato: '',
  referencia: '',
  mensagem: '',
  consentimento: false,
}

interface UseAtendimentoOpcoes {
  repository?: AtendimentoRepository
}

export function useAtendimento(opcoes: UseAtendimentoOpcoes = {}) {
  const repository = useMemo(
    () =>
      opcoes.repository ??
      new LocalAtendimentoRepository(),
    [opcoes.repository],
  )
  const [params] = useSearchParams()

  const [campos, setCampos] = useState<RascunhoAtendimento>(VAZIO)
  const [erros, setErros] = useState<ErrosCampo>({})
  const [status, setStatus] = useState<StatusEnvio>('idle')
  const [mensagemErro, setMensagemErro] = useState('')
  const [recebidoEm, setRecebidoEm] = useState<
    string | null
  >(null)

  /**
   * Deep-link: /contato ou /atendimento chegam
   * com ?contexto=…&referencia=… vindo de Produto,
   * Orçamento ou Agendamento. O contexto só vale
   * se existir; a referência nunca sobrescreve
   * um rascunho já preenchido.
   */
  const contextoDeepLink = useMemo(() => {
    const candidato = params.get('contexto')
    return candidato && candidato in ATENDIMENTO_CONTEXTOS
      ? (candidato as AtendimentoContexto)
      : null
  }, [params])
  const referenciaDeepLink = useMemo(
    () => sanitizarAtendimento(params.get('referencia') ?? ''),
    [params],
  )

  useEffect(() => {
    if (contextoDeepLink) {
      setCampos((anteriores) => ({
        ...anteriores,
        contexto: contextoDeepLink,
        referencia: referenciaDeepLink || anteriores.referencia,
      }))
    } else {
      const rascunho = repository.carregarRascunho()
      if (rascunho) setCampos({ ...VAZIO, ...rascunho })
    }
    // Rascunho só na primeira montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextoDeepLink, referenciaDeepLink])

  const atualizar = useCallback(
    <K extends keyof RascunhoAtendimento>(
      campo: K,
      valor: RascunhoAtendimento[K],
    ) => {
      setCampos((anteriores) => {
        const proximos = { ...anteriores, [campo]: valor }
        repository.salvarRascunho(proximos)
        return proximos
      })
      setErros((anteriores) => {
        if (!anteriores[campo]) return anteriores
        const proximos = { ...anteriores }
        delete proximos[campo]
        return proximos
      })
    },
    [repository],
  )

  const enviar = useCallback(async () => {
    const request: AtendimentoRequest = {
      contexto: campos.contexto,
      nome: campos.nome,
      contato: campos.contato,
      referencia:
        (campos.referencia ?? '').trim() === ''
          ? undefined
          : campos.referencia,
      mensagem: campos.mensagem,
      consentimento: campos.consentimento,
    }

    const errosEncontrados =
      validarAtendimentoRequest(request)
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      setStatus('idle')
      return
    }

    setStatus('enviando')
    setMensagemErro('')
    setErros({})

    try {
      const resultado = await repository.enviar(request)
      setRecebidoEm(resultado.recebidoEm)
      setStatus('enviado')
      repository.limparRascunho()
      setCampos(VAZIO)
    } catch (erro) {
      // Falha honesta: nada é perdido. A cliente
      // mantém tudo o que escreveu e pode tentar
      // o canal externo real.
      setStatus('erro')
      setMensagemErro(
        erro instanceof Error
          ? erro.message
          : 'Não conseguimos registrar sua solicitação.',
      )
    }
  }, [campos, repository])

  const tentarNovamente = useCallback(() => {
    setStatus('idle')
    setMensagemErro('')
    setRecebidoEm(null)
  }, [])

  return {
    campos,
    erros,
    status,
    mensagemErro,
    recebidoEm,
    atualizar,
    enviar,
    tentarNovamente,
    contextoDeepLink,
    referenciaDeepLink,
  }
}

export type UseAtendimentoReturn = ReturnType<
  typeof useAtendimento
>
