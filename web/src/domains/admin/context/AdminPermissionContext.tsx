import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type { AdminAcao } from '../model/admin'

/**
 * AdminPermissionContext — o seam de
 * autorização administrativa.
 *
 * Enquanto o backend não está
 * conectado, o contexto NÃO afirma
 * que o usuário possui permissões
 * reais: `estado` fica pendente e
 * `pode()` responde falso. Ações de
 * escrita (criar/editar/excluir)
 * ficam indisponíveis até o RBAC
 * real (Etapa 8). Leitura de dados
 * conectados segue pelo repositório,
 * não por permissão inventada.
 */
interface AdminPermissionContextType {
  /** 'pendente' até o RBAC real existir. */
  estado: 'pendente' | 'conectado'
  /** Sempre falso enquanto pendente. */
  pode(acao: AdminAcao): boolean
  /** Por que a ação está indisponível. */
  motivo: string
}

const AdminPermissionContext =
  createContext<AdminPermissionContextType | undefined>(
    undefined,
  )

const MOTIVO_PENDENTE =
  'Permissões reais chegam com o RBAC na integração do backend'

export function AdminPermissionProvider({
  children,
}: {
  children: ReactNode
}) {
  const value = useMemo<AdminPermissionContextType>(
    () => ({
      estado: 'pendente',
      pode: () => false,
      motivo: MOTIVO_PENDENTE,
    }),
    [],
  )

  return (
    <AdminPermissionContext.Provider value={value}>
      {children}
    </AdminPermissionContext.Provider>
  )
}

export function useAdminPermissao(): AdminPermissionContextType {
  const context = useContext(AdminPermissionContext)
  if (!context)
    throw new Error(
      'useAdminPermissao deve ser usado dentro de AdminPermissionProvider',
    )
  return context
}
