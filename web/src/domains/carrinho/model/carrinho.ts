import type {
  Produto,
  ProdutoRef,
  ProdutoVariante,
  Promocao,
} from '@/domains/produtos/model/produto'
import {
  aplicarPromocao,
  disponibilidade,
  melhorPromocao,
  precoBase,
  precoOfertado,
} from '@/domains/produtos/model/produto'

/**
 * FATIA 6 — Carrinho de compras.
 *
 * Carrinho NÃO é pedido: é uma seleção local com
 * preços SNAPSHOT e semântica informativa. O valor
 * exibido nunca é autoridade — o backend revalida
 * preço, promoção e estoque na intenção de compra.
 *
 * Kit = produto comercial com componentes: o carrinho
 * sinaliza (composto) que a reserva é fan-out atômico
 * no backend (Fatia 7+). Nenhuma simulação aqui.
 */

export type DisponibilidadeCarrinho =
  | 'em_estoque'
  | 'sem_estoque'
  | 'sob_consulta'

export interface PromocaoInformativa {
  /** Rótulo humano da promoção vigente na adição. */
  rotulo: string
  /** Fim da oferta — informativo, não garante preço. */
  dataFim: string
}

export interface CarrinhoItem {
  /** Referência ao catálogo único — nunca produto duplicado. */
  produto: ProdutoRef
  varianteId: string | null
  varianteSku: string | null
  atributosTexto: string | null
  quantidade: number
  /** Snapshot do preço base no momento da adição. */
  precoBaseUnitario: number
  /** Snapshot do preço ofertado (base − promoção). */
  precoUnitario: number
  /** Promoção vigente na adição — informativa. */
  promocao: PromocaoInformativa | null
  /** Disponibilidade conhecida no momento da adição. */
  disponibilidade: DisponibilidadeCarrinho
  /**
   * Kit = produto com componentes. A reserva fan-out
   * atômica é responsabilidade do backend; o carrinho
   * apenas sinaliza que não é um produto simples.
   */
  composto: boolean
}

export interface Carrinho {
  itens: CarrinhoItem[]
  /** Carrinho é sempre local nesta fatia — nunca finge sincronização. */
  source: 'local'
}

export const CARRINHO_STORAGE_KEY = 'angel-carrinho-v2'

/** Chave de merge: produto + variante. Nunca por nome. */
export function chaveItem(
  produtoId: string,
  varianteId: string | null,
): string {
  return `${produtoId}::${varianteId ?? ''}`
}

export function rotuloPromocao(promocao: Promocao): string {
  return promocao.tipo === 'percentual'
    ? `${promocao.valor}% OFF`
    : `R$ ${promocao.valor.toFixed(2).replace('.', ',')} OFF`
}

/** Monta o item com snapshot de preço, promoção e disponibilidade. */
export function montarItem(
  produto: Produto,
  variante: ProdutoVariante | null,
  quantidade: number,
): CarrinhoItem {
  const base = precoBase(produto, variante)
  const promocao = melhorPromocao(produto, base)
  return {
    produto: {
      id: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      preco: produto.precoBase,
      imagem:
        produto.imagens.find((imagem) => imagem.principal)?.url ??
        produto.imagens[0]?.url ??
        null,
    },
    varianteId: variante?.id ?? null,
    varianteSku: variante?.sku ?? null,
    atributosTexto: variante
      ? variante.atributos
          .map((atributo) => `${atributo.tipo}: ${atributo.valor}`)
          .join(' · ')
      : null,
    quantidade: Math.max(1, quantidade),
    precoBaseUnitario: base,
    precoUnitario: promocao
      ? aplicarPromocao(base, promocao)
      : precoOfertado(produto, variante),
    promocao: promocao
      ? { rotulo: rotuloPromocao(promocao), dataFim: promocao.dataFim }
      : null,
    disponibilidade: disponibilidade(produto),
    composto: produto.composicao.length > 0,
  }
}

/** Adiciona fazendo merge por produto+variante. */
export function adicionarItem(
  itens: CarrinhoItem[],
  novo: CarrinhoItem,
): CarrinhoItem[] {
  const chave = chaveItem(novo.produto.id, novo.varianteId)
  const existente = itens.find(
    (item) =>
      chaveItem(item.produto.id, item.varianteId) === chave,
  )
  if (!existente) return [...itens, novo]
  return itens.map((item) =>
    chaveItem(item.produto.id, item.varianteId) === chave
      ? { ...item, quantidade: item.quantidade + novo.quantidade }
      : item,
  )
}

export function removerItem(
  itens: CarrinhoItem[],
  produtoId: string,
  varianteId: string | null,
): CarrinhoItem[] {
  const chave = chaveItem(produtoId, varianteId)
  return itens.filter(
    (item) =>
      chaveItem(item.produto.id, item.varianteId) !== chave,
  )
}

/** Quantidade ≤ 0 remove o item — carrinho nunca tem zero. */
export function atualizarQuantidade(
  itens: CarrinhoItem[],
  produtoId: string,
  varianteId: string | null,
  quantidade: number,
): CarrinhoItem[] {
  if (quantidade <= 0) {
    return removerItem(itens, produtoId, varianteId)
  }
  const chave = chaveItem(produtoId, varianteId)
  return itens.map((item) =>
    chaveItem(item.produto.id, item.varianteId) === chave
      ? { ...item, quantidade }
      : item,
  )
}

export function contagem(itens: CarrinhoItem[]): number {
  return itens.reduce((soma, item) => soma + item.quantidade, 0)
}

export function subtotalBase(itens: CarrinhoItem[]): number {
  return arredondar(
    itens.reduce(
      (soma, item) => soma + item.precoBaseUnitario * item.quantidade,
      0,
    ),
  )
}

/** Desconto promocional informativo — oferta não é preço. */
export function valorPromocao(itens: CarrinhoItem[]): number {
  return arredondar(
    itens.reduce(
      (soma, item) =>
        soma +
        (item.precoBaseUnitario - item.precoUnitario) * item.quantidade,
      0,
    ),
  )
}

export function subtotalOfertado(itens: CarrinhoItem[]): number {
  return arredondar(
    itens.reduce(
      (soma, item) => soma + item.precoUnitario * item.quantidade,
      0,
    ),
  )
}

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function rotuloDisponibilidadeCarrinho(
  disponibilidade: DisponibilidadeCarrinho,
): string {
  switch (disponibilidade) {
    case 'em_estoque':
      return 'Em estoque'
    case 'sem_estoque':
      return 'Esgotado'
    case 'sob_consulta':
      return 'Sob consulta'
  }
}
