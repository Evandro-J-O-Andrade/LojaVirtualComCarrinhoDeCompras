import { Outlet } from 'react-router-dom'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/commerce/WhatsAppFloat'

/**
 * App Shell público.
 *
 * `app-shell` garante que páginas curtas ocupem a viewport e que o footer
 * fique no fim. `app-shell__main` lê a altura do header de `--header-h`,
 * o mesmo token consumido pelo Header — nenhum dos dois sabe do outro.
 */
export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main id="conteudo" className="app-shell__main">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
