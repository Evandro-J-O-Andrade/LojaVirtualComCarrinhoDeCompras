import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccount } from '@/domains/conta/context/AccountContext'
import { AdminPermissionProvider } from '../context/AdminPermissionContext'
import { AdminSidebar } from './AdminSidebar'
import { AdminBreadcrumb } from './AdminBreadcrumb'

/**
 * AdminShell — estrutura fixa do painel.
 * Sidebar, cabeçalho e rodapé permanecem imóveis;
 * somente a área central de trabalho possui scroll.
 * A loja pública permanece acessível pelo cabeçalho.
 */
export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, signOut } = useAccount()
  const location = useLocation()
  const navigate = useNavigate()

  const nomeExibicao = profile?.nome || profile?.email || 'Administradora'

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-ivory">
      {/* Sidebar mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!sidebarOpen}
      >
        <button
          type="button"
          aria-label="Fechar menu administrativo"
          tabIndex={sidebarOpen ? 0 : -1}
          className="absolute inset-0 h-full w-full cursor-default bg-charcoal/50"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="relative flex h-full w-64 flex-col bg-charcoal text-ivory">
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Sidebar desktop: altura da viewport, sem acompanhar o scroll do conteúdo */}
      <div className="hidden h-dvh shrink-0 lg:block">
        <AdminSidebar />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 shrink-0 border-b border-champagne bg-white">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-content-muted hover:bg-surface-alt lg:hidden"
                aria-label="Abrir menu administrativo"
                aria-expanded={sidebarOpen}
              >
                <Menu size={20} aria-hidden />
              </button>
              <AdminBreadcrumb caminho={location.pathname} />
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden max-w-44 truncate text-sm text-content-muted md:block">
                {nomeExibicao}
              </span>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-deep-rose transition-colors hover:bg-surface-alt sm:px-3"
                aria-label="Voltar para a loja pública"
              >
                <ArrowLeft size={16} aria-hidden />
                <span className="hidden sm:inline">Voltar à loja</span>
                <span className="sm:hidden">Loja</span>
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-champagne px-3 py-1.5 text-sm font-medium text-soft-black transition-colors hover:border-coral hover:bg-coral/10"
              >
                <LogOut size={16} aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Única região com rolagem vertical no shell administrativo */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AdminPermissionProvider>
            <Outlet />
          </AdminPermissionProvider>
        </main>

        <footer className="shrink-0 border-t border-champagne bg-white px-4 py-3 text-xs text-content-muted lg:px-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span>© Angel Cosméticos e Lingerie — Todos os direitos reservados.</span>
            <a
              href="https://newwavesistemasdigitais.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-deep-rose hover:underline"
            >
              Feito por New Wave Sistemas Digitais
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

/** Identidade administrativa; a loja pública é acessada pelo link do cabeçalho. */
export function AdminLogoLink() {
  return (
    <Link to="/admin" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-rose font-display font-bold text-white">
        A
      </div>
      <div>
        <span className="font-display block font-bold text-ivory">ANGEL</span>
        <span className="text-xs text-warm-gray">Painel administrativo</span>
      </div>
    </Link>
  )
}
