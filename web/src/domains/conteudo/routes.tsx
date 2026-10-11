import { Route } from 'react-router-dom'
import {
  ExperienciasPage,
  ExperienciaDetailPage,
} from './pages/lazy'

export const conteudoRoutes = (
  <>
    <Route path="/experiencias" element={<ExperienciasPage />} />
    <Route
      path="/experiencias/:slug"
      element={<ExperienciaDetailPage />}
    />
  </>
)
