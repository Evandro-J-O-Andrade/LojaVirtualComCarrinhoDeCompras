import { describe, it, expect, beforeEach } from 'vitest'
import {
  ATENDIMENTO_STORAGE_KEY,
  LocalAtendimentoRepository,
} from './atendimento.repository.local'
import { AtendimentoBackendIndisponivelError } from './atendimento.repository'
import type { AtendimentoRequest } from '../model/atendimento'

const request: AtendimentoRequest = {
  contexto: 'produto',
  nome: 'Ana Paula',
  contato: 'ana@email.com',
  referencia: 'serum-30',
  mensagem: 'Quero saber sobre o serum.',
  consentimento: true,
}

describe('LocalAtendimentoRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('nunca finge sucesso: enviar falha honestamente', async () => {
    const repositorio = new LocalAtendimentoRepository()
    await expect(
      repositorio.enviar(request),
    ).rejects.toBeInstanceOf(
      AtendimentoBackendIndisponivelError,
    )
  })

  it('salva, carrega e limpa o rascunho', () => {
    const repositorio = new LocalAtendimentoRepository()
    const rascunho = {
      contexto: 'equipe' as const,
      nome: 'Ana Paula',
      contato: 'ana@email.com',
      referencia: '',
      mensagem: 'Dúvida sobre a loja.',
      consentimento: true,
    }

    expect(repositorio.carregarRascunho()).toBeNull()
    repositorio.salvarRascunho(rascunho)
    expect(
      repositorio.carregarRascunho(),
    ).toEqual(rascunho)
    repositorio.limparRascunho()
    expect(repositorio.carregarRascunho()).toBeNull()
  })

  it('rascunho fica isolado na chave própria da fatia', () => {
    const repositorio = new LocalAtendimentoRepository()
    repositorio.salvarRascunho({
      contexto: 'equipe',
      nome: 'Ana',
      contato: 'ana@email.com',
      referencia: '',
      mensagem: 'Dúvida.',
      consentimento: false,
    })
    const salvo = localStorage.getItem(
      ATENDIMENTO_STORAGE_KEY,
    )
    expect(salvo).toContain('"nome":"Ana"')
    expect(
      localStorage.getItem('angel-orcamentos'),
    ).toBeNull()
  })

  it('ignora rascunho corrompido', () => {
    localStorage.setItem(
      ATENDIMENTO_STORAGE_KEY,
      'não-é-json',
    )
    const repositorio = new LocalAtendimentoRepository()
    expect(repositorio.carregarRascunho()).toBeNull()
  })
})
