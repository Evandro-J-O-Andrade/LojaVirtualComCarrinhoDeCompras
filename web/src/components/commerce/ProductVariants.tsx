import { cn } from '@/lib/utils'

interface ProductVariantsProps {
  variants: Array<{ tipo: string; valor: string; disponivel: boolean }>
  onSelect: (variant: { tipo: string; valor: string; disponivel: boolean }) => void
  selected?: { tipo: string; valor: string; disponivel: boolean } | null
  className?: string
}

export function ProductVariants({
  variants,
  onSelect,
  selected,
  className,
}: ProductVariantsProps) {
  const grouped = variants.reduce((acc: any, v) => {
    if (!acc[v.tipo]) acc[v.tipo] = []
    acc[v.tipo].push(v)
    return acc
  }, {})

  return (
    <div className={cn('space-y-4', className)}>
      {Object.entries(grouped).map(([tipo, items]: any) => (
        <div key={tipo}>
          <h4 className="text-sm font-medium text-warm-gray mb-2 capitalize">{tipo}</h4>
          <div className="flex flex-wrap gap-2">
            {items.map((variant: any) => (
              <button
                key={variant.valor}
                disabled={!variant.disponivel}
                onClick={() => onSelect(variant)}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  selected?.valor === variant.valor
                    ? 'border-deep-rose bg-deep-rose text-white'
                    : 'border-champagne text-soft-black hover:border-rose',
                  !variant.disponivel && 'opacity-40 cursor-not-allowed line-through'
                )}
              >
                {variant.valor}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
