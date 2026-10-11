import { describe, it, expect } from 'vitest'
import {
  ATENDIMENTO_CONTEXTOS,
  ATENDIMENTO_CONTEXTO_LISTA,
  atendimentoHref,
  atendimentoMailto,
  contatoEhValido,
  sanitizarAtendimento,
  validarAtendimentoRequest,
  type AtendimentoRequest,
} from './atendimento'

const requestValido: AtendimentoRequest = {
  contexto: 'equipe',
  nome: 'Ana Paula',
  contato: 'ana@email.com',
  mensagem: 'Quero saber sobre o serum.',
  consentimento: true,
}

describe('contextos', () => {
  it('expõe os seis contextos com metadados', () => {
    expect(ATENDIMENTO_CONTEXTO_LISTA).toHaveLength(6)
    for (const info of ATENDIMENTO_CONTEXTO_LISTA) {
      expect(
        ATENDIMENTO_CONTEXTOS[info.contexto],
      ).toBe(info)
      expect(info.rotulo.length).toBeGreaterThan(0)
      expect(info.descricao.length).toBeGreaterThan(0)
    }
  })

  it('só produto, orçamento e agendamento aceitam referência', () => {
    expect(
      ATENDIMENTO_CONTEXTOS.produto.aceitaReferencia,
    ).toBe(true)
    expect(
      ATENDIMENTO_CONTEXTOS[
        'pedido-orcamento'
      ].aceitaReferencia,
    ).toBe(true)
    expect(
      ATENDIMENTO_CONTEXTOS.agendamento
        .aceitaReferencia,
    ).toBe(true)
    expect(
      ATENDIMENTO_CONTEXTOS.pagamento
        .aceitaReferencia,
    ).toBe(false)
    expect(
      ATENDIMENTO_CONTEXTOS.entrega
        .aceitaReferencia,
    ).toBe(false)
    expect(
      ATENDIMENTO_CONTEXTOS.equipe
        .aceitaReferencia,
    ).toBe(false)
  })
})

describe('sanitizarAtendimento', () => {
  it('remove espaços extras e caracteres de controle', () => {
    expect(
      sanitizarAtendimento('  Ana\u0000  Paula  '),
    ).toBe('Ana Paula')
  })

  it('não altera texto já limpo', () => {
    expect(sanitizarAtendimento('Serum 30ml')).toBe(
      'Serum 30ml',
    )
  })
})

describe('contatoEhValido', () => {
  it('aceita e-mail', () => {
    expect(contatoEhValido('ana@email.com')).toBe(
      true,
    )
  })

  it('aceita telefone com DDD (10–11 dígitos)', () => {
    expect(contatoEhValido('11987654321')).toBe(
      true,
    )
    expect(contatoEhValido('1134567890')).toBe(true)
  })

  it('rejeita telefone sem DDD e texto livre', () => {
    expect(contatoEhValido('987654321')).toBe(false)
    expect(contatoEhValido('ana paula')).toBe(false)
    expect(contatoEhValido('')).toBe(false)
  })
})

describe('validarAtendimentoRequest', () => {
  it('aceita request válido', () => {
    expect(
      validarAtendimentoRequest(requestValido),
    ).toEqual({})
  })

  it('exige nome com pelo menos 2 caracteres', () => {
    const erros = validarAtendimentoRequest({
      ...requestValido,
      nome: 'A',
    })
    expect(erros.nome).toBeDefined()
  })

  it('exige contato válido', () => {
    const erros = validarAtendimentoRequest({
      ...requestValido,
      contato: 'invalido',
    })
    expect(erros.contato).toBeDefined()
  })

  it('exige mensagem dentro do tamanho', () => {
    const curta = validarAtendimentoRequest({
      ...requestValido,
      mensagem: 'curta',
    })
    expect(curta.mensagem).toBeDefined()

    const longa = validarAtendimentoRequest({
      ...requestValido,
      mensagem: 'x'.repeat(2001),
    })
    expect(longa.mensagem).toBeDefined()
  })

  it('exige consentimento', () => {
    const erros = validarAtendimentoRequest({
      ...requestValido,
      consentimento: false,
    })
    expect(erros.consentimento).toBeDefined()
  })

  it('aceita referência vazia mesmo em contexto que aceita', () => {
    const erros = validarAtendimentoRequest({
      ...requestValido,
      contexto: 'produto',
      referencia: '',
    })
    expect(erros.referencia).toBeUndefined()
  })

  it('rejeita referência de 1 caractere', () => {
    const erros = validarAtendimentoRequest({
      ...requestValido,
      contexto: 'produto',
      referencia: 'x',
    })
    expect(erros.referencia).toBeDefined()
  })
})

describe('atendimentoHref', () => {
  it('monta deep-link com contexto', () => {
    expect(atendimentoHref('equipe')).toBe(
      '/atendimento?contexto=equipe',
    )
  })

  it('monta deep-link com referência', () => {
    expect(
      atendimentoHref('produto', 'serum-30'),
    ).toBe('/atendimento?contexto=produto&referencia=serum-30')
  })
})

describe('atendimentoMailto', () => {
  it('aponta para o e-mail real com assunto e corpo', () => {
    const href = atendimentoMailto(requestValido)
    expect(href).toContain(
      'mailto:contato@angelcosmeticos.com.br',
    )
    expect(href).toContain(
      encodeURIComponent('Atendimento — Falar com a equipe'),
    )
    expect(href).toContain(
      encodeURIComponent('ana@email.com'),
    )
  })

  it('inclui a referência quando informada', () => {
    const href = atendimentoMailto({
      ...requestValido,
      contexto: 'produto',
      referencia: 'serum-30',
    })
    expect(href).toContain(
      encodeURIComponent('serum-30'),
    )
  })
})
