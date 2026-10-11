import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AccountProvider, useAccount } from './AccountContext'

/**
 * AccountContext é o seam: o que ele
 * expõe vem do AuthContext (Supabase
 * Auth) — nunca de um localStorage.
 */

const authMock = vi.hoisted(() => ({
  user: null as never,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  alterarSenha: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authMock,
}))

describe('AccountContext', () => {
  beforeEach(() => {
    authMock.user = null
    authMock.loading = false
  })

  it('anônima: authenticated falso, perfil nulo', () => {
    const { result } = renderHook(() => useAccount(), {
      wrapper: AccountProvider,
    })
    expect(result.current.authenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('autenticada: perfil derivado do usuário real', () => {
    authMock.user = {
      id: 'user-1',
      email: 'ana@email.com',
      user_metadata: { name: 'Ana Paula' },
      created_at: '2026-01-01T00:00:00Z',
    } as never

    const { result } = renderHook(() => useAccount(), {
      wrapper: AccountProvider,
    })
    expect(result.current.authenticated).toBe(true)
    expect(result.current.profile).toEqual({
      nome: 'Ana Paula',
      email: 'ana@email.com',
      telefone: null,
    })
  })

  it('expõe signOut e alterarSenha do provedor de identidade', () => {
    const { result } = renderHook(() => useAccount(), {
      wrapper: AccountProvider,
    })
    expect(result.current.signOut).toBe(authMock.signOut)
    expect(result.current.alterarSenha).toBe(
      authMock.alterarSenha,
    )
  })

  it('carregando reflete o estado do auth', () => {
    authMock.loading = true
    const { result } = renderHook(() => useAccount(), {
      wrapper: AccountProvider,
    })
    expect(result.current.loading).toBe(true)
  })
})
