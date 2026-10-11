import type { ReactNode } from 'react'
import { Database, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/common/Button'
import type { AdminDadosEstado } from '../model/admin'

interface AdminEstadoDadosProps {
  estado: AdminDadosEstado
  /** O que está sendo carregado: "produtos", "pedidos"… */
  rotulo: string
  aoTentarNovamente?: () => void
  /** Conteúdo renderizado só quando conectado. */
  children: ReactNode
}

/**
 * Os três estados de todo módulo
 * administrativo:
 *
 *   conectado       -> dados reais
 *   nao-integrado   -> "disponível
 *                      após integração"
 *   erro            -> erro + retry
 *
 * Nunca: backend ausente -> dados
 * fictícios.
 */
export function AdminEstadoDados({
  estado,
  rotulo,
  aoTentarNovamente,
  children,
}: AdminEstadoDadosProps) {
  if (estado === 'conectado') {
    return <>{children}</>
  }

  if (estado === 'nao-integrado') {
    return (
      <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-light">
          <Database
            size={30}
            className="text-primary"
            aria-hidden
          />
        </div>
        <h2 className="title-h3">
          Dados de {rotulo} disponíveis após integração
        </h2>
        <p className="mt-3 max-w-md text-body text-content-muted">
          Este módulo lê o banco em
          produção. A integração entra
          com a Etapa 8 — nenhum dado
          é simulado antes dela.
        </p>
      </div>
    )
  }

  return (
    <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-coral/10">
        <TriangleAlert
          size={30}
          className="text-coral"
          aria-hidden
        />
      </div>
      <h2 className="title-h3">
        Não foi possível carregar {rotulo}
      </h2>
      <p className="mt-3 max-w-md text-body text-content-muted">
        Ocorreu um erro ao buscar os
        dados. Se persistir, fale com
        o atendimento.
      </p>
      {aoTentarNovamente && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={aoTentarNovamente}
        >
          <RefreshCw size={16} aria-hidden />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
