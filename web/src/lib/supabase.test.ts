import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from 'vitest'

/**
 * O cliente do Supabase é criado no import.
 * Sem as variáveis públicas, a versão
 * antiga derrubava a aplicação inteira com
 * "supabaseKey is required" (tela branca).
 *
 * Aqui o import NÃO pode lançar, e o uso
 * tem de dizer o que falta.
 */

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('lib/supabase', () => {
  it('sem configuração: importar não derruba a aplicação', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    vi.resetModules()

    const modulo = await import('./supabase')

    expect(modulo.supabaseConfigurado).toBe(false)
    expect(modulo.supabase).toBeDefined()
    expect(modulo.MENSAGEM_SEM_CONFIGURACAO.length).toBeGreaterThan(0)
  })

  it('sem configuração: usar o cliente diz o que falta', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    vi.resetModules()

    const { supabase, ErroSupabaseNaoConfigurado } =
      await import('./supabase')

    expect(() =>
      supabase.from('produto').select('*'),
    ).toThrow(ErroSupabaseNaoConfigurado)
    expect(() =>
      supabase.auth.getUser(),
    ).toThrow(ErroSupabaseNaoConfigurado)
  })

  it('com configuração: o cliente é criado de verdade', async () => {
    vi.stubEnv(
      'VITE_SUPABASE_URL',
      'https://projeto.supabase.co',
    )
    vi.stubEnv(
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'sb_publishable_teste',
    )
    vi.resetModules()

    const modulo = await import('./supabase')

    expect(modulo.supabaseConfigurado).toBe(true)
    expect(
      typeof modulo.supabase.from,
    ).toBe('function')
  })
})
