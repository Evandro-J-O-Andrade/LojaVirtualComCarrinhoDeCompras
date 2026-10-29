import { supabase } from '@/lib/supabase'

export interface DadosProdutoAdmin {
  nome: string
  slug: string
  sku: string | null
  descricao: string | null
  precoBase: number
  ativo: boolean
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
  return String(data.id)
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
}
