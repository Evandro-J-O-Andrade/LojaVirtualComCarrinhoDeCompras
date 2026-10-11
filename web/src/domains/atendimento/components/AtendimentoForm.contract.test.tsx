import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AtendimentoForm } from './AtendimentoForm'
import { useAtendimento } from '../hooks/useAtendimento'
import type {
  AtendimentoRepository,
  AtendimentoResultado,
} from '../repositories/atendimento.repository'
import type {
  AtendimentoRequest,
  RascunhoAtendimento,
} from '../model/atendimento'

/**
 * Contrato do formulário de atendimento:
 *
 *   envio com backend indisponível -> falha honesta,
 *     nada se perde, canal externo real (mailto)
 *   deep-link ?contexto=&referencia= -> pré-fills
 *   digitação -> rascunho persistido
 *   backend que resolve -> painel de sucesso
 */

function fakeRepository(
  enviarImpl: (
    request: AtendimentoRequest,
  ) => Promise<AtendimentoResultado>,
) {
  return {
    enviar: vi.fn(enviarImpl),
    salvarRascunho: vi.fn(),
    carregarRascunho: vi.fn(() => null),
    limparRascunho: vi.fn(),
  } satisfies AtendimentoRepository
}

function Harness({
  repository,
  initialEntry = '/atendimento',
}: {
  repository: AtendimentoRepository
  initialEntry?: string
}) {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <HarnessInner repository={repository} />
    </MemoryRouter>
  )
}

function HarnessInner({
  repository,
}: {
  repository: AtendimentoRepository
}) {
  const atendimento = useAtendimento({
    repository,
  })
  return (
    <AtendimentoForm
      atendimento={atendimento}
      mostrarContexto
    />
  )
}

const backendIndisponivel = () =>
  Promise.reject(new Error('backend indisponível'))

describe('contrato do AtendimentoForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('mostra erros por campo ao enviar vazio', async () => {
    const repository = fakeRepository(
      backendIndisponivel,
    )
    const usuario = userEvent.setup()
    render(
      <Harness repository={repository} />,
    )

    await usuario.click(
      screen.getByRole('button', {
        name: /enviar mensagem/i,
      }),
    )

    expect(
      await screen.findByText(/informe seu nome/i),
    ).toBeDefined()
    expect(
      screen.getByText(/e-mail válido ou um telefone/i),
    ).toBeDefined()
    expect(
      screen.getByText(/mínimo 10 caracteres/i),
    ).toBeDefined()
    expect(
      screen.getByText(/consentimento/i),
    ).toBeDefined()
    // Nada foi ao backend.
    expect(repository.enviar).not.toHaveBeenCalled()
  })

  it('deep-link pré-preenche contexto e referência', () => {
    const repository = fakeRepository(
      backendIndisponivel,
    )
    render(
      <Harness
        repository={repository}
        initialEntry="/atendimento?contexto=produto&referencia=serum-30"
      />,
    )

    const select = screen.getByLabelText(
      /sobre o quê/i,
    ) as HTMLSelectElement
    expect(select.value).toBe('produto')
    expect(
      (
        screen.getByPlaceholderText(
          /nome ou slug do produto/i,
        ) as HTMLInputElement
      ).value,
    ).toBe('serum-30')
  })

  it('digitação persiste rascunho', async () => {
    const repository = fakeRepository(
      backendIndisponivel,
    )
    const usuario = userEvent.setup()
    render(
      <Harness repository={repository} />,
    )

    await usuario.type(
      screen.getByLabelText(/seu nome/i),
      'Ana',
    )

    expect(repository.salvarRascunho).toHaveBeenCalled()
    const ultimo =
      repository.salvarRascunho.mock.calls.at(-1)?.[0]
    expect(ultimo?.nome).toBe('Ana')
  })

  it('falha de backend é honesta e preserva os dados', async () => {
    const repository = fakeRepository(
      backendIndisponivel,
    )
    const usuario = userEvent.setup()
    render(
      <Harness repository={repository} />,
    )

    await usuario.type(
      screen.getByLabelText('Seu nome'),
      'Ana Paula'
    )
    await usuario.type(
      screen.getByLabelText(
        'E-mail ou telefone com DDD',
      ),
      'ana@email.com'
    )
    await usuario.type(
      screen.getByLabelText('Mensagem'),
      'Quero saber sobre o serum.'
    )
    await usuario.click(screen.getByText(/autorizo/i))
    await usuario.click(
      screen.getByRole('button', {
        name: /enviar mensagem/i,
      }),
    )

    expect(await screen.findByRole('alert')).toBeDefined()
    expect(
      screen.getByText(/não conseguimos registrar/i),
    ).toBeDefined()
    // Dados preservados: nada se perdeu.
    expect(
      (
        screen.getByLabelText(
          'Seu nome',
        ) as HTMLInputElement
      ).value,
    ).toBe('Ana Paula')
    // Canal externo real oferecido.
    const mailto = screen.getByRole('link', {
      name: /enviar por e-mail/i,
    }) as HTMLAnchorElement
    expect(mailto.href).toContain(
      'contato@angelcosmeticos.com.br',
    )
    expect(mailto.href).toContain(
      encodeURIComponent('ana@email.com'),
    )
    // Rascunho NÃO foi limpo: a cliente não perdeu nada.
    expect(repository.limparRascunho).not.toHaveBeenCalled()
  })

  it('com backend que resolve, registra e limpa o rascunho', async () => {
    const repository = fakeRepository(() =>
      Promise.resolve({ recebidoEm: '2026-10-07T12:00:00Z' }),
    )
    const usuario = userEvent.setup()
    render(
      <Harness repository={repository} />,
    )

    await usuario.type(
      screen.getByLabelText('Seu nome'),
      'Ana Paula'
    )
    await usuario.type(
      screen.getByLabelText(
        'E-mail ou telefone com DDD',
      ),
      'ana@email.com'
    )
    await usuario.type(
      screen.getByLabelText('Mensagem'),
      'Quero saber sobre o serum.'
    )
    await usuario.click(screen.getByText(/autorizo/i))
    await usuario.click(
      screen.getByRole('button', {
        name: /enviar mensagem/i,
      }),
    )

    expect(
      await screen.findByText(/solicitação registrada/i),
    ).toBeDefined()
    expect(repository.enviar).toHaveBeenCalledWith(
      expect.objectContaining({
        contexto: 'equipe',
        nome: 'Ana Paula',
        contato: 'ana@email.com',
        consentimento: true,
      }),
    )
    expect(repository.limparRascunho).toHaveBeenCalled()
  })

  it('carrega rascunho anterior na montagem', () => {
    const rascunho: RascunhoAtendimento = {
      contexto: 'equipe',
      nome: 'Ana Paula',
      contato: 'ana@email.com',
      referencia: '',
      mensagem: 'Dúvida sobre a loja.',
      consentimento: true,
    }
    const repository = fakeRepository(
      backendIndisponivel,
    )
    vi.mocked(repository.carregarRascunho).mockReturnValue(
      rascunho,
    )
    render(
      <Harness repository={repository} />,
    )

    expect(
      (
        screen.getByLabelText(
          'Seu nome',
        ) as HTMLInputElement
      ).value,
    ).toBe('Ana Paula')
    expect(
      (
        screen.getByLabelText(
          'Mensagem',
        ) as HTMLTextAreaElement
      ).value,
    ).toBe('Dúvida sobre a loja.')
  })
})
