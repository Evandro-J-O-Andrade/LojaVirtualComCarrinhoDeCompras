import { Route } from 'react-router-dom'
import {
  SobrePage,
  BelezaPage,
  MaquiagemPage,
  BelezaEditorialPage,
  MaquiagemEditorialPage,
} from './pages/lazy'

export const institucionalRoutes = (
  <>
    <Route path="/sobre" element={<SobrePage />} />
    <Route path="/beleza" element={<BelezaPage />} />
    <Route path="/maquiagem" element={<MaquiagemPage />} />
    <Route
      path="/beleza/:slug"
      element={<BelezaEditorialPage />}
    />
    <Route
      path="/maquiagem/:slug"
      element={<MaquiagemEditorialPage />}
    />
  </>
)
