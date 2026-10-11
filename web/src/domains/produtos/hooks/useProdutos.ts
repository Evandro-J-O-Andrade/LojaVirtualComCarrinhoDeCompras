import { useQuery } from '@tanstack/react-query'
import { SupabaseProdutoRepository } from '../repositories/produto.repository.supabase'
import { ProdutoCatalogAdapter } from '../adapters/produto.adapter'
import type { ProdutoFiltro } from '../model/produto'

const produtoCatalog = new ProdutoCatalogAdapter(
  new SupabaseProdutoRepository(),
)

export function useProdutos(filtro?: ProdutoFiltro) {
  return useQuery({
    queryKey: ['produtos', filtro?.search ?? '', filtro?.categoriaSlug ?? ''],
    queryFn: () => produtoCatalog.listProdutos(filtro),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProduto(slug: string | undefined) {
  return useQuery({
    queryKey: ['produtos', slug],
    queryFn: () => produtoCatalog.getProdutoBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useProdutosRelacionados(
  slug: string | undefined,
  limit = 4,
) {
  return useQuery({
    queryKey: ['produtos-relacionados', slug, limit],
    queryFn: () => produtoCatalog.getProdutosRelacionados(slug!, limit),
    enabled: Boolean(slug),
  })
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => produtoCatalog.listCategorias(),
    staleTime: 10 * 60 * 1000,
  })
}
