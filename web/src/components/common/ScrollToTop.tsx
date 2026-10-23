import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Política de rolagem da Angel.
 *
 * React Router, com BrowserRouter (roteador
 * declarativo), não restaura a rolagem
 * automaticamente. Por isso:
 *
 *   - navegação por link (push)  -> topo,
 *     ou a âncora indicada por #hash;
 *   - voltar/avançar (popstate)  -> o
 *     navegador restaura a posição salva.
 *
 * Não usamos window.scrollTo(0, 0)
 * indiscriminado: ele quebraria o botão
 * Voltar e os links para seções específicas.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const foiPop = useRef(false)

  useEffect(() => {
    const aoVoltar = () => {
      foiPop.current = true
    }
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [])

  useEffect(() => {
    // Voltar/avançar: o navegador restaura
    // a posição; não interferimos.
    if (foiPop.current) {
      foiPop.current = false
      return
    }
    if (hash) {
      const alvo = document.getElementById(hash.slice(1))
      if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
