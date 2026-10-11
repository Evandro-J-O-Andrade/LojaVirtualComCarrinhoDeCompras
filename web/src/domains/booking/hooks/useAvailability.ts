import { useQuery } from '@tanstack/react-query'
import type { AvailabilityState } from '../model/availability'
import { bookingService } from './bookingService'

export function useAvailability(
  serviceId: string | null,
  professionalId: string | null,
  date: string | null,
) {
  const query = useQuery<AvailabilityState, Error>({
    queryKey: ['agendamento', 'disponibilidade', serviceId, professionalId, date],
    queryFn: () => bookingService.getAvailability(serviceId!, professionalId, date!),
    enabled: Boolean(serviceId && date),
    staleTime: 30 * 1000,
  })

  return {
    ...query,
    data: query.data ?? (query.error ? ({ kind: 'unknown' } as const) : undefined),
  }
}
