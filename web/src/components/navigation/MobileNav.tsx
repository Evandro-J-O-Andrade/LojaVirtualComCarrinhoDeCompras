import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  items: { label: string; to: string }[]
  isActive: (to: string) => boolean
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
export function MobileNav({ open, onClose, items, isActive }: MobileNavProps) {
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
                   bg-surface shadow-2xl animate-slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-border px-5"
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

          <div className="mt-8 border-t border-border pt-6">
            <p className="overline-angel mb-3">Conta</p>
            <ul className="flex flex-col gap-1">
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
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}
