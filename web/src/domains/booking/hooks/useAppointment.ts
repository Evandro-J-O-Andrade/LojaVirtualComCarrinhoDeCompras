import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppointmentDraft, BookingConfirmation } from '../model/appointment'
import { bookingService } from './bookingService'

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation<BookingConfirmation, Error, AppointmentDraft>({
    mutationFn: (draft) => bookingService.createAppointment(draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamento'] })
    },
  })
}
