import { supabase } from '@/lib/supabase'
import {
  hojeISODate,
  toContexto,
  type Mimo,
  type MimoKit,
  type MimoProdutoRef,
  type MimoPromocao,
} from '../model/mimo'
import {
  MimoTableMissingError,
  type MimoRepository,
} from './mimo.repository'

interface MimoRow {
  id: number
  nome: string
  slug: string
  titulo: string | null
  descricao: string | null
  contexto: string | null
  imagem: string | null
  video: string | null
  kit_produto_id: number | null
  promocao_id: number | null
  ativo: boolean
  inicio: string
  fim: string
  ordem: number
  seo_titulo: string | null
  seo_descricao: string | null
}

interface ProdutoRow {
  id: number
  nome: string
  slug: string
  preco_base: number | null
  ativo: boolean
  produto_imagem?: Array<{ url: string; principal: boolean; ordem: number }>
}

const MIMO_SELECT = `
  id,
  nome,
  slug,
  titulo,
  descricao,
  contexto,
  imagem,
  video,
  kit_produto_id,
  promocao_id,
  ativo,
  inicio,
  fim,
  ordem,
  seo_titulo,
  seo_descricao
`

const PRODUTO_SELECT = `
  id,
  nome,
  slug,
  preco_base,
  ativo,
  product_image:produto_imagem (url, principal, ordem)
`

function imagemPrincipal(
  imagens: Array<{ url: string; principal: boolean; ordem: number }> | undefined,
): string | null {
  if (!imagens || imagens.length === 0) return null
  const ordenadas = [...imagens].sort((a, b) => a.ordem - b.ordem)
  const principal = ordenadas.find((imagem) => imagem.principal) ?? ordenadas[0]
  return principal?.url ?? null
}

function toProdutoRef(row: ProdutoRow): MimoProdutoRef {
  return {
    id: String(row.id),
    slug: row.slug,
    nome: row.nome,
    preco: row.preco_base ?? null,
    imagem: imagemPrincipal(row.produto_imagem),
  }
}

export class SupabaseMimoRepository implements MimoRepository {
  async listMimos(): Promise<Mimo[]> {
    const { data, error } = await supabase
      .from('mimo')
      .select(MIMO_SELECT)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
    if (error) {
      if (error.code === '42P01') throw new MimoTableMissingError()
      throw error
    }
    const linhas = (data ?? []) as MimoRow[]
    return Promise.all(linhas.map((linha) => this.comporMimo(linha)))
  }

  async getMimoBySlug(slug: string): Promise<Mimo | null> {
    const { data, error } = await supabase
      .from('mimo')
      .select(MIMO_SELECT)
      .eq('slug', slug)
      .single()
    if (error) {
      if (error.code === '42P01') throw new MimoTableMissingError()
      if (error.code === 'PGRST116') return null
      throw error
    }
    return this.comporMimo(data as MimoRow)
  }

  async listMimosPorProduto(produtoSlug: string): Promise<Mimo[]> {
    const { data: produto, error: produtoError } = await supabase
      .from('produto')
      .select('id')
      .eq('slug', produtoSlug)
      .maybeSingle()
    if (produtoError) {
      if (produtoError.code === '42P01') throw new MimoTableMissingError()
      throw produtoError
    }
    if (!produto) return []

    const { data: vinculacao, error: vinculacaoError } = await supabase
      .from('mimo_produto')
      .select('mimo_id')
      .eq('produto_id', produto.id)
    if (vinculacaoError) {
      if (vinculacaoError.code === '42P01') throw new MimoTableMissingError()
      throw vinculacaoError
    }

    const mimoIds = [
      ...new Set((vinculacao ?? []).map((item) => item.mimo_id)),
    ]
    if (mimoIds.length === 0) return []

    const { data: linhas, error } = await supabase
      .from('mimo')
      .select(MIMO_SELECT)
      .in('id', mimoIds)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
    if (error) {
      if (error.code === '42P01') throw new MimoTableMissingError()
      throw error
    }
    return Promise.all(
      ((linhas ?? []) as MimoRow[]).map((linha) => this.comporMimo(linha)),
    )
  }

  private async comporMimo(linha: MimoRow): Promise<Mimo> {
    const [produtos, kit, promocao] = await Promise.all([
      this.buscarProdutosVinculados(linha.id),
      linha.kit_produto_id !== null
        ? this.buscarKit(linha.kit_produto_id)
        : Promise.resolve(null),
      linha.promocao_id !== null
        ? this.buscarPromocao(linha.promocao_id)
        : Promise.resolve(null),
    ])
    return {
      id: String(linha.id),
      slug: linha.slug,
      nome: linha.nome,
      titulo: linha.titulo ?? null,
      descricao: linha.descricao ?? null,
      contexto: toContexto(linha.contexto),
      imagem: linha.imagem ?? null,
      video: linha.video ?? null,
      seoTitulo: linha.seo_titulo ?? null,
      seoDescricao: linha.seo_descricao ?? null,
      produtos,
      kit,
      promocao,
      source: 'supabase',
    }
  }

  private async buscarProdutosVinculados(mimoId: number): Promise<MimoProdutoRef[]> {
    const { data, error } = await supabase
      .from('mimo_produto')
      .select(`
        ordem,
        produto:produto_id (${PRODUTO_SELECT})
      `)
      .eq('mimo_id', mimoId)
      .order('ordem', { ascending: true })
    if (error || !data) return []
    const vinculacao = data as unknown as Array<{ produto: ProdutoRow }>
    return vinculacao
      .filter((item) => item.produto && item.produto.ativo)
      .map((item) => toProdutoRef(item.produto))
  }

  private async buscarKit(kitProdutoId: number): Promise<MimoKit | null> {
    const { data, error } = await supabase
      .from('produto')
      .select(PRODUTO_SELECT)
      .eq('id', kitProdutoId)
      .eq('ativo', true)
      .single()
    if (error || !data) return null
    const kitRow = data as ProdutoRow
    return {
      id: String(kitRow.id),
      slug: kitRow.slug,
      nome: kitRow.nome,
      preco: kitRow.preco_base ?? null,
      imagem: imagemPrincipal(kitRow.produto_imagem),
      composicao: await this.buscarComposicaoKit(kitRow.id),
    }
  }

  private async buscarComposicaoKit(kitId: number): Promise<MimoProdutoRef[]> {
    const { data: opcoes, error: opcoesError } = await supabase
      .from('produto_opcao_compra')
      .select('id')
      .eq('produto_id', kitId)
      .eq('tipo', 'kit')
      .eq('ativo', true)
    if (opcoesError || !opcoes || opcoes.length === 0) return []
    const opcaoIds = opcoes.map((opcao: { id: number }) => opcao.id)
    const { data: itens, error: itensError } = await supabase
      .from('kit_composicao')
      .select(`
        quantidade,
        produto:produto_id (id, nome, slug, preco_base, ativo)
      `)
      .in('produto_opcao_id', opcaoIds)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
    if (itensError || !itens) return []
    const composicao = itens as unknown as Array<{
      quantidade: number
      produto: ProdutoRow
    }>
    const referencias: MimoProdutoRef[] = []
    for (const item of composicao) {
      if (!item.produto || !item.produto.ativo) continue
      const ref = toProdutoRef(item.produto)
      for (let i = 0; i < item.quantidade; i++) {
        referencias.push(ref)
      }
    }
    return referencias
  }

  private async buscarPromocao(promocaoId: number): Promise<MimoPromocao | null> {
    const { data, error } = await supabase
      .from('promocao')
      .select('id, produto_id, tipo, valor, data_inicio, data_fim, ativo')
      .eq('id', promocaoId)
      .single()
    if (error || !data) return null
    const promocaoRow = data as {
      id: number
      produto_id: number
      tipo: string
      valor: number
      data_inicio: string
      data_fim: string
      ativo: boolean
    }
    if (
      !promocaoRow.ativo ||
      promocaoRow.data_inicio > hojeISODate() ||
      promocaoRow.data_fim < hojeISODate()
    ) {
      return null
    }
    const { data: produto, error: produtoError } = await supabase
      .from('produto')
      .select(PRODUTO_SELECT)
      .eq('id', promocaoRow.produto_id)
      .eq('ativo', true)
      .single()
    if (produtoError || !produto) return null
    const tipo = promocaoRow.tipo === 'percentual' ? 'percentual' : 'fixo'
    return {
      id: String(promocaoRow.id),
      tipo,
      valor: Number(promocaoRow.valor),
      dataFim: promocaoRow.data_fim,
      produto: toProdutoRef(produto as ProdutoRow),
    }
  }
}
