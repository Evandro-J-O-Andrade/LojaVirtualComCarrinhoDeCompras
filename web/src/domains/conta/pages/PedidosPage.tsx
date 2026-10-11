import { Package } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ContaProtegida } from '../components/ContaProtegida'
import { EstadoComercialVazio } from '../components/EstadoComercialVazio'

/**
 * Pedidos — histórico real ou nada.
 *
 * Enquanto a Etapa 8 não integrar o
 * backend, não há pedidos para listar
 * e nenhum é inventado.
 */
export function PedidosPage() {
  return (
    <ContaProtegida>
      <div>
        <SeoHead
          title="Meus pedidos — Angel Cosméticos"
          description="Acompanhe seus pedidos Angel Cosméticos."
          canonical="/conta/pedidos"
          jsonLd={breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Minha conta', href: '/conta' },
            { name: 'Pedidos', href: '/conta/pedidos' },
          ])}
        />

        <header className="section-angel">
          <div className="container-angel max-w-3xl">
            <p className="overline-angel mb-3">
              Minha conta
            </p>
            <h1 className="title-h1">
              Meus pedidos
            </h1>
          </div>
        </header>

        <section className="section-angel-tight">
          <div className="container-angel max-w-3xl">
            <EstadoComercialVazio
              icon={Package}
              titulo="Nenhum pedido por aqui"
              descricao="Quando você comprar, seus pedidos e o status de entrega aparecem nesta página."
            />
          </div>
        </section>
      </div>
    </ContaProtegida>
  )
}
