import { supabase } from '@/lib/supabase'

export interface ClientePerfilRow {
  id: number
  nome: string | null
  email: string | null
  telefone: string | null
}

export interface ClientePerfilInput {
  nome?: string
  telefone?: string | null
}

export interface ClientePerfilResult<T> {
  data: T | null
  error: string | null
}

export interface ClientePerfilRepository {
  buscarPorEmail(email: string): Promise<ClientePerfilResult<ClientePerfilRow>>
  atualizar(
    id: number,
    input: ClientePerfilInput,
  ): Promise<ClientePerfilResult<ClientePerfilRow>>
}

export const clientePerfilRepository: ClientePerfilRepository = {
  async buscarPorEmail(email) {
    if (!email) {
      return { data: null, error: 'E-mail não informado.' }
    }
    const { data, error } = await supabase
      .from('cliente')
      .select('id, nome, email, telefone')
      .eq('email', email)
      .maybeSingle()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: (data as ClientePerfilRow | null) ?? null, error: null }
  },
  async atualizar(id, input) {
    const payload: Record<string, string | null> = {}
    if (input.nome !== undefined) payload.nome = input.nome
    if (input.telefone !== undefined) payload.telefone = input.telefone
    if (Object.keys(payload).length === 0) {
      return { data: null, error: 'Nenhum campo para atualizar.' }
    }
    const { data, error } = await supabase
      .from('cliente')
      .update(payload)
      .eq('id', id)
      .select('id, nome, email, telefone')
      .maybeSingle()
    if (error) {
      return { data: null, error: error.message }
    }
    if (!data) {
      return {
        data: null,
        error: 'Nenhuma linha atualizada. Verifique autorização.',
      }
    }
    return { data: data as ClientePerfilRow, error: null }
  },
}
