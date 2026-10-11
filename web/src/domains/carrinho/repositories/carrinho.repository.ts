import type { Carrinho } from '../model/carrinho'

export interface CarrinhoRepository {
  carregar(): Carrinho
  salvar(carrinho: Carrinho): void
  limpar(): void
}
