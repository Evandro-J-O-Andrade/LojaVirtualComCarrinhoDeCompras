import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { EntrarPage } from './EntrarPage'

/**
 * Contrato de Entrar:
 *
 *   credenciais erradas -> erro honesto do
 *     provedor de identidade, nada inventado
 *   credenciais aceitas -> vai ao destino
 *   já autenticada -> nunca fica na página
 */

const accountMock = vi.hoisted(() => ({
  authenticated: false,
  signIn: vi.fn(),
}))

vi.mock('../context/AccountContext', () => ({
  useAccount: () => accountMock,
}))

function Harness({ destino }: { destino?: string }) {
  const busca = destino ? `?destino=${encodeURIComponent(destino)}` : ''
  return (
    <MemoryRouter initialEntries={[`/entrar${busca}`]}>
      <Routes>
        <Route path="/entrar" element={<EntrarPage />} />
        <Route path="/conta" element={<div>minha conta</div>} />
        <Route path="/conta/pedidos" element={<div>meus pedidos</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('EntrarPage', () => {
  beforeEach(() => {
    accountMock.authenticated = false
    accountMock.signIn.mockReset()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('mostra o erro real do provedor', async () => {
    accountMock.signIn.mockResolvedValue({
      error: 'Email ou senha inválidos',
    })
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.type(
      screen.getByLabelText('E-mail'),
      'ana@email.com',
    )
    await usuario.type(
      screen.getByLabelText('Senha'),
      'errada',
    )
    await usuario.click(
      screen.getByRole('button', { name: /entrar/i }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toBeDefined()
    expect(
      screen.getByText('Email ou senha inválidos'),
    ).toBeDefined()
    // Continua na página de entrar.
    expect(
      screen.queryByText('minha conta'),
    ).toBeNull()
  })

  it('credenciais aceitas vão ao destino', async () => {
    accountMock.signIn.mockResolvedValue({})
    const usuario = userEvent.setup()
    render(<Harness destino="/conta/pedidos" />)

    await usuario.type(
      screen.getByLabelText('E-mail'),
      'ana@email.com',
    )
    await usuario.type(
      screen.getByLabelText('Senha'),
      'certa',
    )
    await usuario.click(
      screen.getByRole('button', { name: /entrar/i }),
    )

    expect(
      await screen.findByText('meus pedidos'),
    ).toBeDefined()
    expect(accountMock.signIn).toHaveBeenCalledWith(
      'ana@email.com',
      'certa',
    )
  })

  it('destino padrão é a conta', async () => {
    accountMock.signIn.mockResolvedValue({})
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.type(
      screen.getByLabelText('E-mail'),
      'ana@email.com',
    )
    await usuario.type(
      screen.getByLabelText('Senha'),
      'certa',
    )
    await usuario.click(
      screen.getByRole('button', { name: /entrar/i }),
    )

    expect(
      await screen.findByText('minha conta'),
    ).toBeDefined()
  })

  it('já autenticada: sai da página de entrar', () => {
    accountMock.authenticated = true
    render(<Harness />)
    expect(
      screen.queryByLabelText('E-mail'),
    ).toBeNull()
    expect(screen.getByText('minha conta')).toBeDefined()
  })
})
