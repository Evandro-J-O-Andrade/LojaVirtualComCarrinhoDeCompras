import {
  CARRINHO_STORAGE_KEY,
  type Carrinho,
  type CarrinhoItem,
} from '../model/carrinho'
import type { CarrinhoRepository } from './carrinho.repository'

const VAZIO: Carrinho = { itens: [], source: 'local' }

/**
 * Validação de forma (não de confiança): o que
 * vem do armazenamento local nunca é autoridade
 * de preço — é só seleção. Itens malformados
 * (versão antiga, armazenamento corrompido) são
 * descartados em vez de quebrar a renderização
 * com NaN/undefined.
 */
function itemValido(item: unknown): item is CarrinhoItem {
  if (typeof item !== 'object' || item === null)
    return false
  const candidato = item as Record<string, unknown>
  const produto = candidato.produto as
    | Record<string, unknown>
    | undefined
  return (
    typeof produto?.id === 'string' &&
    typeof produto?.slug === 'string' &&
    typeof candidato.quantidade === 'number' &&
    Number.isFinite(candidato.quantidade) &&
    candidato.quantidade > 0 &&
    typeof candidato.precoBaseUnitario === 'number' &&
    Number.isFinite(candidato.precoBaseUnitario) &&
    typeof candidato.precoUnitario === 'number' &&
    Number.isFinite(candidato.precoUnitario)
  )
}

/**
 * Persistência local do carrinho. Key própria da Fatia 6:
 * o formato antigo (angel-cart) não tem variante nem
 * snapshot de preço — não migrar silenciosamente.
 */
export class LocalCarrinhoRepository implements CarrinhoRepository {
  carregar(): Carrinho {
    try {
      const salvo = localStorage.getItem(CARRINHO_STORAGE_KEY)
      if (!salvo) return VAZIO
      const parsed = JSON.parse(salvo) as Carrinho
      if (!Array.isArray(parsed.itens)) return VAZIO
      return {
        itens: parsed.itens.filter(itemValido),
        source: 'local',
      }
    } catch {
      return VAZIO
    }
  }

  salvar(carrinho: Carrinho): void {
    try {
      localStorage.setItem(
        CARRINHO_STORAGE_KEY,
        JSON.stringify(carrinho),
      )
    } catch {
      // Armazenamento indisponível: o carrinho
      // vive em memória durante a sessão.
    }
  }

  limpar(): void {
    try {
      localStorage.removeItem(CARRINHO_STORAGE_KEY)
    } catch {
      // Silencioso: nada a remover.
    }
  }
}
