import { supabase } from '@/lib/supabase'
import {
  toAtributoTipo,
  type CategoriaRef,
  type FornecedorRef,
  type Produto,
  type ProdutoFiltro,
  type ProdutoImagem,
  type ProdutoVariante,
  type Promocao,
  type VarianteAtributo,
} from '../model/produto'
import {
  ProdutoTableMissingError,
  type ProdutoRepository,
  type ProdutoInput,
} from './produto.repository'

import type { PostgrestError } from '@supabase/supabase-js'

function isTableMissingError(error: PostgrestError | Error): boolean {
  if ('code' in error && error.code === 'PGRST200') return true
  const msg = error.message ?? ''
  return msg.toLowerCase().includes('does not exist')
}

interface ProdutoRow {
  id: number
  nome: string
  slug: string
  preco_base: number
  ativo: boolean
  produto_imagem?: Array<{
    id: number
    url: string
    ordem: number
    principal: boolean
  }>
}

interface ImagemRow {
  id: number
  url: string
  ordem: number
  principal: boolean
}

interface CategoriaRow {
  id: number
  nome: string
  slug: string
}

interface PromocaoRow {
  id: number
  produto_id: number
  tipo: string
  valor: number
  data_inicio: string
  data_fim: string
  ativo: boolean
}

interface EstoqueRow {
  produto_id: number
  quantidade_fisica: number
  quantidade_reservada: number
}

interface VarianteRow {
  id: number
  produto_id: number
  sku: string
  preco: number
  ativo: boolean
  peso: number | null
  produto_variante_atributo?: Array<{
    produto_atributo_valor?: {
      valor: string
      produto_atributo?: { nome: string }
    }
  }>
}

const PRODUTO_CORE_SELECT = `
  id,
  nome,
  slug,
  preco_base,
  ativo,
  produto_imagem (id, url, ordem, principal)
`

function toImagem(row: ImagemRow): ProdutoImagem {
  return {
    id: String(row.id),
    url: row.url,
    ordem: row.ordem ?? 0,
    principal: Boolean(row.principal),
    // alt/titulo chegam com a futura camada de conteúdo
    // (produto_midia); enquanto não existem, não inventamos.
    alt: null,
    titulo: null,
  }
}

function toCategoriaRef(row: CategoriaRow): CategoriaRef {
  return { id: String(row.id), nome: row.nome, slug: row.slug }
}

function toPromocao(row: PromocaoRow): Promocao {
  return {
    id: String(row.id),
    tipo: row.tipo === 'percentual' ? 'percentual' : 'fixo',
    valor: Number(row.valor),
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    ativo: Boolean(row.ativo),
  }
}

function toVariante(row: VarianteRow): ProdutoVariante {
  const atributos: VarianteAtributo[] = []
  for (const vinculo of row.produto_variante_atributo ?? []) {
    const valor = vinculo.produto_atributo_valor
    const tipo = toAtributoTipo(valor?.produto_atributo?.nome ?? null)
    if (!tipo || !valor?.valor) continue
    atributos.push({ tipo, valor: valor.valor })
  }
  return {
    id: String(row.id),
    sku: row.sku,
    preco: Number(row.preco),
    ativo: Boolean(row.ativo),
    peso: row.peso === null || row.peso === undefined ? null : Number(row.peso),
    atributos,
  }
}

async function seguro<T>(
  executar: () => PromiseLike<{ data: T | null; error: unknown }>,
): Promise<T | null> {
  try {
    const { data, error } = await executar()
    return error ? null : data
  } catch {
    return null
  }
}

export class SupabaseProdutoRepository implements ProdutoRepository {
  async createProduto(data: ProdutoInput): Promise<Produto> {
    const { data: row, error } = await supabase
      .from('produto')
      .insert({
        nome: data.nome,
        slug: data.slug,
        preco_base: data.precoBase,
        descricao: data.descricao ?? null,
        sku: data.sku ?? null,
        ativo: data.ativo ?? true,
        fornecedor_id: data.fornecedorId ? Number(data.fornecedorId) : null,
      })
      .select(PRODUTO_CORE_SELECT)
      .single()
    if (error) throw error
    if (data.categoriaIds && data.categoriaIds.length > 0) {
      await supabase.from('produto_categoria').insert(
        data.categoriaIds.map((cid) => ({
          produto_id: (row as ProdutoRow).id,
          categoria_id: Number(cid),
        })),
      )
    }
    const [produto] = await this.comporLista([row as ProdutoRow])
    return produto
  }

  async updateProduto(id: string, data: ProdutoInput): Promise<Produto> {
    const { data: row, error } = await supabase
      .from('produto')
      .update({
        nome: data.nome,
        slug: data.slug,
        preco_base: data.precoBase,
        descricao: data.descricao ?? null,
        sku: data.sku ?? null,
        ativo: data.ativo ?? true,
        fornecedor_id: data.fornecedorId ? Number(data.fornecedorId) : null,
      })
      .eq('id', Number(id))
      .select(PRODUTO_CORE_SELECT)
      .single()
    if (error) throw error
    if (data.categoriaIds !== undefined) {
      await supabase
        .from('produto_categoria')
        .delete()
        .eq('produto_id', Number(id))
      if (data.categoriaIds.length > 0) {
        await supabase.from('produto_categoria').insert(
          data.categoriaIds.map((cid) => ({
            produto_id: Number(id),
            categoria_id: Number(cid),
          })),
        )
      }
    }
    const [produto] = await this.comporLista([row as ProdutoRow])
    return produto
  }

  async deleteProduto(id: string): Promise<void> {
    const { error } = await supabase
      .from('produto')
      .delete()
      .eq('id', Number(id))
    if (error) throw error
  }
  async listProdutos(filtro?: ProdutoFiltro): Promise<Produto[]> {
    let query = supabase
      .from('produto')
      .select(PRODUTO_CORE_SELECT)
    // Vitrine vê só ativos; administração
    // também lista inativos (filtro).
    if (!filtro?.incluirInativos) {
      query = query.eq('ativo', true)
    }
    query = query.order('nome', { ascending: true })

    if (filtro?.search) {
      query = query.ilike('nome', `%${filtro.search}%`)
    }

    const { data, error } = await query
    if (error) {
      if (isTableMissingError(error)) throw new ProdutoTableMissingError()
      throw error
    }

    const linhas = (data ?? []) as ProdutoRow[]
    return this.comporLista(linhas)
  }

  async getProdutoBySlug(slug: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('produto')
      .select(PRODUTO_CORE_SELECT)
      .eq('slug', slug)
      .eq('ativo', true)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      if (isTableMissingError(error)) throw new ProdutoTableMissingError()
      throw error
    }
    const [produto] = await this.comporLista([data as ProdutoRow])
    return produto ?? null
  }

  async getProdutosRelacionados(
    slug: string,
    limit = 4,
  ): Promise<Produto[]> {
    const { data: atual, error: erroAtual } = await supabase
      .from('produto')
      .select('id, slug, produto_categoria (categoria_id)')
      .eq('slug', slug)
      .eq('ativo', true)
      .single()
    if (erroAtual || !atual) return []

    const categoriaIds = ((atual as { produto_categoria?: Array<{ categoria_id: number }> })
      .produto_categoria ?? []).map((vinculo) => vinculo.categoria_id)

    let query = supabase
      .from('produto')
      .select(PRODUTO_CORE_SELECT)
      .eq('ativo', true)
      .neq('slug', slug)
      .limit(limit)

    if (categoriaIds.length > 0) {
      query = query.in(
        'id',
        await this.buscarIdsPorCategoria(categoriaIds),
      )
    }

    const { data, error } = await query
    if (error) return []
    return this.comporLista((data ?? []) as ProdutoRow[])
  }

  async listCategorias(): Promise<CategoriaRef[]> {
    const data = await seguro(() =>
      supabase
        .from('categoria')
        .select('id, nome, slug')
        .eq('ativo', true)
        .order('nome', { ascending: true }),
    )
    return ((data ?? []) as CategoriaRow[]).map(toCategoriaRef)
  }

  private async buscarIdsPorCategoria(
    categoriaIds: number[],
  ): Promise<number[]> {
    const data = await seguro(() =>
      supabase
        .from('produto_categoria')
        .select('produto_id')
        .in('categoria_id', categoriaIds),
    )
    const ids = (data ?? []) as Array<{ produto_id: number }>
    return [...new Set(ids.map((linha) => linha.produto_id))]
  }

  private async comporLista(linhas: ProdutoRow[]): Promise<Produto[]> {
    const ids = linhas.map((linha) => linha.id)
    const [
      descricoes,
      skus,
      fornecedores,
      categorias,
      variantes,
      promocoes,
      estoques,
    ] = await Promise.all([
      this.buscarDescricoes(ids),
      this.buscarSkus(ids),
      this.buscarFornecedores(ids),
      this.buscarCategorias(ids),
      this.buscarVariantes(ids),
      this.buscarPromocoes(ids),
      this.buscarEstoques(ids),
    ])

    return linhas.map((linha) => ({
      id: String(linha.id),
      sku: skus.get(linha.id) ?? null,
      nome: linha.nome,
      slug: linha.slug,
      descricao: descricoes.get(linha.id) ?? null,
      precoBase: Number(linha.preco_base),
      imagens: (linha.produto_imagem ?? [])
        .map(toImagem)
        .sort((a, b) => a.ordem - b.ordem),
      // Vídeo, benefício e história chegam com a camada
      // de conteúdo do produto (produto_midia); enquanto
      // não existe, o fonte Supabase os entrega nulos.
      video: null,
      beneficio: null,
      historia: null,
      categorias: categorias.get(linha.id) ?? [],
      fornecedor: fornecedores.get(linha.id) ?? null,
      variantes: variantes.get(linha.id) ?? [],
      promocoes: promocoes.get(linha.id) ?? [],
      estoque: estoques.get(linha.id) ?? null,
      avaliacao: null,
      comoUsar: null,
      informacoes: null,
      composicao: [],
      ativo: Boolean(linha.ativo),
      source: 'supabase',
    }))
  }

  private async buscarDescricoes(
    ids: number[],
  ): Promise<Map<number, string>> {
    const mapa = new Map<number, string>()
    if (ids.length === 0) return mapa
    const data = await seguro(() =>
      supabase
        .from('produto')
        .select('id, descricao')
        .in('id', ids),
    )
    for (const linha of (data ?? []) as Array<{
      id: number
      descricao: string | null
    }>) {
      if (linha.descricao) mapa.set(linha.id, linha.descricao)
    }
    return mapa
  }

  private async buscarSkus(ids: number[]): Promise<Map<number, string>> {
    const mapa = new Map<number, string>()
    if (ids.length === 0) return mapa
    const data = await seguro(() =>
      supabase.from('produto').select('id, sku').in('id', ids),
    )
    for (const linha of (data ?? []) as Array<{
      id: number
      sku: string | null
    }>) {
      if (linha.sku) mapa.set(linha.id, linha.sku)
    }
    return mapa
  }

  private async buscarFornecedores(
    ids: number[],
  ): Promise<Map<number, FornecedorRef>> {
    const mapa = new Map<number, FornecedorRef>()
    if (ids.length === 0) return mapa

    const vinculos = await seguro(() =>
      supabase
        .from('produto')
        .select('id, fornecedor_id')
        .in('id', ids),
    )
    const fornecedorIds = [
      ...new Set(
        ((vinculos ?? []) as Array<{
          id: number
          fornecedor_id: number | null
        }>)
          .map((linha) => linha.fornecedor_id)
          .filter((id): id is number => id !== null),
      ),
    ]
    if (fornecedorIds.length === 0) return mapa

    const fornecedores = await seguro(() =>
      supabase
        .from('fornecedor')
        .select('id, nome')
        .in('id', fornecedorIds),
    )
    const porId = new Map(
      ((fornecedores ?? []) as Array<{ id: number; nome: string }>).map(
        (linha) => [linha.id, { id: String(linha.id), nome: linha.nome }],
      ),
    )
    for (const vinculo of (vinculos ?? []) as Array<{
      id: number
      fornecedor_id: number | null
    }>) {
      const fornecedor = vinculo.fornecedor_id
        ? porId.get(vinculo.fornecedor_id)
        : undefined
      if (fornecedor) mapa.set(vinculo.id, fornecedor)
    }
    return mapa
  }

  private async buscarCategorias(
    ids: number[],
  ): Promise<Map<number, CategoriaRef[]>> {
    const mapa = new Map<number, CategoriaRef[]>()
    if (ids.length === 0) return mapa
    const data = await seguro(() =>
      supabase
        .from('produto_categoria')
        .select('produto_id, categoria (id, nome, slug)')
        .in('produto_id', ids),
    )
    for (const linha of (data ?? []) as unknown as Array<{
      produto_id: number
      categoria?: CategoriaRow
    }>) {
      if (!linha.categoria) continue
      const existentes = mapa.get(linha.produto_id) ?? []
      existentes.push(toCategoriaRef(linha.categoria))
      mapa.set(linha.produto_id, existentes)
    }
    return mapa
  }

  private async buscarVariantes(
    ids: number[],
  ): Promise<Map<number, ProdutoVariante[]>> {
    const mapa = new Map<number, ProdutoVariante[]>()
    if (ids.length === 0) return mapa
    const data = await seguro(() =>
      supabase
        .from('produto_variante')
        .select(
          `
            id,
            produto_id,
            sku,
            preco,
            ativo,
            peso,
            produto_variante_atributo (
              produto_atributo_valor (
                valor,
                produto_atributo (nome)
              )
            )
          `,
        )
        .in('produto_id', ids)
        .eq('ativo', true),
    )
    for (const linha of (data ?? []) as unknown as VarianteRow[]) {
      const existentes = mapa.get(linha.produto_id) ?? []
      existentes.push(toVariante(linha))
      mapa.set(linha.produto_id, existentes)
    }
    return mapa
  }

  private async buscarPromocoes(
    ids: number[],
  ): Promise<Map<number, Promocao[]>> {
    const mapa = new Map<number, Promocao[]>()
    if (ids.length === 0) return mapa
    const data = await seguro(() =>
      supabase
        .from('promocao')
        .select('id, produto_id, tipo, valor, data_inicio, data_fim, ativo')
        .in('produto_id', ids)
        .eq('ativo', true),
    )
    for (const linha of (data ?? []) as PromocaoRow[]) {
      const existentes = mapa.get(linha.produto_id) ?? []
      existentes.push(toPromocao(linha))
      mapa.set(linha.produto_id, existentes)
    }
    return mapa
  }

  private async buscarEstoques(
    ids: number[],
  ): Promise<Map<number, { disponivel: number }>> {
    const mapa = new Map<number, { disponivel: number }>()
    if (ids.length === 0) return mapa
    const data = await seguro(() =>
      supabase
        .from('estoque')
        .select('produto_id, quantidade_fisica, quantidade_reservada')
        .in('produto_id', ids),
    )
    for (const linha of (data ?? []) as EstoqueRow[]) {
      const disponivel = Math.max(
        0,
        linha.quantidade_fisica - linha.quantidade_reservada,
      )
      mapa.set(linha.produto_id, { disponivel })
    }
    return mapa
  }
}
