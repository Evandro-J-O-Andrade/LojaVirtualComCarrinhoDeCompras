import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ADMIN_MODULOS_ATIVOS } from '../model/admin'

/**
 * Breadcrumb do painel: Início /
 * módulo / detalhe. Só rotas reais
 * — nada de caminho inventado.
 */
export function AdminBreadcrumb({
  caminho,
}: {
  caminho: string
}) {
  const partes = caminho
    .split('/')
    .filter(Boolean)

  if (partes.length === 0) {
    return (
      <span className="font-display text-base font-bold text-soft-black">
        Painel
      </span>
    )
  }

  const trilha: Array<{
    rotulo: string
    href: string | null
  }> = [
    { rotulo: 'Painel', href: '/admin' },
  ]

  let acumulado = ''
  for (const parte of partes) {
    acumulado += `/${parte}`
    const modulo = ADMIN_MODULOS_ATIVOS.find(
      (m) => m.href === acumulado,
    )
    trilha.push({
      rotulo: modulo
        ? modulo.rotulo
        : parte.replace(/-/g, ' '),
      href: acumulado,
    })
  }

  return (
    <nav
      aria-label="Caminho"
      className="flex min-w-0 items-center gap-1.5 text-sm"
    >
      {trilha.map((item, indice) => {
        const ultimo = indice === trilha.length - 1
        return (
          <span
            key={`${item.href}-${indice}`}
            className="flex min-w-0 items-center gap-1.5"
          >
            {indice > 0 && (
              <ChevronRight
                size={14}
                className="shrink-0 text-content-muted"
                aria-hidden
              />
            )}
            {ultimo || item.href === null ? (
              <span className="truncate font-medium text-soft-black">
                {item.rotulo}
              </span>
            ) : (
              <Link
                to={item.href}
                className="truncate text-content-muted hover:text-primary"
              >
                {item.rotulo}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
