import { ProdutoCard } from './ProdutoCard'
import { useProdutosRelacionados } from '../hooks/useProdutos'

interface ProdutoRelacionadosProps {
  slug: string
  limit?: number
  className?: string
}

export function ProdutoRelacionados({
  slug,
  limit = 4,
  className,
}: ProdutoRelacionadosProps) {
  const { data: relacionados } = useProdutosRelacionados(slug, limit)

  if (!relacionados || relacionados.length === 0) return null

  return (
    <section
      className={className}
      aria-label="Produtos relacionados"
    >
      <h2 className="mb-6 font-display font-semibold text-3xl text-content">
        Você também pode gostar
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {relacionados.map((produto) => (
          <ProdutoCard key={produto.id} produto={produto} />
        ))}
      </div>
    </section>
  )
}
