import { useCallback, useEffect, useRef, useState } from 'react'
import { angelCinema } from '@/design/cinema'

interface CinematicIntroProps {
  /** Sinaliza o fim da entrada. O gate acima decide o que renderizar depois. */
  onFinish: () => void
}

/**
 * Entrada cinematográfica da Angel Cosméticos.
 *
 * Contrato:
 * - É o **gate de entrada do documento**: enquanto ativo, nada do site é
 *   renderizado. Não é um modal sobre a Home.
 * - Toca na entrada do documento e em F5. A navegação SPA interna não o
 *   reinicia — quem controla isso é `useDocumentIntro`, que fica acima do
 *   router.
 * - `prefers-reduced-motion` desliga a sequência inteira.
 * - Esc, clique no palco ou o botão "Pular" encerram imediatamente.
 * - Se o asset editorial falhar, o cinema continua com palco tipográfico.
 */
export function CinematicIntro({ onFinish }: CinematicIntroProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const skipRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef<Element | null>(null)

  const finish = useCallback(() => {
    onFinish()
  }, [onFinish])

  // Trava scroll, prende e devolve foco.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    skipRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      const target = restoreFocusRef.current
      if (target instanceof HTMLElement) target.focus()
      else document.body.focus()
    }
  }, [])

  // Encerramento automático no fim da sequência.
  useEffect(() => {
    const timer = window.setTimeout(finish, angelCinema.timing.total)
    return () => window.clearTimeout(timer)
  }, [finish])

  // Esc para pular.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [finish])

  const { stage, timing } = angelCinema

  return (
    <div
      className="cinema"
      onClick={finish}
      style={
        {
          '--c-void': stage.void,
          '--c-wine': stage.wine,
          '--c-wine-light': stage.wineLight,
          '--c-brand': stage.brand,
          '--c-cream': stage.cream,
          '--c-champagne': stage.champagne,
          '--c-frame-ratio': angelCinema.frameRatio,
          '--t-veil': `${timing.veilIn}ms`,
          '--t-frame': `${timing.frameSettle}ms`,
          '--d-rule': `${timing.ruleDelay}ms`,
          '--t-rule': `${timing.ruleDraw}ms`,
          '--d-word': `${timing.wordmarkDelay}ms`,
          '--t-word': `${timing.wordmarkIn}ms`,
          '--d-tag': `${timing.taglineDelay}ms`,
          '--t-tag': `${timing.taglineIn}ms`,
          '--d-exit': `${timing.exitDelay}ms`,
          '--t-exit': `${timing.exitDuration}ms`,
        } as React.CSSProperties
      }
    >
      {/*
        O palco é decorativo e sai da árvore de acessibilidade.
        O botão "Pular" NÃO pode estar sob aria-hidden — é o único
        controle que o teclado e o leitor de tela alcançam.
      */}
      <div className="cinema__stage" aria-hidden="true" />

      <div className="cinema__frame" aria-hidden="true">
        {imageFailed ? (
          <div className="cinema__frame-fallback" />
        ) : (
          <img
            src={angelCinema.frameImage}
            alt=""
            className="cinema__frame-img"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="cinema__frame-vignette" />
      </div>

      <div className="cinema__identity" aria-hidden="true">
        <span className="cinema__rule" />
        <h1 className="cinema__name">
          <span className="cinema__name-main">Angel</span>{' '}
          <span className="cinema__name-sub">Cosméticos</span>
        </h1>
        <p className="cinema__tagline">Beleza, cuidado e experiência.</p>
      </div>

      <button
        ref={skipRef}
        type="button"
        className="cinema__skip"
        onClick={(event) => {
          event.stopPropagation()
          finish()
        }}
      >
        Pular introdução
      </button>
    </div>
  )
}
