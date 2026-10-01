import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { ShoppingBag, Heart, Package, Settings, LogOut, MapPin, CreditCard, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

const menuItems = [
  { label: 'Meus Pedidos', href: '/conta/pedidos', icon: ShoppingBag },
  { label: 'Produtos Favoritos', href: '/conta/favoritos', icon: Heart },
  { label: 'Endereços', href: '/conta/enderecos', icon: MapPin },
  { label: 'Pagamentos', href: '/conta/pagamentos', icon: CreditCard },
  { label: 'Notificações', href: '/conta/notificacoes', icon: Bell },
  { label: 'Configurações', href: '/conta/configuracoes', icon: Settings },
]

export function ContaPage() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="py-20">
        <div className="container-angel text-center">
          <h2 className="font-display font-bold text-2xl text-soft-black mb-4">
            Faça login para ver sua conta
          </h2>
          <Button variant="primary">Entrar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-angel">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-deep-rose to-coral flex items-center justify-center text-white font-display font-bold text-3xl">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-soft-black">
              Olá, {user.user_metadata?.name || 'Cliente'}!
            </h1>
            <p className="text-warm-gray">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <nav className="bg-white rounded-2xl p-4 shadow-sm">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-warm-gray hover:bg-blush hover:text-deep-rose transition-colors"
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-coral hover:bg-coral/10 transition-colors w-full"
                  >
                    <LogOut size={20} />
                    <span>Sair</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-deep-rose" />
                </div>
                <p className="text-warm-gray text-sm">Pedidos</p>
                <p className="font-display font-bold text-2xl text-soft-black">0</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center mb-4">
                  <Heart size={24} className="text-deep-rose" />
                </div>
                <p className="text-warm-gray text-sm">Favoritos</p>
                <p className="font-display font-bold text-2xl text-soft-black">0</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center mb-4">
                  <Package size={24} className="text-deep-rose" />
                </div>
                <p className="text-warm-gray text-sm">Entregas</p>
                <p className="font-display font-bold text-2xl text-soft-black">0</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="font-display font-bold text-xl text-soft-black mb-4">
                Dados da conta
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-warm-gray mb-1">E-mail</p>
                  <p className="font-medium text-soft-black">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-warm-gray mb-1">Criado em</p>
                  <p className="font-medium text-soft-black">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
