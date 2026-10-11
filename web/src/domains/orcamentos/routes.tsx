import { Route } from 'react-router-dom'
import { NovoOrcamentoPage } from './pages/lazy'

export const orcamentoRoutes = (
  <>
    <Route path="/orcamentos/novo" element={<NovoOrcamentoPage />} />
  </>
)
