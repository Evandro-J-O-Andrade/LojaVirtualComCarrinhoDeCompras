import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccount } from '@/domains/conta/context/AccountContext'
import { AdminPermissionProvider } from '../context/AdminPermissionContext'
import { AdminSidebar } from './AdminSidebar'
import { AdminBreadcrumb } from './AdminBreadcrumb'
import { AdminAvatar } from './AdminAvatar'

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { profile, signOut } = useAccount()
  const location = useLocation()
  const nomeExibicao = profile?.nome || profile?.email || 'Administradora'

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-ivory">
      <div
        className={cn(
          'fixed inset-0 z-40 bg-charcoal/50 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!sidebarOpen}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu administrativo"
          tabIndex={sidebarOpen ? 0 : -1}
        />
        <div className="absolute inset-y-0 left-0 shadow-2xl">
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="hidden lg:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 shrink-0 border-b border-champagne bg-white">
          <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
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
            <div className="flex shrink-0 items-center gap-3">
              <AdminAvatar />
              <span className="hidden max-w-48 truncate text-sm text-content-muted md:block" title={nomeExibicao}>
                {nomeExibicao}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-champagne px-3 py-1.5 text-sm font-medium text-soft-black transition-colors hover:border-coral hover:bg-coral/10"
              >
                <LogOut size={16} aria-hidden />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

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

export function AdminLogoLink({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/admin" className={cn('flex items-center gap-3', collapsed && 'justify-center')} title={collapsed ? 'Painel administrativo Angel' : undefined}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-deep-rose font-display font-bold text-white">
        A
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <span className="block font-display font-bold text-ivory">ANGEL</span>
          <span className="text-xs text-warm-gray">Painel administrativo</span>
        </div>
      )}
    </Link>
  )
}
