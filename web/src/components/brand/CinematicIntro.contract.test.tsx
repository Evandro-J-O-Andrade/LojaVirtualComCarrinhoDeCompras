import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { CinematicIntro } from './CinematicIntro'
import { useDocumentIntro } from '@/hooks/useDocumentIntro'

/**
 * Contrato do Cinema na Angel Cosméticos.
 *
 *   entrada do documento  -> Cinema
 *   F5 / hard reload      -> Cinema de novo
 *   navegação SPA interna -> NUNCA reinicia
 */

function setPath(path: string) {
  const w = window as unknown as { happyDOM?: { setURL(u: string): void } }
  if (w.happyDOM) w.happyDOM.setURL(`http://localhost:3001${path}`)
  else window.history.replaceState({}, '', path)
}

function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduce && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

/**
 * Reproduz a estrutura do App: o gate fica ACIMA do router, então
 * navegar não pode re-disparar o Cinema.
 */
function Harness({ children }: { children?: ReactNode }) {
  const intro = useDocumentIntro()
  return (
    <div>
      {intro.active && <CinematicIntro onFinish={intro.finish} />}
      {!intro.active && <div data-testid="app-content">{children}</div>}
    </div>
  )
}

describe('contrato do Cinema', () => {
  beforeEach(() => {
    setPath('/')
    setReducedMotion(false)
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('primeira entrada do documento: o Cinema aparece', () => {
    render(<Harness><p>HOME</p></Harness>)
    expect(document.querySelector('.cinema')).toBeTruthy()
  })

  it('o Cinema é um gate: a Home NÃO aparece antes dele', () => {
    render(<Harness><p>HOME</p></Harness>)
    expect(screen.queryByTestId('app-content')).toBeNull()
    expect(screen.queryByText('HOME')).toBeNull()
  })

  it('Pular: entra no site', () => {
    render(<Harness><p>HOME</p></Harness>)
    act(() => {
      screen.getByRole('button', { name: /pular/i }).click()
    })
    expect(screen.getByTestId('app-content')).toBeTruthy()
    expect(screen.queryByText('HOME')).toBeTruthy()
  })

  it('Escape: entra no site', () => {
    render(<Harness><p>HOME</p></Harness>)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(screen.getByTestId('app-content')).toBeTruthy()
  })

  it('navegação SPA interna NÃO reinicia o Cinema', () => {
    const { rerender } = render(<Harness><p>HOME</p></Harness>)
    act(() => {
      screen.getByRole('button', { name: /pular/i }).click()
    })
    expect(document.querySelector('.cinema')).toBeNull()

    setPath('/produtos')
    rerender(<Harness><p>PRODUTOS</p></Harness>)
    expect(document.querySelector('.cinema')).toBeNull()

    setPath('/sobre')
    rerender(<Harness><p>SOBRE</p></Harness>)
    expect(document.querySelector('.cinema')).toBeNull()
  })

  it('F5 / novo documento: o Cinema volta, SEM depender de storage', () => {
    // A flag antiga de sessão não pode mais suprimir o Cinema.
    window.sessionStorage.setItem('angel:cinema:v1', '1')
    render(<Harness><p>HOME</p></Harness>)
    expect(document.querySelector('.cinema')).toBeTruthy()
    expect(screen.queryByTestId('app-content')).toBeNull()
  })

  it('não toca em rotas /admin', () => {
    setPath('/admin/produtos')
    render(<Harness><p>ADMIN</p></Harness>)
    expect(document.querySelector('.cinema')).toBeNull()
    expect(screen.getByTestId('app-content')).toBeTruthy()
  })

  it('reduced-motion: entra direto no site, sem Cinema', () => {
    setReducedMotion(true)
    render(<Harness><p>HOME</p></Harness>)
    expect(document.querySelector('.cinema')).toBeNull()
    expect(screen.getByTestId('app-content')).toBeTruthy()
  })

  it('o botão Pular permanece acessível (regressão do aria-hidden)', () => {
    render(<Harness><p>HOME</p></Harness>)
    expect(screen.getByRole('button', { name: /pular/i })).toBeTruthy()
  })

  it('fallback: imagem indisponível não quebra o gate', () => {
    const { container } = render(<Harness><p>HOME</p></Harness>)
    const img = container.querySelector('.cinema img')
    expect(img).toBeTruthy()
    act(() => {
      img!.dispatchEvent(new Event('error'))
    })
    expect(container.querySelector('.cinema__frame-fallback')).toBeTruthy()
    expect(container.querySelector('.cinema__name')?.textContent).toContain('Cosméticos')
  })
})

describe('useDocumentIntro isolado', () => {
  beforeEach(() => {
    setPath('/')
    setReducedMotion(false)
  })

  it('começa ativo na entrada do documento e desativa uma única vez', () => {
    let finishCount = 0
    function Probe() {
      const intro = useDocumentIntro()
      return (
        <button onClick={() => { finishCount++; intro.finish() }}>
          {String(intro.active)}
        </button>
      )
    }
    const { unmount } = render(<Probe />)
    expect(screen.getByRole('button').textContent).toBe('true')
    act(() => { screen.getByRole('button').click() })
    expect(screen.getByRole('button').textContent).toBe('false')
    expect(finishCount).toBe(1)
    unmount()
  })
})
