import { Route } from 'react-router-dom'
import { AcervoVisualPage } from './pages/AcervoVisualPage'
import {
  ExperienciasPage,
  ExperienciaDetailPage,
} from './pages/lazy'

export const conteudoRoutes = (
  <>
    <Route path="/acervo-visual" element={<AcervoVisualPage />} />
    <Route path="/experiencias" element={<ExperienciasPage />} />
    <Route
      path="/experiencias/:slug"
      element={<ExperienciaDetailPage />}
    />
  </>
)
