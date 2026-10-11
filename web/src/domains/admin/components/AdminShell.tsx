import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccount } from '@/domains/conta/context/AccountContext'
import { AdminPermissionProvider } from '../context/AdminPermissionContext'
import { AdminSidebar } from './AdminSidebar'
import { AdminBreadcrumb } from './AdminBreadcrumb'

/**
 * AdminShell — shell administrativo
 * próprio, não o editorial da loja.
 *
 * Identidade vem da conta real
 * (Supabase Auth); sair encerra a
 * sessão real. Produtividade:
 * sidebar agrupada, breadcrumb,
 * conteúdo denso.
 */
export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, signOut } = useAccount()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sidebar mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity lg:hidden',
          sidebarOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      >
        <div
          className="absolute inset-0 bg-charcoal/50"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="relative flex h-full w-64 flex-col bg-charcoal text-ivory">
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-champagne bg-white">
          <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-content-muted hover:bg-surface-alt lg:hidden"
                aria-label="Abrir menu administrativo"
                aria-expanded={sidebarOpen}
              >
                <Menu size={20} aria-hidden />
              </button>
              <AdminBreadcrumb caminho={location.pathname} />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-sm text-content-muted md:block">
                {profile?.email ?? 'Administradora'}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-champagne px-3 py-1.5 text-sm font-medium text-soft-black transition-colors hover:border-coral hover:bg-coral/10"
              >
                <LogOut size={16} aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <AdminPermissionProvider>
            <Outlet />
          </AdminPermissionProvider>
        </main>
      </div>
    </div>
  )
}

/** Link interno da loja dentro do painel. */
export function AdminLogoLink() {
  return (
    <Link to="/admin" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-rose font-display font-bold text-white">
        A
      </div>
      <div>
        <span className="font-display block font-bold text-ivory">
          ANGEL
        </span>
        <span className="text-xs text-warm-gray">
          Painel administrativo
        </span>
      </div>
    </Link>
  )
}
