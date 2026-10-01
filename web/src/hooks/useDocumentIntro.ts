import { useCallback, useState } from 'react'

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Gate de entrada do documento.
 *
 * Contrato da Angel Cosméticos:
 *
 *   entrada do documento  -> Cinema abre
 *   F5 / hard reload      -> Cinema abre de novo
 *   navegação SPA interna -> NUNCA reinicia
 *
 * Deliberadamente NÃO usa `localStorage`/`sessionStorage`. O que determina se
 * o Cinema toca é a **entrada do documento**, não "já vi alguma vez".
 * O gate fica acima do router, então navegar não re-dispara a sequência.
 *
 * Não toca em `/admin` e é desligado por `prefers-reduced-motion`.
 */
export function useDocumentIntro() {
  const [active, setActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return !isAdminPath(window.location.pathname) && !prefersReducedMotion()
  })

  const finish = useCallback(() => {
    setActive(false)
  }, [])

  return { active, finish }
}
