import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SegurancaPage } from './SegurancaPage'

/**
 * Contrato de Segurança:
 *
 *   senha curta -> erro cliente
 *   confirmação divergente -> erro cliente
 *   falha do provedor -> erro honesto
 *   sucesso -> confirmação e campos limpos
 */

const accountMock = vi.hoisted(() => ({
  authenticated: true,
  profile: {
    nome: 'Ana Paula',
    email: 'ana@email.com',
    telefone: null,
  },
  alterarSenha: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../context/AccountContext', () => ({
  useAccount: () => accountMock,
}))

const preencher = async (
  usuario: ReturnType<typeof userEvent.setup>,
  senha: string,
  confirmacao: string,
) => {
  await usuario.type(
    screen.getByLabelText('Nova senha'),
    senha,
  )
  await usuario.type(
    screen.getByLabelText('Confirmar nova senha'),
    confirmacao,
  )
  await usuario.click(
    screen.getByRole('button', {
      name: /alterar senha/i,
    }),
  )
}

describe('SegurancaPage', () => {
  beforeEach(() => {
    accountMock.alterarSenha.mockReset()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('recusa senha curta antes do provedor', async () => {
    const usuario = userEvent.setup()
    render(
      <MemoryRouter>
        <SegurancaPage />
      </MemoryRouter>,
    )

    await preencher(usuario, 'curta', 'curta')

    expect(
      await screen.findByText(/pelo menos 8 caracteres/i),
    ).toBeDefined()
    expect(accountMock.alterarSenha).not.toHaveBeenCalled()
  })

  it('recusa confirmação divergente', async () => {
    const usuario = userEvent.setup()
    render(
      <MemoryRouter>
        <SegurancaPage />
      </MemoryRouter>,
    )

    await preencher(usuario, 'senha-valida', 'outra')

    expect(
      await screen.findByText(/confirmação não confere/i),
    ).toBeDefined()
    expect(accountMock.alterarSenha).not.toHaveBeenCalled()
  })

  it('falha do provedor é exibida com honestidade', async () => {
    accountMock.alterarSenha.mockResolvedValue({
      error: 'Sessão expirada, entre de novo',
    })
    const usuario = userEvent.setup()
    render(
      <MemoryRouter>
        <SegurancaPage />
      </MemoryRouter>,
    )

    await preencher(usuario, 'senha-valida', 'senha-valida')

    expect(
      await screen.findByText('Sessão expirada, entre de novo'),
    ).toBeDefined()
    // Campos preservados: nada se perde.
    expect(
      (
        screen.getByLabelText('Nova senha') as HTMLInputElement
      ).value,
    ).toBe('senha-valida')
  })

  it('troca com sucesso e limpa os campos', async () => {
    accountMock.alterarSenha.mockResolvedValue({})
    const usuario = userEvent.setup()
    render(
      <MemoryRouter>
        <SegurancaPage />
      </MemoryRouter>,
    )

    await preencher(usuario, 'senha-nova', 'senha-nova')

    expect(
      await screen.findByText(/senha alterada/i),
    ).toBeDefined()
    expect(accountMock.alterarSenha).toHaveBeenCalledWith(
      'senha-nova',
    )
    expect(
      (
        screen.getByLabelText('Nova senha') as HTMLInputElement
      ).value,
    ).toBe('')
  })

  it('mostra a sessão real', () => {
    render(
      <MemoryRouter>
        <SegurancaPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByText('ana@email.com'),
    ).toBeDefined()
    expect(
      screen.getByText('Supabase Auth'),
    ).toBeDefined()
  })
})
