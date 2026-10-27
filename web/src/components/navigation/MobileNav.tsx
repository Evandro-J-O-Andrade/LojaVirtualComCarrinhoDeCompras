import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  items: { label: string; to: string }[]
  institucional?: { label: string; to: string }[]
  isActive: (to: string) => boolean
  /** Já autenticada: a entrada é "Minha conta", não "Entrar". */
  authenticated?: boolean
}

/**
 * Drawer de navegação mobile.
 *
 * Acessibilidade:
 * - backdrop clicável fecha;
 * - Esc fecha;
 * - foco entra no drawer ao abrir e volta para o gatilho ao fechar;
 * - scroll do body travado enquanto aberto;
 * - landmark e rótulo próprios.
 */
export function MobileNav({ open, onClose, items, institucional = [], isActive, authenticated = false }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return

    restoreRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      const target = restoreRef.current
      if (target instanceof HTMLElement) target.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-charcoal/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col
                   bg-ivory shadow-2xl animate-slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-champagne/60 px-5"
             style={{ height: 'var(--header-h)' }}>
          <span className="font-display text-lg font-semibold text-content">
            Angel Cosméticos
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="btn-angel-icon"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-4 py-3 font-display text-lg transition-colors',
                    isActive(item.to)
                      ? 'bg-surface-alt text-primary'
                      : 'text-content hover:bg-surface-alt'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {institucional.length > 0 && (
            <div className="mt-8 border-t border-champagne/60 pt-6">
              <p className="overline-angel mb-3">Institucional</p>
              <ul className="flex flex-col gap-1">
                {institucional.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      aria-current={isActive(item.to) ? 'page' : undefined}
                      className="block rounded-lg px-4 py-3 text-body text-content-muted hover:bg-surface-alt"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t border-champagne/60 pt-6">
            <p className="overline-angel mb-3">Conta</p>
            <ul className="flex flex-col gap-1">
              <li>
                <Link to="/carrinho" onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-content-muted hover:bg-surface-alt">
                  <ShoppingBag size={18} />
                  Carrinho
                </Link>
              </li>
              <li>
                <Link to="/conta" onClick={onClose}
                      className="block rounded-lg px-4 py-3 text-body text-content-muted hover:bg-surface-alt">
                  Minha conta
                </Link>
              </li>
              <li>
                <Link to="/conta/favoritos" onClick={onClose}
                      className="block rounded-lg px-4 py-3 text-body text-content-muted hover:bg-surface-alt">
                  Favoritos
                </Link>
              </li>
              {!authenticated && (
                <>
                  <li>
                    <Link to="/entrar" onClick={onClose}
                          className="block rounded-lg px-4 py-3 text-body text-content-muted hover:bg-surface-alt">
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link to="/cadastro" onClick={onClose}
                          className="block rounded-lg px-4 py-3 text-body font-medium text-deep-rose hover:bg-surface-alt">
                      Criar conta
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}
