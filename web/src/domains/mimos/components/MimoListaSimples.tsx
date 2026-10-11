import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { MimoProdutoRef } from '../model/mimo'

interface MimoListaSimplesProps {
  titulo: string
  itens: MimoProdutoRef[]
  className?: string
}

export function MimoListaSimples({ titulo, itens, className }: MimoListaSimplesProps) {
  if (itens.length === 0) return null

  return (
    <section className={cn('mimo-lista-simples', className)} aria-label={titulo}>
      <h2 className="mb-4 font-display font-semibold text-2xl text-content">
        {titulo}
      </h2>
      <ul className="divide-y divide-surface-sunken">
        {itens.map((item) => (
          <li key={item.id}>
            <Link
              to={`/produtos/${item.slug}`}
              className="flex items-center gap-3 py-3 transition-colors hover:text-primary"
            >
              {item.imagem ? (
                <img
                  src={item.imagem}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : null}
              <span className="text-body text-content">{item.nome}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
