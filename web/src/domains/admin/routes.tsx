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
import { AdminServicosPage } from '../services/pages/lazy'
import { AdminProfissionaisPage } from '../services/pages/lazy'
import { AdminMimosPage } from '../mimos/pages/lazy'
import { AdminAtendimentosPage } from '../atendimento/pages/lazy'
import { AdminPromocoesPage } from '../produtos/pages/lazy'
  import { AdminOrcamentosPage } from '../orcamentos/pages/lazy'
  import { AdminNotificacoesPage } from '../atendimento/pages/lazy'
  import { AdminPedidosPage } from '../pedidos/pages/lazy'
  import { AdminPagamentosPage } from '../pagamentos/pages/lazy'
import { AdminEstoquePage } from '../produtos/pages/lazy'
import { AdminKitsPage } from '../produtos/pages/lazy'
import { AdminEventosPage } from '../atendimento/pages/lazy'
import { AdminAuditoriaPage } from './pages/AdminAuditoriaPage'
import { AdminClientesPage } from '../clientes/pages/lazy'
import { AdminMidiaPage } from './pages/AdminMidiaPage'
import { AdminConfiguracoesPage } from './pages/AdminConfiguracoesPage'
  import { AdminAgendaPage } from '../booking/pages/lazy'
import { AdminAgendamentosPage } from '../booking/pages/lazy'

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
    <Route
      path="/admin/servicos"
      element={<AdminServicosPage />}
    />
    <Route
      path="/admin/profissionais"
      element={<AdminProfissionaisPage />}
    />
    <Route
      path="/admin/mimos"
      element={<AdminMimosPage />}
    />
    <Route
      path="/admin/atendimentos"
      element={<AdminAtendimentosPage />}
    />
    <Route
      path="/admin/promocoes"
      element={<AdminPromocoesPage />}
    />
    <Route
      path="/admin/orcamentos"
      element={<AdminOrcamentosPage />}
    />
    <Route
      path="/admin/notificacoes"
      element={<AdminNotificacoesPage />}
    />
      <Route
        path="/admin/pedidos"
        element={<AdminPedidosPage />}
      />
      <Route
        path="/admin/pagamentos"
        element={<AdminPagamentosPage />}
      />
      <Route
        path="/admin/estoque"
        element={<AdminEstoquePage />}
      />
    <Route
      path="/admin/kits"
      element={<AdminKitsPage />}
    />
    <Route
      path="/admin/eventos"
      element={<AdminEventosPage />}
    />
    <Route
      path="/admin/auditoria"
      element={<AdminAuditoriaPage />}
    />
    <Route
      path="/admin/midia"
      element={<AdminMidiaPage />}
    />
    <Route
      path="/admin/configuracoes"
      element={<AdminConfiguracoesPage />}
    />
    <Route
      path="/admin/clientes"
      element={<AdminClientesPage />}
    />
      <Route
        path="/admin/agenda"
        element={<AdminAgendaPage />}
      />
    <Route
      path="/admin/agendamentos"
      element={<AdminAgendamentosPage />}
    />
  </Route>
)
