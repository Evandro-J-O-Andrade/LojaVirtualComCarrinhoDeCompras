import { Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'

// A Home é o caminho inicial: entra no bundle
// principal, sem lazy, para não atrasar a
// primeira pintura.
export const homeRoutes = (
  <>
    <Route path="/" element={<HomePage />} />
  </>
)
