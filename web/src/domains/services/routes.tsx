import { Route } from 'react-router-dom'
import { ServicesPage, ServiceDetailPage } from './pages/lazy'

export const serviceRoutes = (
  <>
    <Route path="/servicos" element={<ServicesPage />} />
    <Route path="/servicos/:slug" element={<ServiceDetailPage />} />
  </>
)
