import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagemEditorialProps {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  /** Acima do vinco: prioridade de carregamento. */
  prioridade?: boolean
}

/**
 * Regra de conteúdo da Angel: imagem real → fallback
 * visual → feedback. Nunca renderiza uma URL quebrada:
 * sem src ou com falha de carga, exibe um bloco visual
 * com aviso em vez de <img> quebrada.
 */
export function ImagemEditorial({
  src,
  alt,
  className,
  imgClassName,
  prioridade,
}: ImagemEditorialProps) {
  const [falhou, setFalhou] = useState(false)

  if (!src || falhou) {
    return (
      <div
        role="img"
        aria-label={`${alt}: sem imagem disponível`}
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-surface-sunken text-content-subtle',
          className,
        )}
      >
        <ImageIcon size={32} strokeWidth={1.5} />
        <span className="text-xs">Sem imagem disponível</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      onError={() => setFalhou(true)}
      {...(prioridade
        ? { fetchPriority: 'high' as const }
        : { loading: 'lazy' as const })}
      className={cn('h-full w-full object-cover', imgClassName)}
    />
  )
}
