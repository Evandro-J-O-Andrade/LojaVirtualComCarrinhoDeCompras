import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MidiaProduto } from '../model/produto'
import { ProdutoImagem } from './ProdutoImagem'
import { ProdutoLightbox } from './ProdutoLightbox'

interface ProdutoGaleriaProps {
  midias: MidiaProduto[]
  nome: string
  className?: string
}

/**
 * Galeria comercial do produto: palco principal,
 * miniaturas numeradas, aba de vídeo e botão de
 * zoom que abre a visualização ampliada (lightbox).
 * Mídia ausente não quebra o layout.
 */
export function ProdutoGaleria({
  midias,
  nome,
  className,
}: ProdutoGaleriaProps) {
  const [indice, setIndice] = useState(0)
  const [lightboxAberta, setLightboxAberta] = useState(false)

  if (midias.length === 0) {
    return (
      <ProdutoImagem
        src={null}
        alt={nome}
        className={cn('aspect-square rounded-3xl', className)}
      />
    )
  }

  const midia = midias[indice]
  const anterior = () =>
    setIndice((atual) => (atual - 1 + midias.length) % midias.length)
  const proxima = () =>
    setIndice((atual) => (atual + 1) % midias.length)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-sunken">
        {midia.tipo === 'video' ? (
          <video
            src={midia.url}
            controls
            preload="metadata"
            poster={midias.find((item) => item.tipo === 'imagem')?.url}
            className="h-full w-full object-cover"
            aria-label={`Vídeo de demonstração de ${nome}`}
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
        ) : (
          <>
            <ProdutoImagem
              src={midia.url}
              alt={midia.alt ?? `${nome} — imagem ${indice + 1}`}
            />
            {midia.titulo && (
              <p className="absolute bottom-3 left-3 rounded-full bg-surface/85 px-3 py-1 text-xs text-content">
                {midia.titulo}
              </p>
            )}
          </>
        )}

        {midias.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-content transition-colors hover:bg-surface"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={proxima}
              aria-label="Próxima imagem"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-content transition-colors hover:bg-surface"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setLightboxAberta(true)}
          aria-label="Ampliar imagem"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-content shadow-md transition-colors hover:bg-surface"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {midias.length > 1 && (
        <div
          className="flex flex-wrap gap-3"
          role="group"
          aria-label="Mídias do produto"
        >
          {midias.map((item, posicao) => (
            <button
              key={`${item.url}-${posicao}`}
              type="button"
              onClick={() => setIndice(posicao)}
              aria-label={
                item.tipo === 'video'
                  ? 'Ver vídeo de demonstração'
                  : `Ver imagem ${posicao + 1}`
              }
              aria-current={posicao === indice}
              className={cn(
                'flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 text-xs font-semibold transition-all',
                posicao === indice
                  ? 'border-primary text-primary'
                  : 'border-transparent text-content-subtle hover:border-champagne',
              )}
            >
              {item.tipo === 'video' ? (
                <span className="flex flex-col items-center gap-0.5">
                  <span aria-hidden="true">▶</span>
                  <span>Vídeo</span>
                </span>
              ) : (
                <ProdutoImagem src={item.url} alt="" />
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxAberta && (
        <ProdutoLightbox
          midias={midias}
          indice={indice}
          onIndiceChange={setIndice}
          onClose={() => setLightboxAberta(false)}
          nome={nome}
        />
      )}
    </div>
  )
}
