import { ChevronLeft, ChevronRight, Store } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ADMIN_GRUPOS, type AdminModulo } from '../model/admin'
import { AdminLogoLink } from './AdminShell'

interface AdminSidebarProps {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AdminSidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const location = useLocation()

  return (
    <aside className={cn(
      'flex h-dvh shrink-0 flex-col bg-charcoal text-ivory transition-[width] duration-200',
      collapsed ? 'w-[72px]' : 'w-64',
    )}>
      <div className={cn('border-b border-white/10 py-5', collapsed ? 'px-3' : 'px-5')}>
        <AdminLogoLink collapsed={collapsed} />
      </div>

      <nav
        className={cn(
          'flex-1 overflow-y-auto py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          collapsed ? 'px-2' : 'px-3',
        )}
        aria-label="Navegação administrativa"
      >
        {ADMIN_GRUPOS.map((grupo) => (
          <section key={grupo.grupo} className="mb-6">
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-warm-gray">
                {grupo.grupo}
              </p>
            )}
            <ul className="space-y-0.5">
              {grupo.modulos.map((modulo: AdminModulo) => (
                <li key={modulo.rotulo}>
                  <ModuloLink
                    modulo={modulo}
                    collapsed={collapsed}
                    ativo={modulo.href !== null && (
                      location.pathname === modulo.href ||
                      (modulo.href !== '/admin' && location.pathname.startsWith(`${modulo.href}/`))
                    )}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <div className={cn('space-y-2 border-t border-white/10 py-3', collapsed ? 'px-2' : 'px-3')}>
        <Link
          to="/"
          onClick={onNavigate}
          title="Voltar à loja"
          className={cn(
            'flex items-center gap-3 rounded-lg py-2.5 text-sm text-warm-gray transition-colors hover:bg-white/10 hover:text-white',
            collapsed ? 'justify-center px-2' : 'px-4',
          )}
        >
          <Store size={18} aria-hidden />
          {!collapsed && <span>Voltar à loja</span>}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menu administrativo' : 'Recolher menu administrativo'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg py-2.5 text-sm text-warm-gray transition-colors hover:bg-white/10 hover:text-white',
              collapsed ? 'justify-center px-2' : 'px-4',
            )}
          >
            {collapsed ? <ChevronRight size={18} aria-hidden /> : <ChevronLeft size={18} aria-hidden />}
            {!collapsed && <span>Recolher menu</span>}
          </button>
        )}
      </div>
    </aside>
  )
}

function ModuloLink({
  modulo,
  ativo,
  collapsed,
  onNavigate,
}: {
  modulo: AdminModulo
  ativo: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = modulo.icon
  const classes = cn(
    'flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors',
    collapsed ? 'justify-center px-2' : 'px-4',
    ativo
      ? 'bg-deep-rose font-medium text-white'
      : 'text-warm-gray hover:bg-white/10 hover:text-white',
    (modulo.emBreve || modulo.href === null) && 'cursor-not-allowed text-warm-gray/60 hover:bg-transparent hover:text-warm-gray/60',
  )

  if (modulo.emBreve || modulo.href === null) {
    return (
      <span className={classes} title={collapsed ? `${modulo.rotulo} — disponível em breve` : 'Módulo previsto — disponível em breve'}>
        <Icon size={18} aria-hidden />
        {!collapsed && (
          <>
            <span className="flex-1">{modulo.rotulo}</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-warm-gray/60">em breve</span>
          </>
        )}
      </span>
    )
  }

  return (
    <Link
      to={modulo.href}
      onClick={onNavigate}
      className={classes}
      aria-current={ativo ? 'page' : undefined}
      title={collapsed ? modulo.rotulo : undefined}
    >
      <Icon size={18} aria-hidden />
      {!collapsed && <span className="flex-1">{modulo.rotulo}</span>}
    </Link>
  )
}
