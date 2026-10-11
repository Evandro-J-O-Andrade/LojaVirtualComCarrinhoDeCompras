/**
 * FATIA 7 — Estoque: reserva atômica.
 *
 * Produto normal reserva o próprio estoque.
 * Kit NÃO tem estoque próprio: a
 * disponibilidade é derivada dos
 * componentes e a reserva é fan-out
 * atômica — se faltar UM componente,
 * NENHUM é reservado.
 *
 * Pool de estoque por PRODUTO: variante
 * herda a disponibilidade do produto
 * (o catálogo da Fatia 4 tem estoque
 * por produto). O backend reserva por
 * SKU dentro do pool; este modelo
 * valida o pool atomicamente.
 */

export interface NecessidadeEstoque {
  produtoId: string
  varianteId: string | null
  quantidade: number
}

export interface ComponenteKit {
  produtoId: string
  quantidade: number
}

export interface ProdutoEstoque {
  /** null = disponibilidade desconhecida (sob consulta). */
  disponivel: number | null
  /** Composição do kit; vazio = produto simples. */
  composicao: ComponenteKit[]
}

/** catálogo de estoque: chave do pool `${produtoId}::` */
export type CatalogoEstoque = ReadonlyMap<
  string,
  ProdutoEstoque
>

export function chaveEstoque(
  produtoId: string,
  varianteId: string | null,
): string {
  return `${produtoId}::${varianteId ?? ''}`
}

/**
 * Resolve o pool de estoque de uma
 * necessidade. A chave canônica é a do
 * produto; chaves de variante são
 * aceitas para catálogos que registram
 * pools por variante.
 */
export function entradaEstoque(
  catalogo: CatalogoEstoque,
  produtoId: string,
  varianteId: string | null,
): ProdutoEstoque | undefined {
  return (
    catalogo.get(chaveEstoque(produtoId, null)) ??
    catalogo.get(chaveEstoque(produtoId, varianteId))
  )
}

export interface ErroEstoque {
  produtoId: string
  varianteId: string | null
  necessario: number
  disponivel: number | null
  motivo:
    | 'insuficiente'
    | 'desconhecido'
    | 'inexistente'
}

export interface ReservaEstoque {
  produtoId: string
  varianteId: string | null
  quantidade: number
}

/**
 * Expande necessidades em fan-out de kit
 * e agrega por POOL de estoque:
 * um kit × 2 com A×2, B×1 exige A×4, B×2.
 * Componentes de kit não podem ser,
 * eles mesmos, kits — o backend trata
 * a composição em um nível só.
 */
export function expandirNecessidades(
  necessidades: NecessidadeEstoque[],
  catalogo: CatalogoEstoque,
): Map<string, NecessidadeEstoque> {
  const agregado = new Map<
    string,
    NecessidadeEstoque
  >()

  const adicionar = (
    produtoId: string,
    quantidade: number,
  ) => {
    // Agregação no pool do produto.
    const chave = chaveEstoque(produtoId, null)
    const atual = agregado.get(chave)
    agregado.set(chave, {
      produtoId,
      varianteId: null,
      quantidade:
        (atual?.quantidade ?? 0) + quantidade,
    })
  }

  for (const necessidade of necessidades) {
    const entrada = entradaEstoque(
      catalogo,
      necessidade.produtoId,
      necessidade.varianteId,
    )
    if (entrada && entrada.composicao.length > 0) {
      // Kit: fan-out para os componentes.
      for (const componente of entrada.composicao) {
        adicionar(
          componente.produtoId,
          componente.quantidade *
            necessidade.quantidade,
        )
      }
    } else {
      adicionar(
        necessidade.produtoId,
        necessidade.quantidade,
      )
    }
  }

  return agregado
}

export type ResultadoReserva =
  | {
      ok: true
      reservas: ReservaEstoque[]
    }
  | { ok: false; erros: ErroEstoque[] }

/**
 * Reserva atômica: valida TODAS as
 * necessidades (já agregadas por pool)
 * antes de confirmar QUALQUER uma.
 * Se faltar um componente de kit,
 * nada é reservado.
 */
export function reservarEstoque(
  necessidades: NecessidadeEstoque[],
  catalogo: CatalogoEstoque,
): ResultadoReserva {
  const expandidas = expandirNecessidades(
    necessidades,
    catalogo,
  )
  const erros: ErroEstoque[] = []

  for (const necessidade of expandidas.values()) {
    const entrada = entradaEstoque(
      catalogo,
      necessidade.produtoId,
      necessidade.varianteId,
    )
    if (!entrada) {
      erros.push({
        produtoId: necessidade.produtoId,
        varianteId: necessidade.varianteId,
        necessario: necessidade.quantidade,
        disponivel: null,
        motivo: 'inexistente',
      })
      continue
    }
    if (entrada.disponivel === null) {
      erros.push({
        produtoId: necessidade.produtoId,
        varianteId: necessidade.varianteId,
        necessario: necessidade.quantidade,
        disponivel: null,
        motivo: 'desconhecido',
      })
      continue
    }
    if (entrada.disponivel < necessidade.quantidade) {
      erros.push({
        produtoId: necessidade.produtoId,
        varianteId: necessidade.varianteId,
        necessario: necessidade.quantidade,
        disponivel: entrada.disponivel,
        motivo: 'insuficiente',
      })
    }
  }

  if (erros.length > 0) {
    return { ok: false, erros }
  }

  const reservas: ReservaEstoque[] = [
    ...expandidas.values(),
  ].map((necessidade) => ({
    produtoId: necessidade.produtoId,
    varianteId: necessidade.varianteId,
    quantidade: necessidade.quantidade,
  }))
  return { ok: true, reservas }
}

/**
 * Devolução pura: computa a disponibilidade
 * do pool após devolver as reservas. O
 * backend aplica na mesma transação do
 * estorno.
 */
export function devolverEstoque(
  catalogo: CatalogoEstoque,
  reservas: ReservaEstoque[],
): CatalogoEstoque {
  const proximo = new Map(catalogo)
  for (const reserva of reservas) {
    const chave = chaveEstoque(
      reserva.produtoId,
      null,
    )
    const entrada = proximo.get(chave)
    if (!entrada) continue
    if (entrada.disponivel === null) continue
    proximo.set(chave, {
      ...entrada,
      disponivel:
        entrada.disponivel + reserva.quantidade,
    })
  }
  return proximo
}
