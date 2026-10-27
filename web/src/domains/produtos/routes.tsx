import { Route } from 'react-router-dom'
import {
  ProductsPage,
  ProductDetailPage,
  CategoriasPage,
  CategoriaDetailPage,
  ColecoesPage,
} from './pages/lazy'

export const produtoRoutes = (
  <>
    <Route path="/produtos" element={<ProductsPage />} />
    <Route path="/produtos/:slug" element={<ProductDetailPage />} />
    <Route path="/categorias" element={<CategoriasPage />} />
    <Route
      path="/categorias/:slug"
      element={<CategoriaDetailPage />}
    />
    <Route path="/colecoes" element={<ColecoesPage />} />
    <Route path="/colecoes/:slug" element={<ColecoesPage />} />
  </>
)
