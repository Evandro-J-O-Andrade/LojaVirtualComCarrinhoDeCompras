import { FileText } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ContaProtegida } from '../components/ContaProtegida'
import { EstadoComercialVazio } from '../components/EstadoComercialVazio'

/**
 * Orçamentos — os orçamentos da
 * cliente, quando o backend existir.
 * Nenhum rascunho local vira histórico.
 */
export function OrcamentosPage() {
  return (
    <ContaProtegida>
      <div>
        <SeoHead
          title="Meus orçamentos — Angel Cosméticos"
          description="Acompanhe seus orçamentos Angel Cosméticos."
          canonical="/conta/orcamentos"
          jsonLd={breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Minha conta', href: '/conta' },
            { name: 'Orçamentos', href: '/conta/orcamentos' },
          ])}
        />

        <header className="section-angel">
          <div className="container-angel max-w-3xl">
            <p className="overline-angel mb-3">
              Minha conta
            </p>
            <h1 className="title-h1">
              Meus orçamentos
            </h1>
          </div>
        </header>

        <section className="section-angel-tight">
          <div className="container-angel max-w-3xl">
            <EstadoComercialVazio
              icon={FileText}
              titulo="Nenhum orçamento por aqui"
              descricao="Os orçamentos que você solicitar, com protocolo e validade, aparecem nesta página."
            />
          </div>
        </section>
      </div>
    </ContaProtegida>
  )
}
