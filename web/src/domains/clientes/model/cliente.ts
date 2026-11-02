export interface Cliente {
  id: number
  nome: string
  email?: string
  telefone?: string
  cpf?: string
  nascimento?: string
  authUserId?: string
  criadoEm: string
  atualizadoEm: string
}

export interface ClienteInput {
  nome: string
  email?: string
  telefone?: string
  cpf?: string
  nascimento?: string
}

export interface Endereco {
  id: number
  clienteId: number
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  principal: boolean
  ativo: boolean
}