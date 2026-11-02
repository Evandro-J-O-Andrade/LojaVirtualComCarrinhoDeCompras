import type { Cliente, ClienteInput, Endereco } from '../model/cliente'

export interface ClienteRepository {
  listar(): Promise<Cliente[]>
  buscarPorId(id: number): Promise<Cliente | null>
  buscarPorEmail(email: string): Promise<Cliente | null>
  criar(input: ClienteInput): Promise<Cliente>
  atualizar(id: number, input: Partial<ClienteInput>): Promise<Cliente>
  excluir(id: number): Promise<void>
  listarEnderecos(clienteId: number): Promise<Endereco[]>
  salvarEndereco(clienteId: number, endereco: Partial<Endereco>): Promise<Endereco>
}