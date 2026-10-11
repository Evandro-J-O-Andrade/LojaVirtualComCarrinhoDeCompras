import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProdutoImagemProps {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
}

/**
 * Regra da fatia: imagem real → fallback visual → feedback.
 * Nunca renderiza uma URL inventada: sem src ou com falha de
 * carga, exibe um bloco visual com aviso em vez de <img> quebrada.
 */
export function ProdutoImagem({
  src,
  alt,
  className,
  imgClassName,
}: ProdutoImagemProps) {
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
      loading="lazy"
      onError={() => setFalhou(true)}
      className={cn('h-full w-full object-cover', imgClassName)}
    />
  )
}
