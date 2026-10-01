import { Settings, LogOut, LayoutDashboard, Package, ShoppingBag, Users, FileText, BarChart3, Tag } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const adminMenu = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Produtos', href: '/admin/produtos', icon: Package },
  { label: 'Categorias', href: '/admin/categoria', icon: Tag },
  { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { label: 'Orçamentos', href: '/admin/orcamentos', icon: FileText },
  { label: ' Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-charcoal text-ivory flex flex-col z-40">
      <div className="p-6 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-rose to-coral flex items-center justify-center text-white font-display font-bold">
            A
          </div>
          <div>
            <span className="font-display font-bold text-lg block">ANGEL</span>
            <span className="text-xs text-warm-gray">Painel Admin</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {adminMenu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-deep-rose text-white'
                      : 'text-warm-gray hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-warm-gray hover:bg-white/10 hover:text-white transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
