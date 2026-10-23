import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

/**
 * Contrato da porta administrativa:
 *   anônima            -> /admin/login
 *   autenticada, sem privilégio -> acesso negado
 *   administradora real -> conteúdo
 *   carregando         -> spinner
 */

const accountMock = vi.hoisted(() => ({
  authenticated: false,
  loading: false,
}))

const isAdminMock = vi.hoisted(() => ({
  data: undefined as boolean | undefined,
  isLoading: false,
}))

vi.mock('@/domains/conta/context/AccountContext', () => ({
  useAccount: () => accountMock,
}))

vi.mock('@/domains/admin/services/adminAuth', () => ({
  useIsAdmin: () => isAdminMock,
}))

function Harness() {
  return (
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin/login" element={<div>página de login admin</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<div>painel admin</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute (admin)', () => {
  beforeEach(() => {
    accountMock.authenticated = false
    accountMock.loading = false
    isAdminMock.data = undefined
    isAdminMock.isLoading = false
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('anônima: vai para o login do admin', () => {
    render(<Harness />)
    expect(
      screen.getByText('página de login admin'),
    ).toBeDefined()
    expect(
      screen.queryByText('painel admin'),
    ).toBeNull()
  })

  it('carregando: mostra spinner, sem conteúdo', () => {
    accountMock.loading = true
    render(<Harness />)
    expect(
      screen.queryByText('painel admin'),
    ).toBeNull()
    expect(
      screen.queryByText('página de login admin'),
    ).toBeNull()
  })

  it('autenticada sem privilégio: acesso negado', () => {
    accountMock.authenticated = true
    isAdminMock.data = false
    isAdminMock.isLoading = false
    render(<Harness />)
    expect(
      screen.getByText(/acesso negado/i),
    ).toBeDefined()
    expect(
      screen.queryByText('painel admin'),
    ).toBeNull()
  })

  it('administradora real: libera o painel', () => {
    accountMock.authenticated = true
    isAdminMock.data = true
    isAdminMock.isLoading = false
    render(<Harness />)
    expect(
      screen.getByText('painel admin'),
    ).toBeDefined()
  })
})
