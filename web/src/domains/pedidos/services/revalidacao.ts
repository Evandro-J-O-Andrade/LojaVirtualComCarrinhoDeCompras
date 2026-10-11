import type {
  IntencaoItemServidor,
  IntencaoParaServidor,
  PedidoItemSnapshot,
} from '../model/pedido'
import {
  type ComponenteKit,
  type CatalogoEstoque,
  chaveEstoque,
  reservarEstoque,
} from './estoque'

/**
 * FATIA 7 — Revalidação comercial.
 *
 * Esta lógica é ESPECIFICAÇÃO do que a
 * Edge Function executa. O frontend a
 * importa para testar as invariantes;
 * a autoridade é o backend.
 *
 * O preço enviado pelo navegador é
 * informativo: aqui TUDO é reconstruído
 * a partir dos IDs.
 */

export interface VarianteRevalidacao {
  id: string
  sku: string
  preco: number
  ativo: boolean
}

export interface PromocaoRevalidacao {
  tipo: 'percentual' | 'fixo'
  valor: number
  dataInicio: string
  dataFim: string
  ativo: boolean
}

export interface ProdutoRevalidacao {
  id: string
  nome: string
  sku: string | null
  precoBase: number
  variantes: VarianteRevalidacao[]
  promocoes: PromocaoRevalidacao[]
  /** null = sob consulta. */
  estoque: number | null
  composicao: ComponenteKit[]
}

export type CatalogoRevalidacao = ReadonlyMap<
  string,
  ProdutoRevalidacao
>

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

export interface TotaisRevalidados {
  subtotalBase: number
  valorPromocao: number
  total: number
}

export type ResultadoRevalidacao =
  | {
      ok: true
      itens: PedidoItemSnapshot[]
      totais: TotaisRevalidados
      /** Necessidades de estoque já expandidas (kit = fan-out). */
      catalogoEstoque: CatalogoEstoque
    }
  | { ok: false; erros: string[] }

function hojeISO(): string {
  return new Date()
    .toLocaleDateString('sv-SE', {
      timeZone: 'America/Sao_Paulo',
    })
}

function promocaoEhValida(
  promocao: PromocaoRevalidacao,
): boolean {
  if (!promocao.ativo) return false
  const hoje = hojeISO()
  return (
    promocao.dataInicio <= hoje &&
    promocao.dataFim >= hoje
  )
}

function aplicarPromocao(
  preco: number,
  promocao: PromocaoRevalidacao,
): number {
  const calculado =
    promocao.tipo === 'percentual'
      ? preco * (1 - promocao.valor / 100)
      : preco - promocao.valor
  return Math.max(
    0,
    Math.round(calculado * 100) / 100,
  )
}

function melhorPromocao(
  produto: ProdutoRevalidacao,
  preco: number,
): PromocaoRevalidacao | null {
  const validas = produto.promocoes.filter(
    promocaoEhValida,
  )
  let melhor: PromocaoRevalidacao | null = null
  let menor = preco
  for (const promocao of validas) {
    const resultante = aplicarPromocao(preco, promocao)
    if (resultante < menor) {
      menor = resultante
      melhor = promocao
    }
  }
  return melhor
}

function rotuloPromocao(
  promocao: PromocaoRevalidacao,
): string {
  return promocao.tipo === 'percentual'
    ? `${promocao.valor}% OFF`
    : `R$ ${promocao.valor.toFixed(2).replace('.', ',')} OFF`
}

/**
 * Catálogo de estoque derivado do
 * catálogo comercial — disponibilidade
 * por produto (variantes compartilham
 * o estoque do produto neste modelo).
 */
export function catalogoEstoqueDe(
  catalogo: CatalogoRevalidacao,
): CatalogoEstoque {
  const mapa = new Map<
    string,
    {
      disponivel: number | null
      composicao: ComponenteKit[]
    }
  >()
  for (const produto of catalogo.values()) {
    mapa.set(
      chaveEstoque(produto.id, null),
      {
        disponivel: produto.estoque,
        composicao: produto.composicao,
      },
    )
  }
  return mapa
}

function revalidarItens(
  itens: IntencaoItemServidor[],
  catalogo: CatalogoRevalidacao,
):
  | { ok: true; snapshots: PedidoItemSnapshot[] }
  | { ok: false; erros: string[] } {
  const erros: string[] = []
  const snapshots: PedidoItemSnapshot[] = []

  for (const item of itens) {
    // Quantidade inválida bloqueia.
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1) {
      erros.push(
        `Quantidade inválida para o produto ${item.produtoId}.`,
      )
      continue
    }

    const produto = catalogo.get(item.produtoId)
    if (!produto) {
      erros.push(
        `Produto ${item.produtoId} não existe no catálogo.`,
      )
      continue
    }

    // Variante: se o produto tem variantes, a
    // intenção deve indicar uma ativa.
    let precoBase = produto.precoBase
    let skuSnapshot = produto.sku
    if (produto.variantes.length > 0) {
      const variante = item.varianteId
        ? produto.variantes.find(
            (v) => v.id === item.varianteId,
          )
        : undefined
      if (!variante) {
        erros.push(
          `Variante ${item.varianteId ?? 'não informada'} inválida para o produto ${produto.id}.`,
        )
        continue
      }
      if (!variante.ativo) {
        erros.push(
          `Variante ${variante.sku} inativa para o produto ${produto.id}.`,
        )
        continue
      }
      precoBase = variante.preco
      skuSnapshot = variante.sku
    } else if (item.varianteId !== null) {
      erros.push(
        `Produto ${produto.id} não possui variante ${item.varianteId}.`,
      )
      continue
    }

    // Promoção expirada/inativa NÃO é aplicada.
    const promocao = melhorPromocao(produto, precoBase)
    const precoFinal = promocao
      ? aplicarPromocao(precoBase, promocao)
      : precoBase

    snapshots.push({
      produtoId: produto.id,
      varianteId: item.varianteId,
      nomeSnapshot: produto.nome,
      skuSnapshot,
      precoBaseSnapshot: precoBase,
      promocaoSnapshot: promocao
        ? rotuloPromocao(promocao)
        : null,
      precoFinalSnapshot: precoFinal,
      quantidade: item.quantidade,
    })
  }

  return erros.length > 0
    ? { ok: false, erros }
    : { ok: true, snapshots }
}

/**
 * Revalidação completa da intenção:
 * reconstrói itens, verifica estoque
 * (com fan-out de kit, atomicamente) e
 * calcula totais — sempre a partir do
 * catálogo, nunca do navegador.
 */
export function revalidarIntencao(
  intencao: IntencaoParaServidor,
  catalogo: CatalogoRevalidacao,
): ResultadoRevalidacao {
  if (intencao.itens.length === 0) {
    return { ok: false, erros: ['Intenção sem itens.'] }
  }

  const itens = revalidarItens(
    intencao.itens,
    catalogo,
  )
  if (!itens.ok) return itens

  const catalogoEstoque = catalogoEstoqueDe(catalogo)
  const necessidades = intencao.itens.map((item) => ({
    produtoId: item.produtoId,
    varianteId: item.varianteId,
    quantidade: item.quantidade,
  }))
  const reserva = reservarEstoque(
    necessidades,
    catalogoEstoque,
  )
  if (!reserva.ok) {
    return {
      ok: false,
      erros: reserva.erros.map(
        (erro) =>
          `Estoque insuficiente para ${erro.produtoId}${erro.varianteId ? ` (${erro.varianteId})` : ''}: necessário ${erro.necessario}, disponivel ${erro.disponivel ?? 'desconhecido'}.`,
      ),
    }
  }

  const subtotalBase = arredondar(
    itens.snapshots.reduce(
      (soma, item) =>
        soma + item.precoBaseSnapshot * item.quantidade,
      0,
    ),
  )
  const valorPromocao = arredondar(
    itens.snapshots.reduce(
      (soma, item) =>
        soma +
        (item.precoBaseSnapshot -
          item.precoFinalSnapshot) *
          item.quantidade,
      0,
    ),
  )
  const total = arredondar(subtotalBase - valorPromocao)

  return {
    ok: true,
    itens: itens.snapshots,
    totais: { subtotalBase, valorPromocao, total },
    catalogoEstoque,
  }
}

/**
 * Pedido a partir de orçamento: só nasce
 * de orçamento ACEITO — nunca de rascunho,
 * enviado, recusado ou expirado.
 */
export function itensDeOrcamentoParaIntencao(
  orcamento: {
    status: string
    itens: Array<{
      produto: { id: string }
      varianteId: string | null
      quantidade: number
    }>
  },
): IntencaoItemServidor[] | null {
  if (orcamento.status !== 'aceito') return null
  return orcamento.itens.map((item) => ({
    produtoId: item.produto.id,
    varianteId: item.varianteId,
    quantidade: item.quantidade,
  }))
}
