import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Heart, LayoutDashboard, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CartDrawer } from '@/components/commerce/CartDrawer'
import { MobileNav } from './MobileNav'
import { AngelWordmark } from '@/components/brand/AngelWordmark'
import { useAccount } from '@/domains/conta/context/AccountContext'
import { useIsAdmin } from '@/domains/admin/services/adminAuth'

/**
 * Navegação principal — rotas que existem de
 * fato. Nada de link para página inexistente.
 * Itens institucionais vivem no menu mobile
 * (espaço) e continuam acessíveis no desktop
 * via rodapé.
 */
export const NAV_ITEMS = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Categorias', to: '/categorias' },
  { label: 'Mimos', to: '/mimos' },
  { label: 'Serviços', to: '/servicos' },
  { label: 'Experiências', to: '/experiencias' },
] as const

export const NAV_INSTITUCIONAL = [
  { label: 'Sobre', to: '/sobre' },
  { label: 'Atendimento', to: '/atendimento' },
  { label: 'Contato', to: '/contato' },
] as const

/** Compara caminho E query, para o estado ativo não depender só do pathname. */
function isActiveRoute(pathname: string, search: string, to: string) {
  const [base, query] = to.split('?')
  if (pathname !== base) return false
  if (!query) return true
  return new URLSearchParams(search).toString() === new URLSearchParams(query).toString()
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { authenticated, user, profile } = useAccount()
  const { data: isAdmin } = useIsAdmin()
  const metadataUrl = user?.user_metadata?.avatar_url
  const avatarUrl = typeof metadataUrl === 'string' && /^https?:\/\//i.test(metadataUrl)
    ? metadataUrl
    : null
  const nome = profile?.nome || profile?.email || user?.email || 'Cliente'
  const iniciais = nome.split(/[\s@]+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join('') || 'C'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha o drawer ao navegar.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const isActive = useCallback(
    (to: string) => isActiveRoute(location.pathname, location.search, to),
    [location.pathname, location.search]
  )

  const iconLink =
    'inline-flex h-10 w-10 items-center justify-center rounded-full text-content-muted transition-colors hover:bg-champagne-light/50 hover:text-primary'

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                   focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-body-sm"
      >
        Pular para o conteúdo
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b border-champagne/60 bg-ivory/95 backdrop-blur-md',
          scrolled ? 'shadow-md' : ''
        )}
      >
        <div
          className="container-angel flex items-center justify-between gap-6 transition-[height] duration-300"
          style={{ height: scrolled ? 'var(--header-h-scrolled)' : 'var(--header-h)' }}
        >
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex shrink-0 items-center gap-3" aria-label="Angel Cosméticos — página inicial">
            <img
              src="/brand/angel-logo-160.png"
              alt=""
              width={160}
              height={156}
              className="h-12 w-auto md:h-14"
            />
            <AngelWordmark className="transition-all duration-300 ease-angel" />
          </Link>

          <nav className="hidden lg:block" aria-label="Navegação principal">
            <ul className="flex items-center gap-6 xl:gap-8">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive: active }) =>
                      cn(
                        'relative py-2 font-display text-base transition-colors',
                        active || isActive(item.to)
                          ? 'text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary'
                          : 'text-content hover:text-primary'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Link to="/conta/favoritos" className={iconLink} aria-label="Favoritos">
              <Heart size={20} />
            </Link>

            {authenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={cn(iconLink, 'hidden sm:inline-flex')}
                    aria-label="Painel administrativo"
                    title="Painel administrativo"
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link
                  to="/conta"
                  className={cn(iconLink, 'hidden sm:inline-flex overflow-hidden')}
                  aria-label="Minha conta"
                >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold">{iniciais}</span>
                )}
              </Link>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:inline-flex">
                <Link
                  to="/entrar"
                  className={cn(
                    'rounded-lg border-2 border-champagne bg-surface/60 px-4 py-2 text-sm font-medium text-soft-black transition-colors hover:border-primary hover:bg-blush',
                  )}
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className={cn(
                    'rounded-lg bg-deep-rose px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-deep-rose/90',
                  )}
                >
                  Criar conta
                </Link>
              </div>
            )}

            <CartDrawer />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(iconLink, 'lg:hidden')}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={NAV_ITEMS.map((i) => ({ label: i.label, to: i.to }))}
        institucional={NAV_INSTITUCIONAL.map((i) => ({ label: i.label, to: i.to }))}
        isActive={isActive}
        authenticated={authenticated}
      />
    </>
  )
}
