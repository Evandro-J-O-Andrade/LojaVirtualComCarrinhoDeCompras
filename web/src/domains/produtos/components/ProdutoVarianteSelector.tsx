import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AtributoTipo, ProdutoVariante } from '../model/produto'

interface ProdutoVarianteSelectorProps {
  variantes: ProdutoVariante[]
  selecionada: ProdutoVariante | null
  onSelect: (variante: ProdutoVariante) => void
  className?: string
}

const ROTULOS_ATRIBUTO: Record<AtributoTipo, string> = {
  tamanho: 'Tamanho',
  cor: 'Cor',
  volume: 'Volume',
}

export function ProdutoVarianteSelector({
  variantes,
  selecionada,
  onSelect,
  className,
}: ProdutoVarianteSelectorProps) {
  const tipos = useMemo(() => {
    const conjunto = new Set<AtributoTipo>()
    for (const variante of variantes) {
      for (const atributo of variante.atributos) {
        conjunto.add(atributo.tipo)
      }
    }
    return [...conjunto]
  }, [variantes])

  const valoresPorTipo = useMemo(() => {
    const mapa = new Map<AtributoTipo, string[]>()
    for (const type of tipos) {
      const valores: string[] = []
      for (const variante of variantes) {
        const atributo = variante.atributos.find(
          (item) => item.tipo === type,
        )
        if (atributo && !valores.includes(atributo.valor)) {
          valores.push(atributo.valor)
        }
      }
      mapa.set(type, valores)
    }
    return mapa
  }, [tipos, variantes])

  const [selecionados, setSelecionados] = useState<
    Record<string, string>
  >({})
  const [sincronizada, setSincronizada] =
    useState<ProdutoVariante | null>(null)

  if (selecionada !== sincronizada) {
    setSincronizada(selecionada)
    const mapa: Record<string, string> = {}
    if (selecionada) {
      for (const atributo of selecionada.atributos) {
        mapa[atributo.tipo] = atributo.valor
      }
    }
    setSelecionados(mapa)
  }

  const aoSelecionar = (tipo: AtributoTipo, valor: string) => {
    const proximos: Record<string, string> = {
      ...selecionados,
      [tipo]: valor,
    }
    setSelecionados(proximos)

    const correspondente = variantes.find((variante) =>
      tipos.every((tipoAtual) => {
        const atributo = variante.atributos.find(
          (item) => item.tipo === tipoAtual,
        )
        return atributo?.valor === proximos[tipoAtual]
      }),
    )
    if (correspondente) onSelect(correspondente)
  }

  if (tipos.length === 0) return null

  return (
    <div className={cn('space-y-5', className)}>
      {tipos.map((tipo) => (
        <div key={tipo}>
          <span className="text-sm font-medium text-content-muted">
            {ROTULOS_ATRIBUTO[tipo]}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(valoresPorTipo.get(tipo) ?? []).map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => aoSelecionar(tipo, valor)}
                className={cn(
                  'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                  selecionados[tipo] === valor
                    ? 'border-primary bg-primary text-primary-contrast'
                    : 'border-champagne text-content hover:border-primary',
                )}
              >
                {valor}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
