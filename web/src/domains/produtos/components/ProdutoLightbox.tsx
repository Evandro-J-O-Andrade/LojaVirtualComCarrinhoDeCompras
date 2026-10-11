import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Minus,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProdutoImagem } from './ProdutoImagem'
import type { MidiaProduto } from '../model/produto'

interface ProdutoLightboxProps {
  midias: MidiaProduto[]
  indice: number
  onIndiceChange: (indice: number) => void
  onClose: () => void
  nome: string
}

const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_PASSO = 0.5
const LIMIAR_SWIPE = 60

/**
 * Visualização ampliada da mídia do produto:
 * zoom (botões, teclado, pinch), pan por arrasto,
 * navegação por gestos/setas, fullscreen e
 * thumbnails. Esc fecha; foco é gerenciado.
 */
export function ProdutoLightbox({
  midias,
  indice,
  onIndiceChange,
  onClose,
  nome,
}: ProdutoLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [estaFullscreen, setEstaFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const botaoFecharRef = useRef<HTMLButtonElement>(null)
  const pontos = useRef(new Map<number, { x: number; y: number }>())
  const distanciaInicial = useRef<number | null>(null)
  const zoomNoPinch = useRef(1)
  const movimentoX = useRef(0)

  const midia = midias[indice]

  const resetarZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const aplicarZoom = (valor: number) => {
    const proximo = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, Math.round(valor * 2) / 2),
    )
    setZoom(proximo)
    if (proximo === 1) setPan({ x: 0, y: 0 })
  }

  const irPara = (alvo: number) => {
    onIndiceChange((alvo + midias.length) % midias.length)
    resetarZoom()
  }

  const alternarFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen?.()
    }
  }

  useEffect(() => {
    const focoAnterior = document.activeElement as HTMLElement | null
    botaoFecharRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        onClose()
      } else if (evento.key === 'ArrowLeft') {
        irPara(indice - 1)
      } else if (evento.key === 'ArrowRight') {
        irPara(indice + 1)
      } else if (evento.key === '+' || evento.key === '=') {
        aplicarZoom(zoom + ZOOM_PASSO)
      } else if (evento.key === '-') {
        aplicarZoom(zoom - ZOOM_PASSO)
      } else if (evento.key === '0') {
        resetarZoom()
      }
    }
    const aoMudarFullscreen = () =>
      setEstaFullscreen(Boolean(document.fullscreenElement))

    document.addEventListener('keydown', aoTeclar)
    document.addEventListener('fullscreenchange', aoMudarFullscreen)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.removeEventListener('fullscreenchange', aoMudarFullscreen)
      document.body.style.overflow = ''
      focoAnterior?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, midias.length, onClose])

  const aoPressionar = (evento: React.PointerEvent) => {
    evento.currentTarget.setPointerCapture(evento.pointerId)
    pontos.current.set(evento.pointerId, {
      x: evento.clientX,
      y: evento.clientY,
    })
    if (pontos.current.size === 2) {
      const [a, b] = [...pontos.current.values()]
      distanciaInicial.current = Math.hypot(a.x - b.x, a.y - b.y)
      zoomNoPinch.current = zoom
    }
    movimentoX.current = 0
  }

  const aoMover = (evento: React.PointerEvent) => {
    const ponto = pontos.current.get(evento.pointerId)
    if (!ponto) return
    const dx = evento.clientX - ponto.x
    const dy = evento.clientY - ponto.y
    pontos.current.set(evento.pointerId, {
      x: evento.clientX,
      y: evento.clientY,
    })

    if (pontos.current.size === 2 && distanciaInicial.current) {
      const [a, b] = [...pontos.current.values()]
      const distancia = Math.hypot(a.x - b.x, a.y - b.y)
      aplicarZoom(zoomNoPinch.current * (distancia / distanciaInicial.current))
      return
    }

    if (pontos.current.size === 1) {
      if (zoom > 1) {
        setPan((anterior) => ({
          x: anterior.x + dx,
          y: anterior.y + dy,
        }))
      } else {
        movimentoX.current += dx
      }
    }
  }

  const aoSoltar = (evento: React.PointerEvent) => {
    pontos.current.delete(evento.pointerId)
    distanciaInicial.current = null
    if (pontos.current.size === 0 && zoom === 1) {
      if (movimentoX.current <= -LIMIAR_SWIPE) irPara(indice + 1)
      else if (movimentoX.current >= LIMIAR_SWIPE) irPara(indice - 1)
    }
    movimentoX.current = 0
  }

  const rótuloMidia =
    midia.tipo === 'video' ? 'Vídeo' : `Imagem ${indice + 1}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de ${nome}`}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
    >
      <div
        ref={containerRef}
        className="flex h-full flex-col"
        data-fullscreen={estaFullscreen}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm text-white/80">
            {nome} — {rótuloMidia}
            {midias.length > 1 && ` (${indice + 1}/${midias.length})`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={alternarFullscreen}
              aria-label={
                estaFullscreen ? 'Sair da tela cheia' : 'Tela cheia'
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {estaFullscreen ? (
                <Minimize size={20} />
              ) : (
                <Maximize size={20} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar galeria"
              ref={botaoFecharRef}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          className="relative flex-1 overflow-hidden"
          style={{ touchAction: 'none' }}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
        >
          {midias.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => irPara(indice - 1)}
                aria-label="Mídia anterior"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => irPara(indice + 1)}
                aria-label="Próxima mídia"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className="flex h-full items-center justify-center p-4"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: pontos.current.size === 0 ? 'transform 0.2s ease-out' : 'none',
            }}
          >
            {midia.tipo === 'video' ? (
              <video
                src={midia.url}
                controls
                autoPlay
                className="max-h-full max-w-full rounded-lg"
              >
                Seu navegador não suporta reprodução de vídeo.
              </video>
            ) : (
              <ProdutoImagem
                src={midia.url}
                alt={midia.alt ?? `${nome} — ${rótuloMidia}`}
                className="max-h-[70vh] max-w-full overflow-hidden rounded-lg bg-black/40"
                imgClassName="max-h-[70vh] w-auto max-w-full object-contain"
              />
            )}
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-3 py-1.5">
            <button
              type="button"
              onClick={() => aplicarZoom(zoom - ZOOM_PASSO)}
              disabled={zoom <= ZOOM_MIN}
              aria-label="Diminuir zoom"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center text-sm text-white/90">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => aplicarZoom(zoom + ZOOM_PASSO)}
              disabled={zoom >= ZOOM_MAX}
              aria-label="Aumentar zoom"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {midias.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3">
            {midias.map((item, posicao) => (
              <button
                key={`${item.url}-${posicao}`}
                type="button"
                onClick={() => irPara(posicao)}
                aria-label={
                  item.tipo === 'video'
                    ? 'Ver vídeo'
                    : `Ver imagem ${posicao + 1}`
                }
                aria-current={posicao === indice}
                className={cn(
                  'flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border-2 text-xs font-semibold transition-all',
                  posicao === indice
                    ? 'border-white text-white'
                    : 'border-white/20 text-white/60 hover:border-white/50 hover:text-white',
                )}
              >
                {item.tipo === 'video' ? (
                  <span aria-hidden>▶ Vídeo</span>
                ) : (
                  <ProdutoImagem
                    src={item.url}
                    alt=""
                    imgClassName="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
