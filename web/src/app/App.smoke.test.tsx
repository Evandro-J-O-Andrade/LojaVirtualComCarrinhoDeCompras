import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

/**
 * Teste de fumaça da aplicação inteira.
 *
 * O cenário que este teste existe para
 * barrar é o antigo "Uncaught Error:
 * supabaseKey is required": sem as
 * variáveis públicas, a aplicação NÃO pode
 * quebrar — ela sobe e mostra o que falta.
 */

function criarChain(): any {
  const alvo = function chain() {}
  return new Proxy(alvo, {
    get(_alvo, propriedade) {
      if (propriedade === 'then') return undefined
      return criarChain()
    },
    apply() {
      return Promise.resolve({ data: [], error: null })
    },
  })
}

vi.mock('@/lib/supabase', () => ({
  supabaseConfigurado: false,
  MENSAGEM_SEM_CONFIGURACAO:
    'O serviço da Angel não está configurado neste ambiente.',
  ErroSupabaseNaoConfigurado: class ErroSupabaseNaoConfigurado extends Error {},
  supabase: {
    from: () => criarChain(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: () =>
        Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ error: null }),
    },
  },
}))

describe('App (fumaça)', () => {
  beforeEach(() => {
    // Reduzir movimento desliga o Cinema de
    // entrada, liberando o router.
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as never
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('sem provedor configurado: a aplicação sobe e /entrar é honesto', async () => {
    render(
      <MemoryRouter initialEntries={['/entrar']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(/entrada indisponível/i),
    ).toBeDefined()
    expect(
      screen.getByText(/não está configurado/i),
    ).toBeDefined()
  })

  it('sem provedor configurado: a rota da conta não fica em branco', async () => {
    render(
      <MemoryRouter initialEntries={['/conta/pedidos']}>
        <App />
      </MemoryRouter>,
    )

    // O visitante é levado para /entrar,
    // onde o estado é explícito.
    expect(
      await screen.findByText(/entrada indisponível/i),
    ).toBeDefined()
  })
})
