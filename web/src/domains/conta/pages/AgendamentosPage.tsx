import { CalendarClock } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ContaProtegida } from '../components/ContaProtegida'
import { EstadoComercialVazio } from '../components/EstadoComercialVazio'

/**
 * Agendamentos — os protocolos AG-…
 * da cliente, quando o backend
 * existir. Nada inventado.
 */
export function AgendamentosPage() {
  return (
    <ContaProtegida>
      <div>
        <SeoHead
          title="Meus agendamentos — Angel Cosméticos"
          description="Acompanhe seus agendamentos Angel Cosméticos."
          canonical="/conta/agendamentos"
          jsonLd={breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Minha conta', href: '/conta' },
            { name: 'Agendamentos', href: '/conta/agendamentos' },
          ])}
        />

        <header className="section-angel">
          <div className="container-angel max-w-3xl">
            <p className="overline-angel mb-3">
              Minha conta
            </p>
            <h1 className="title-h1">
              Meus agendamentos
            </h1>
          </div>
        </header>

        <section className="section-angel-tight">
          <div className="container-angel max-w-3xl">
            <EstadoComercialVazio
              icon={CalendarClock}
              titulo="Nenhum agendamento por aqui"
              descricao="Suas experiências agendadas, com data, horário e protocolo, aparecem nesta página."
            />
          </div>
        </section>
      </div>
    </ContaProtegida>
  )
}
