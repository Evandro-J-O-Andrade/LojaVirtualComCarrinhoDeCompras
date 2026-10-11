import { Route } from 'react-router-dom'
import { MimosPage, MimoDetailPage } from './pages/lazy'

export const mimoRoutes = (
  <>
    <Route path="/mimos" element={<MimosPage />} />
    <Route path="/mimos/:slug" element={<MimoDetailPage />} />
  </>
)
