import { useQuery } from '@tanstack/react-query'
import type { ServiceProfessionalLink } from '../model/appointment'
import { bookingService } from './bookingService'

export function useServiceProfessionals(serviceId: string | null) {
  const query = useQuery<ServiceProfessionalLink, Error>({
    queryKey: ['servicos', serviceId, 'profissionais'],
    queryFn: () => bookingService.listProfessionals(serviceId!),
    enabled: Boolean(serviceId),
    staleTime: 5 * 60 * 1000,
  })

  return {
    ...query,
    data: query.data ?? (query.error ? ({ kind: 'unknown' } as const) : undefined),
  }
}
