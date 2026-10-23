import { describe, it, expect } from 'vitest'
import {
  CONTA_SECOES,
  destinoSeguro,
  inicialAvatar,
  nomeExibicao,
  perfilDoUsuario,
} from './conta'

/**
 * Usuário mínimo do Supabase Auth: só o
 * que o modelo consome.
 */
function usuario(
  overrides: {
    email?: string
    name?: string
  } = {},
) {
  return {
    id: 'user-1',
    email: overrides.email ?? 'ana@email.com',
    user_metadata: overrides.name
      ? { name: overrides.name }
      : {},
    created_at: '2026-01-01T00:00:00Z',
  } as never
}

describe('perfilDoUsuario', () => {
  it('nulo sem usuário: não existe conta', () => {
    expect(perfilDoUsuario(null)).toBeNull()
  })

  it('deriva nome do metadata e email real', () => {
    const perfil = perfilDoUsuario(
      usuario({ name: 'Ana Paula' }),
    )
    expect(perfil).toEqual({
      nome: 'Ana Paula',
      email: 'ana@email.com',
      // Telefone NÃO é inventado: vem
      // da tabela de perfil (Etapa 8).
      telefone: null,
    })
  })

  it('nome vazio quando o metadata não tem', () => {
    const perfil = perfilDoUsuario(usuario())
    expect(perfil?.nome).toBe('')
    expect(perfil?.email).toBe('ana@email.com')
  })
})

describe('nomeExibicao', () => {
  it('prefere o nome', () => {
    expect(
      nomeExibicao({
        nome: 'Ana Paula',
        email: 'ana@email.com',
        telefone: null,
      }),
    ).toBe('Ana Paula')
  })

  it('cai no e-mail sem nome', () => {
    expect(
      nomeExibicao({
        nome: '',
        email: 'ana@email.com',
        telefone: null,
      }),
    ).toBe('ana@email.com')
  })

  it('Cliente sem perfil', () => {
    expect(nomeExibicao(null)).toBe('Cliente')
  })
})

describe('inicialAvatar', () => {
  it('inicial maiúscula do nome', () => {
    expect(
      inicialAvatar({
        nome: 'ana paula',
        email: 'a@e.com',
        telefone: null,
      }),
    ).toBe('A')
  })

  it('inicial do e-mail sem nome', () => {
    expect(
      inicialAvatar({
        nome: '',
        email: 'ana@email.com',
        telefone: null,
      }),
    ).toBe('A')
  })

  it('C sem perfil', () => {
    expect(inicialAvatar(null)).toBe('C')
  })
})

describe('CONTA_SECOES', () => {
  it('expõe as seis seções com rotas reais', () => {
    expect(CONTA_SECOES).toHaveLength(6)
    const hrefs = CONTA_SECOES.map((s) => s.href)
    expect(hrefs).toContain('/conta/perfil')
    expect(hrefs).toContain('/conta/pedidos')
    expect(hrefs).toContain('/conta/orcamentos')
    expect(hrefs).toContain('/conta/agendamentos')
    expect(hrefs).toContain('/conta/favoritos')
    expect(hrefs).toContain('/conta/seguranca')
    for (const secao of CONTA_SECOES) {
      expect(secao.rotulo.length).toBeGreaterThan(0)
      expect(secao.descricao.length).toBeGreaterThan(0)
    }
  })
})

describe('destinoSeguro', () => {
  it('mantém caminho interno', () => {
    expect(destinoSeguro('/conta/pedidos')).toBe(
      '/conta/pedidos',
    )
  })

  it('sem destino: usa o padrão', () => {
    expect(destinoSeguro(null)).toBe('/conta')
    expect(destinoSeguro(undefined)).toBe('/conta')
    expect(destinoSeguro('')).toBe('/conta')
  })

  it('recusa URL externa', () => {
    expect(
      destinoSeguro('https://exemplo.com/robo'),
    ).toBe('/conta')
  })

  it('recusa caminho absoluto de outro site', () => {
    expect(destinoSeguro('//exemplo.com')).toBe('/conta')
  })

  it('recusa barra invertida', () => {
    expect(destinoSeguro('/\\exemplo.com')).toBe('/conta')
  })

  it('recusa caractere de controle', () => {
    expect(destinoSeguro('/conta\n/algo')).toBe('/conta')
  })

  it('aceita um padrão diferente', () => {
    expect(destinoSeguro('https://exemplo.com', '/')).toBe('/')
  })
})
