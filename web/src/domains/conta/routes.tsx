import { Route } from 'react-router-dom'
import {
  EntrarPage,
  CadastroPage,
  RecuperarSenhaPage,
  ContaPage,
  PerfilPage,
  PedidosPage,
  OrcamentosPage,
  AgendamentosPage,
  FavoritosPage,
  SegurancaPage,
} from './pages/lazy'

/**
 * Rotas da conta.
 *
 * `/conta/favoritos` é a única
 * acessível ao visitante: favoritos são
 * locais e não exigem identidade. As
 * demais passam por `ContaProtegida`.
 */
export const contaRoutes = (
  <>
    <Route
      path="/entrar"
      element={<EntrarPage />}
    />
    <Route
      path="/cadastro"
      element={<CadastroPage />}
    />
    <Route
      path="/recuperar-senha"
      element={<RecuperarSenhaPage />}
    />
    <Route
      path="/conta"
      element={<ContaPage />}
    />
    <Route
      path="/conta/perfil"
      element={<PerfilPage />}
    />
    <Route
      path="/conta/pedidos"
      element={<PedidosPage />}
    />
    <Route
      path="/conta/orcamentos"
      element={<OrcamentosPage />}
    />
    <Route
      path="/conta/agendamentos"
      element={<AgendamentosPage />}
    />
    <Route
      path="/conta/favoritos"
      element={<FavoritosPage />}
    />
    <Route
      path="/conta/seguranca"
      element={<SegurancaPage />}
    />
  </>
)
