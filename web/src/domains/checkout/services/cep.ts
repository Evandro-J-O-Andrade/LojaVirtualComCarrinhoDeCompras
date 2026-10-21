import { supabase } from '@/lib/supabase'

export interface ViaCEPResposta {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

export type ViaCEPErro =
  | 'cep-invalido'
  | 'cep-inexistente'
  | 'erro-de-rede'
  | 'erro-no-servidor'

export interface ViaCEPResultado {
  sucesso: boolean
  dados?: ViaCEPResposta
  erro?: ViaCEPErro
}

export function normalizarCep(cep: string): string | null {
  const apenasDigitos = cep.replace(/\D/g, '')
  return apenasDigitos.length === 8 ? apenasDigitos : null
}

export async function buscarEnderecoPorCep(
  cep: string,
): Promise<ViaCEPResultado> {
  const cepLimpo = normalizarCep(cep)
  if (!cepLimpo) {
    return { sucesso: false, erro: 'cep-invalido' }
  }

  const { data, error } = await supabase.functions.invoke<ViaCEPResposta>(
    `viaCEP?cep=${cepLimpo}`,
    { method: 'GET' },
  )

  if (error) {
    return { sucesso: false, erro: 'erro-no-servidor' }
  }

  if (!data) {
    return { sucesso: false, erro: 'erro-de-rede' }
  }

  if (data.erro) {
    return { sucesso: false, erro: 'cep-inexistente' }
  }

  return { sucesso: true, dados: data }
}
