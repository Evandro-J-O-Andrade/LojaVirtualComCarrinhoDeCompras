import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/Home'
import { ProductsPage } from '@/pages/Products'
import { ProductDetailPage } from '@/pages/Product'
import { CarrinhoPage } from '@/pages/Carrinho'
import { ContaPage } from '@/pages/Conta'
import { ContatoPage } from '@/pages/Contato'
import { SobrePage } from '@/pages/Sobre'
import { CheckoutPage } from '@/pages/Checkout'
import { AdminPage } from '@/pages/Admin'
import { AdminProdutos } from '@/pages/Admin/Produtos'
import { AdminOrcamentos } from '@/pages/Admin/Orcamentos'
import { OrcamentoNovo } from '@/pages/Admin/OrcamentoNovo'
import { AdminLogin } from '@/pages/Admin/Login'
import { OrcamentoPage } from '@/pages/Orcamento'
import { AtendimentoPage } from '@/pages/Atendimento'
import { DiagnosticoPage } from '@/pages/Diagnostico'
import { FavoritosPage } from '@/pages/Favoritos'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function AngelRouter() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produtos/:slug" element={<ProductDetailPage />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/conta" element={<ContaPage />} />
          <Route path="/conta/favoritos" element={<FavoritosPage />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/orcamentos/novo" element={<OrcamentoPage />} />
          <Route path="/atendimento" element={<AtendimentoPage />} />
          <Route path="/diagnostico" element={<DiagnosticoPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/produtos" element={<AdminProdutos />} />
          <Route path="/admin/orcamentos" element={<AdminOrcamentos />} />
          <Route path="/admin/orcamentos/novo" element={<OrcamentoNovo />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}