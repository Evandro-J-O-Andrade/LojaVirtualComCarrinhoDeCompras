import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ContaProtegida } from './ContaProtegida'

/**
 * Contrato da porta da conta:
 *
 *   anônima   -> /entrar?destino=<volta>
 *   autenticada -> conteúdo liberado
 */

const accountMock = vi.hoisted(() => ({
  authenticated: false,
  loading: false,
}))

vi.mock('../context/AccountContext', () => ({
  useAccount: () => accountMock,
}))

function Harness() {
  return (
    <MemoryRouter
      initialEntries={['/conta/pedidos']}
    >
      <Routes>
        <Route
          path="/entrar"
          element={<div>página de entrar</div>}
        />
        <Route
          path="/conta/pedidos"
          element={
            <ContaProtegida>
              <div>conteúdo protegido</div>
            </ContaProtegida>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ContaProtegida', () => {
  it('libera o conteúdo quando autenticada', () => {
    accountMock.authenticated = true
    accountMock.loading = false
    render(<Harness />)
    expect(
      screen.getByText('conteúdo protegido'),
    ).toBeDefined()
  })

  it('redireciona ao entrar com o destino de volta', () => {
    accountMock.authenticated = false
    accountMock.loading = false
    render(<Harness />)
    expect(
      screen.getByText('página de entrar'),
    ).toBeDefined()
    expect(
      screen.queryByText('conteúdo protegido'),
    ).toBeNull()
  })

  it('mostra carregando enquanto o auth resolve', () => {
    accountMock.loading = true
    render(<Harness />)
    expect(
      screen.queryByText('conteúdo protegido'),
    ).toBeNull()
    expect(
      screen.queryByText('página de entrar'),
    ).toBeNull()
  })
})
