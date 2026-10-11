import { useQuery } from '@tanstack/react-query'
import { SupabaseServiceRepository } from '../repositories/service.repository.supabase'
import { ServiceCatalogAdapter } from '../adapters/service.adapter'

const serviceCatalog = new ServiceCatalogAdapter(new SupabaseServiceRepository())

export function useServices() {
  return useQuery({
    queryKey: ['servicos'],
    queryFn: () => serviceCatalog.listServices(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useService(slug: string | undefined) {
  return useQuery({
    queryKey: ['servicos', slug],
    queryFn: () => serviceCatalog.getServiceBySlug(slug!),
    enabled: Boolean(slug),
  })
}
