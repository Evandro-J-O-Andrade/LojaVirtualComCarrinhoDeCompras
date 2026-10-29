import { supabase } from '@/lib/supabase'

export interface DadosProdutoAdmin {
  nome: string
  slug: string
  sku: string | null
  descricao: string | null
  precoBase: number
  ativo: boolean
  categoriaIds?: string[]
}

function validarDados(valores: DadosProdutoAdmin): void {
  if (!valores.nome.trim() || !valores.slug.trim()) {
    throw new Error('Nome e slug são obrigatórios.')
  }
  if (!Number.isFinite(valores.precoBase) || valores.precoBase < 0) {
    throw new Error('Informe um preço válido, igual ou maior que zero.')
  }
}

export async function criarProdutoAdmin(valores: DadosProdutoAdmin): Promise<string> {
  validarDados(valores)
  const { data, error } = await supabase
    .from('produto')
    .insert({
      nome: valores.nome.trim(),
      slug: valores.slug.trim(),
      sku: valores.sku?.trim() || null,
      descricao: valores.descricao?.trim() || null,
      preco_base: valores.precoBase,
      ativo: valores.ativo,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(`Não foi possível criar o produto: ${error.message}`)
  if (!data) throw new Error('O Supabase não retornou o produto criado.')
  const produtoId = Number(data.id)

  if (valores.categoriaIds && valores.categoriaIds.length > 0) {
    const { error: erroInsert } = await supabase
      .from('produto_categoria')
      .insert(valores.categoriaIds.map((cid) => ({
        produto_id: produtoId,
        categoria_id: Number(cid),
      })))
    if (erroInsert) throw new Error(`Não foi possível associar categorias: ${erroInsert.message}`)
  }

  return String(produtoId)
}

export async function atualizarProdutoAdmin(
  produtoId: number,
  valores: DadosProdutoAdmin,
): Promise<void> {
  if (!Number.isSafeInteger(produtoId) || produtoId <= 0) {
    throw new Error('Identificador de produto inválido.')
  }
  validarDados(valores)

  const { data, error } = await supabase
    .from('produto')
    .update({
      nome: valores.nome.trim(),
      slug: valores.slug.trim(),
      sku: valores.sku?.trim() || null,
      descricao: valores.descricao?.trim() || null,
      preco_base: valores.precoBase,
      ativo: valores.ativo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', produtoId)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(`Não foi possível salvar o produto: ${error.message}`)
  if (!data) throw new Error('Nenhum produto foi atualizado. Verifique sua permissão administrativa e tente novamente.')

  if (valores.categoriaIds !== undefined) {
    const { data: existentes, error: erroLeitura } = await supabase
      .from('produto_categoria')
      .select('categoria_id')
      .eq('produto_id', produtoId)
    if (erroLeitura) throw new Error(`Não foi possível ler categorias existentes: ${erroLeitura.message}`)

    const categoriasAnteriores = (existentes ?? []).map((row: { categoria_id: number }) => row.categoria_id)

    const { error: erroDelete } = await supabase
      .from('produto_categoria')
      .delete()
      .eq('produto_id', produtoId)
    if (erroDelete) throw new Error(`Não foi possível atualizar categorias: ${erroDelete.message}`)

    if (valores.categoriaIds.length > 0) {
      const { error: erroInsert } = await supabase
        .from('produto_categoria')
        .insert(valores.categoriaIds.map((cid) => ({
          produto_id: produtoId,
          categoria_id: Number(cid),
        })))
      if (erroInsert) {
        // Tentar restaurar as associações anteriores
        if (categoriasAnteriores.length > 0) {
          await supabase
            .from('produto_categoria')
            .insert(categoriasAnteriores.map((cid) => ({
              produto_id: produtoId,
              categoria_id: cid,
            })))
        }
        throw new Error(`Não foi possível associar categorias: ${erroInsert.message}`)
      }
    }
  }
}
