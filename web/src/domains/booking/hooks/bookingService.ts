import { SupabaseBookingRepository } from '../repositories/booking.repository.supabase'
import { BookingAdapter } from '../adapters/booking.adapter'

export const bookingService = new BookingAdapter(new SupabaseBookingRepository())
