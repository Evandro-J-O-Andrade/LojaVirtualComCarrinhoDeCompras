import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { homeRoutes } from '@/domains/home/routes'
import { serviceRoutes } from '@/domains/services/routes'
import { bookingRoutes } from '@/domains/booking/routes'
import { mimoRoutes } from '@/domains/mimos/routes'
import { produtoRoutes } from '@/domains/produtos/routes'
import { orcamentoRoutes } from '@/domains/orcamentos/routes'
import { institucionalRoutes } from '@/domains/institucional/routes'
import { conteudoRoutes } from '@/domains/conteudo/routes'
import { atendimentoRoutes } from '@/domains/atendimento/routes'
import { contaRoutes } from '@/domains/conta/routes'
import { adminRoutes } from '@/domains/admin/routes'
import { CarrinhoPage } from '@/domains/carrinho/pages/lazy'
import { CheckoutPage } from '@/domains/checkout/pages/lazy'

// Code splitting por rota: só a Home é do caminho inicial.
// As demais são buscadas sob demanda, sem alterar rotas nem comportamento.
const DiagnosticoPage = lazy(() => import('@/pages/Diagnostico').then((m) => ({ default: m.DiagnosticoPage })))
const AdminLogin = lazy(() => import('@/pages/Admin/Login').then((m) => ({ default: m.AdminLogin })))

export function AngelRouter() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
            <Route element={<Layout />}>
              {homeRoutes}
              {produtoRoutes}
              <Route path="/carrinho" element={<CarrinhoPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {institucionalRoutes}
              {atendimentoRoutes}
              {contaRoutes}
              {conteudoRoutes}
              {orcamentoRoutes}
              <Route path="/diagnostico" element={<DiagnosticoPage />} />
              {serviceRoutes}
              {bookingRoutes}
              {mimoRoutes}
            </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            {adminRoutes}
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}