import { supabase } from '@/lib/supabase'
import type { Cliente, ClienteInput, Endereco } from '../model/cliente'
import type { ClienteRepository } from './cliente.repository'

interface ClienteRow {
  id: number
  nome: string
  email: string | null
  telefone: string | null
  cpf: string | null
  nascimento: string | null
  auth_user_id: string | null
  criado_em: string
  atualizado_em: string
}

interface EnderecoRow {
  id: number
  cliente_id: number
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  uf: string
  cep: string
  principal: boolean
  ativo: boolean
}

function rowToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email ?? undefined,
    telefone: row.telefone ?? undefined,
    cpf: row.cpf ?? undefined,
    nascimento: row.nascimento ?? undefined,
    authUserId: row.auth_user_id ?? undefined,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  }
}

function rowToEndereco(row: EnderecoRow): Endereco {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    logradouro: row.logradouro,
    numero: row.numero,
    complemento: row.complemento ?? undefined,
    bairro: row.bairro,
    cidade: row.cidade,
    uf: row.uf,
    cep: row.cep,
    principal: row.principal,
    ativo: row.ativo,
  }
}

export const clienteRepositorySupabase: ClienteRepository = {
  async listar() {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .order('nome', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r) => rowToCliente(r as ClienteRow))
  },

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return rowToCliente(data as ClienteRow)
  },

  async buscarPorEmail(email) {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    if (error || !data) return null
    return rowToCliente(data as ClienteRow)
  },

  async criar(input) {
    const { data, error } = await supabase
      .from('cliente')
      .insert({
        nome: input.nome,
        email: input.email ?? null,
        telefone: input.telefone ?? null,
        cpf: input.cpf ?? null,
        nascimento: input.nascimento ?? null,
        auth_user_id: (input as ClienteInput & { authUserId?: string }).authUserId ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return rowToCliente(data as ClienteRow)
  },

  async atualizar(id, input) {
    const updates: Record<string, unknown> = {}
    if (input.nome !== undefined) updates.nome = input.nome
    if (input.email !== undefined) updates.email = input.email
    if (input.telefone !== undefined) updates.telefone = input.telefone
    if (input.cpf !== undefined) updates.cpf = input.cpf
    if (input.nascimento !== undefined) updates.nascimento = input.nascimento
    if ((input as ClienteInput & { authUserId?: string }).authUserId !== undefined) {
      updates.auth_user_id = (input as ClienteInput & { authUserId?: string }).authUserId
    }

    const { data, error } = await supabase
      .from('cliente')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return rowToCliente(data as ClienteRow)
  },

  async excluir(id) {
    const { error } = await supabase.from('cliente').delete().eq('id', id)
    if (error) throw error
  },

  async listarEnderecos(clienteId) {
    const { data, error } = await supabase
      .from('endereco')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('principal', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) => rowToEndereco(r as EnderecoRow))
  },

  async salvarEndereco(clienteId, endereco) {
    if (endereco.principal) {
      await supabase.from('endereco').update({ principal: false }).eq('cliente_id', clienteId)
    }
    const payload = {
      cliente_id: clienteId,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento ?? null,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      uf: endereco.uf,
      cep: endereco.cep,
      principal: endereco.principal ?? true,
      ativo: endereco.ativo ?? true,
    }
    const { data, error } = await supabase
      .from('endereco')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return rowToEndereco(data as EnderecoRow)
  },
}
