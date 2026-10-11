import { Route } from 'react-router-dom'
import { BookingPage } from './pages/lazy'

export const bookingRoutes = (
  <>
    <Route path="/agendamento" element={<BookingPage />} />
  </>
)
