import { useQuery } from '@tanstack/react-query'
import { SupabaseMimoRepository } from '../repositories/mimo.repository.supabase'
import { MimoCatalogAdapter } from '../adapters/mimo.adapter'

const mimoCatalog = new MimoCatalogAdapter(new SupabaseMimoRepository())

export function useMimos() {
  return useQuery({
    queryKey: ['mimos'],
    queryFn: () => mimoCatalog.listMimos(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMimo(slug: string | undefined) {
  return useQuery({
    queryKey: ['mimos', slug],
    queryFn: () => mimoCatalog.getMimoBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useMimosPorProduto(slug: string | undefined) {
  return useQuery({
    queryKey: ['mimos-por-produto', slug],
    queryFn: () => mimoCatalog.listMimosPorProduto(slug!),
    enabled: Boolean(slug),
  })
}
