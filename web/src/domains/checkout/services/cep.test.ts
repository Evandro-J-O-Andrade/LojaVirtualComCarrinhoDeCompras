import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  normalizarCep,
  buscarEnderecoPorCep,
  type ViaCEPResultado,
} from './cep'

let mockInvoke: ReturnType<typeof vi.fn>

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}))

describe('normalizarCep', () => {
  it('remove hífen e mantém 8 dígitos', () => {
    expect(normalizarCep('01310-100')).toBe('01310100')
  })

  it('remove espaços e letras', () => {
    expect(normalizarCep('  01310 100 ')).toBe('01310100')
  })

  it('retorna null para menos de 8 dígitos', () => {
    expect(normalizarCep('01310')).toBeNull()
  })

  it('retorna null para mais de 8 dígitos', () => {
    expect(normalizarCep('013101001')).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(normalizarCep('')).toBeNull()
  })

  it('retorna null quando tem letras', () => {
    expect(normalizarCep('0131a0100')).toBe('01310100')
  })
})

describe('buscarEnderecoPorCep', () => {
  beforeEach(() => {
    mockInvoke = vi.fn()
    vi.resetModules()
  })

  it('retorna sucesso com dados quando a Edge Function responde 200', async () => {
    const dadosEsperados = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    }
    mockInvoke.mockResolvedValueOnce({ data: dadosEsperados, error: null })

    const resultado = await buscarEnderecoPorCep('01310-100')

    expect(resultado.sucesso).toBe(true)
    expect(resultado.dados).toEqual(dadosEsperados)
    expect(resultado.erro).toBeUndefined()
    expect(mockInvoke).toHaveBeenCalledTimes(1)
    expect(mockInvoke).toHaveBeenCalledWith('viaCEP?cep=01310100', {
      method: 'GET',
    })
  })

  it('retorna erro "cep-invalido" para CEP com menos de 8 dígitos', async () => {
    mockInvoke.mockClear()

    const resultado = await buscarEnderecoPorCep('01310')

    expect(resultado.sucesso).toBe(false)
    expect(resultado.erro).toBe('cep-invalido')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('retorna erro "cep-invalido" para string vazia', async () => {
    mockInvoke.mockClear()

    const resultado = await buscarEnderecoPorCep('')

    expect(resultado.sucesso).toBe(false)
    expect(resultado.erro).toBe('cep-invalido')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('retorna erro "cep-invalido" para CEP com letras', async () => {
    mockInvoke.mockClear()

    const resultado = await buscarEnderecoPorCep('0131a010')

    expect(resultado.sucesso).toBe(false)
    expect(resultado.erro).toBe('cep-invalido')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('retorna erro "cep-inexistente" quando a API responde com data.erro', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { erro: true },
      error: null,
    })

    const resultado = await buscarEnderecoPorCep('99999-999')

    expect(resultado.sucesso).toBe(false)
    expect(resultado.erro).toBe('cep-inexistente')
    expect(mockInvoke).toHaveBeenCalledWith('viaCEP?cep=99999999', {
      method: 'GET',
    })
  })

  it('retorna erro "erro-no-servidor" quando a Edge Function retorna error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Internal Server Error' },
    })

    const resultado = await buscarEnderecoPorCep('01310-100')

    expect(resultado.sucesso).toBe(false)
    expect(resultado.erro).toBe('erro-no-servidor')
  })

  it('retorna erro "erro-de-rede" quando data é null sem error', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: null })

    const resultado = await buscarEnderecoPorCep('01310-100')

    expect(resultado.sucesso).toBe(false)
    expect(resultado.erro).toBe('erro-de-rede')
  })

  it('normaliza CEP com hífen antes da chamada', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { logradouro: 'Rua X' },
      error: null,
    })

    await buscarEnderecoPorCep('01.234-567')

    expect(mockInvoke).toHaveBeenCalledWith('viaCEP?cep=01234567', {
      method: 'GET',
    })
  })

  it('normaliza CEP com espaços em branco antes da chamada', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { logradouro: 'Rua Y' },
      error: null,
    })

    await buscarEnderecoPorCep('  01234567  ')

    expect(mockInvoke).toHaveBeenCalledWith('viaCEP?cep=01234567', {
      method: 'GET',
    })
  })

  it('preenche todos os campos do endereço quando disponíveis', async () => {
    const dadosCompletos = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    }
    mockInvoke.mockResolvedValueOnce({
      data: dadosCompletos,
      error: null,
    })

    const resultado: ViaCEPResultado = await buscarEnderecoPorCep(
      '01310-100',
    )

    expect(resultado.sucesso).toBe(true)
    expect(resultado.dados?.logradouro).toBe('Avenida Paulista')
    expect(resultado.dados?.bairro).toBe('Bela Vista')
    expect(resultado.dados?.localidade).toBe('São Paulo')
    expect(resultado.dados?.uf).toBe('SP')
  })
})
