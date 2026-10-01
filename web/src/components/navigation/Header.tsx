import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Heart, Menu, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CartDrawer } from '@/components/commerce/CartDrawer'
import { MobileNav } from './MobileNav'

/**
 * Rotas que existem de fato hoje. Nada de link para página inexistente:
 * `/eventos` e a busca foram reportados como lacunas, não inventados aqui.
 */
export const NAV_ITEMS = [
  { label: 'Produtos', to: '/produtos' },
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
    'inline-flex h-10 w-10 items-center justify-center rounded-full text-content-muted transition-colors hover:bg-surface-alt hover:text-primary'

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
          'fixed inset-x-0 top-0 z-40 border-b border-border bg-surface',
          scrolled ? 'shadow-md' : ''
        )}
      >
        <div
          className="container-angel flex items-center justify-between gap-6 transition-[height] duration-300"
          style={{ height: scrolled ? 'var(--header-h-scrolled)' : 'var(--header-h)' }}
        >
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Angel Cosméticos — página inicial">
            <img
              src="/brand/angel-logo-160.png"
              alt=""
              width={160}
              height={156}
              className="h-10 w-auto md:h-12"
            />
            <span className="font-display text-lg font-semibold leading-none text-content md:text-xl">
              Angel <span className="text-primary">Cosméticos</span>
            </span>
          </Link>

          <nav className="hidden lg:block" aria-label="Navegação principal">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive: active }) =>
                      cn(
                        'relative py-2 font-display text-base transition-colors',
                        active ? 'text-primary' : 'text-content hover:text-primary'
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

            <Link to="/conta" className={cn(iconLink, 'hidden sm:inline-flex')} aria-label="Minha conta">
              <User size={20} />
            </Link>

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
        isActive={isActive}
      />
    </>
  )
}
