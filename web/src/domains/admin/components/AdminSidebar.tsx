import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  ADMIN_GRUPOS,
  type AdminModulo,
} from '../model/admin'
import { AdminLogoLink } from './AdminShell'

interface AdminSidebarProps {
  onNavigate?: () => void
}

/**
 * Sidebar administrativa agrupada —
 * não uma lista gigante. Módulos
 * previstos ficam marcados como
 * "em breve": nunca link quebrado,
 * nunca página falsa.
 */
export function AdminSidebar({
  onNavigate,
}: AdminSidebarProps) {
  const location = useLocation()

  return (
    <aside className="flex h-dvh w-64 flex-col bg-charcoal text-ivory">
      <div className="border-b border-white/10 p-5">
        <AdminLogoLink />
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Navegação administrativa"
      >
        {ADMIN_GRUPOS.map((grupo) => (
          <section key={grupo.grupo} className="mb-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-warm-gray">
              {grupo.grupo}
            </p>
            <ul className="space-y-0.5">
              {grupo.modulos.map(
                (modulo: AdminModulo) => (
                  <li key={modulo.rotulo}>
                    <ModuloLink
                      modulo={modulo}
                      ativo={
                        modulo.href !== null &&
                        (location.pathname ===
                          modulo.href ||
                          (modulo.href !== '/admin' &&
                            location.pathname.startsWith(
                              `${modulo.href}/`,
                            )))
                      }
                      onNavigate={onNavigate}
                    />
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}

function ModuloLink({
  modulo,
  ativo,
  onNavigate,
}: {
  modulo: AdminModulo
  ativo: boolean
  onNavigate?: () => void
}) {
  const Icon = modulo.icon

  if (modulo.emBreve || modulo.href === null) {
    return (
      <span
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-warm-gray/60"
        title="Módulo previsto — disponível em breve"
      >
        <Icon size={18} aria-hidden />
        <span className="flex-1">
          {modulo.rotulo}
        </span>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-warm-gray/60">
          em breve
        </span>
      </span>
    )
  }

  return (
    <Link
      to={modulo.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
        ativo
          ? 'bg-deep-rose font-medium text-white'
          : 'text-warm-gray hover:bg-white/10 hover:text-white',
      )}
      aria-current={ativo ? 'page' : undefined}
    >
      <Icon size={18} aria-hidden />
      <span className="flex-1">
        {modulo.rotulo}
      </span>
    </Link>
  )
}
