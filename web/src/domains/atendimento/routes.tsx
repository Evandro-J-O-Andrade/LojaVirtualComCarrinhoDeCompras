import { Route } from 'react-router-dom'
import {
  AtendimentoPage,
  ContatoPage,
} from './pages/lazy'

export const atendimentoRoutes = (
  <>
    <Route
      path="/contato"
      element={<ContatoPage />}
    />
    <Route
      path="/atendimento"
      element={<AtendimentoPage />}
    />
  </>
)
