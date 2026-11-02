import type { Cliente, ClienteInput, Endereco } from '../model/cliente'

export interface ClienteRepository {
  listar(): Promise<Cliente[]>
  buscarPorId(id: number): Promise<Cliente | null>
  criar(input: ClienteInput): Promise<Cliente>
  atualizar(id: number, input: Partial<ClienteInput>): Promise<Cliente>
  excluir(id: number): Promise<void>
  listarEnderecos(clienteId: number): Promise<Endereco[]>
}