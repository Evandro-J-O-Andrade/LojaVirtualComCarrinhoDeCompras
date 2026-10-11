import { Route } from 'react-router-dom'
import {
  ProductsPage,
  ProductDetailPage,
  CategoriasPage,
  CategoriaDetailPage,
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
  </>
)
