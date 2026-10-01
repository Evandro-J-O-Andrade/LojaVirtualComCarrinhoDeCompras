import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { CinematicIntro } from './CinematicIntro'

/**
 * Comportamento do palco do Cinema isolado.
 * O contrato de entrada/reload/navegação vive em CinematicIntro.contract.test.tsx.
 */

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

function renderIntro() {
  const onFinish = vi.fn()
  const utils = render(<CinematicIntro onFinish={onFinish} />)
  return { ...utils, onFinish }
}

describe('CinematicIntro (palco)', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setReducedMotion(false)
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('toca na entrada do documento', () => {
    const { container } = renderIntro()
    expect(container.querySelector('.cinema')).toBeTruthy()
  })

  it('mostra o nome completo da marca', () => {
    const { container } = renderIntro()
    const name = container.querySelector('.cinema__name')
    expect(name?.textContent).toContain('Angel')
    expect(name?.textContent).toContain('Cosméticos')
  })

  it('NÃO suprime a sequência por flag de sessão antiga (regressão do F5)', () => {
    window.sessionStorage.setItem('angel:cinema:v1', '1')
    const { container } = renderIntro()
    expect(container.querySelector('.cinema')).toBeTruthy()
  })

  it('oferece um botão para pular', () => {
    renderIntro()
    expect(screen.getByRole('button', { name: /pular/i })).toBeTruthy()
  })

  it('mantem o botão Pular acessível para leitor de tela', () => {
    renderIntro()
    // o botão não pode estar sob aria-hidden
    expect(screen.getByRole('button', { name: /pular/i })).toBeTruthy()
  })

  it('encerra ao clicar em Pular', () => {
    const { onFinish } = renderIntro()
    act(() => {
      screen.getByRole('button', { name: /pular/i }).click()
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('encerra ao pressionar Escape', () => {
    const { onFinish } = renderIntro()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('encerra ao clicar no palco', () => {
    const { container, onFinish } = renderIntro()
    act(() => {
      container.querySelector('.cinema')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(onFinish).toHaveBeenCalled()
  })

  it('encerra sozinho no fim da sequência', () => {
    vi.useFakeTimers()
    const onFinish = vi.fn()
    render(<CinematicIntro onFinish={onFinish} />)
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('trava o scroll enquanto ativo e devolve ao final', () => {
    document.body.style.overflow = 'auto'
    const { unmount } = renderIntro()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('degrada para palco tipografico quando a imagem falha', () => {
    const { container } = renderIntro()
    const img = container.querySelector('.cinema img')
    expect(img).toBeTruthy()
    act(() => {
      img!.dispatchEvent(new Event('error'))
    })
    expect(container.querySelector('.cinema img')).toBeNull()
    expect(container.querySelector('.cinema__frame-fallback')).toBeTruthy()
    // a marca continua presente mesmo sem imagem
    expect(container.querySelector('.cinema__name')?.textContent).toContain('Cosméticos')
  })
})
