import { Route } from 'react-router-dom'
import {
  DashboardPage,
  AdminProdutosPage,
  AdminProdutoDetalhePage,
} from './pages/lazy'
import { AdminShell } from './components/AdminShell'
import { AdminProdutoNovoPage } from './pages/AdminProdutoNovoPage'

/**
 * Rotas administrativas — dentro do
 * shell próprio (AdminShell) e do
 * gate de autenticação real
 * (ProtectedRoute, no router).
 *
 * Primeiro corte (12A): shell +
 * dashboard + produtos (lista e
 * detalhe). Os demais módulos
 * permanecem "em breve" na sidebar.
 */
export const adminRoutes = (
  <Route element={<AdminShell />}>
    <Route
      path="/admin"
      element={<DashboardPage />}
    />
    <Route
      path="/admin/produtos"
      element={<AdminProdutosPage />}
    />
    <Route
      path="/admin/produtos/novo"
      element={<AdminProdutoNovoPage />}
    />
    <Route
      path="/admin/produtos/:id"
      element={<AdminProdutoDetalhePage />}
    />
  </Route>
)
