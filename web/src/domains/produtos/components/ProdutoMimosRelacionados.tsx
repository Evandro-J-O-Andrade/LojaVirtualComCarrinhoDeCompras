import { useMimosPorProduto } from '@/domains/mimos/hooks/useMimos'
import { MimoVitrineGrid } from '@/domains/mimos/components/MimoVitrineGrid'

interface ProdutoMimosRelacionadosProps {
  slug: string
  className?: string
}

/**
 * Um produto, várias experiências: curadorias (Mimos) que
 * contêm este produto, vindas do mesmo catálogo comercial.
 * Sem vínculo real, a seção simplesmente não renderiza.
 */
export function ProdutoMimosRelacionados({
  slug,
  className,
}: ProdutoMimosRelacionadosProps) {
  const { data: mimos } = useMimosPorProduto(slug)

  if (!mimos || mimos.length === 0) return null

  return (
    <div className={className}>
      <MimoVitrineGrid mimos={mimos} titulo="Mimos com este produto" />
    </div>
  )
}
