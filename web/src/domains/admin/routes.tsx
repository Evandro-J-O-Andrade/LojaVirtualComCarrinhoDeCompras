import { Route } from 'react-router-dom'
import {
  DashboardPage,
  AdminProdutosPage,
  AdminProdutoDetalhePage,
} from './pages/lazy'
import { AdminShell } from './components/AdminShell'
import { AdminProdutoNovoPage } from './pages/AdminProdutoNovoPage'
import { AdminCategoriasPage } from './pages/AdminCategoriasPage'
import { AdminPaginasPage } from '../cms/pages/lazy'
import { AdminExperienciasPage } from '../experiencias/pages/lazy'

/**
 * Rotas administrativas
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
      path="/admin/categorias"
      element={<AdminCategoriasPage />}
    />
    <Route
      path="/admin/produtos/novo"
      element={<AdminProdutoNovoPage />}
    />
    <Route
      path="/admin/produtos/:id"
      element={<AdminProdutoDetalhePage />}
    />
    <Route
      path="/admin/paginas"
      element={<AdminPaginasPage />}
    />
    <Route
      path="/admin/experiencias"
      element={<AdminExperienciasPage />}
    />
  </Route>
)
