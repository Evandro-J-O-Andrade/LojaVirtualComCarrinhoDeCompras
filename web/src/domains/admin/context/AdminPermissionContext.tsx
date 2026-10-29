import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { AdminAcao } from '../model/admin'
import { useIsAdmin } from '../services/adminAuth'

interface AdminPermissionContextType {
  estado: 'pendente' | 'conectado'
  pode(acao: AdminAcao): boolean
  motivo: string
}

const AdminPermissionContext =
  createContext<AdminPermissionContextType | undefined>(undefined)

const MOTIVO_PENDENTE = 'Verificando a autorização administrativa no Supabase.'
const MOTIVO_NEGADO = 'Sua conta não possui autorização administrativa ativa no Supabase.'

export function AdminPermissionProvider({ children }: { children: ReactNode }) {
  const { data: isAdmin, isLoading } = useIsAdmin()

  const value = useMemo<AdminPermissionContextType>(() => ({
    estado: isLoading ? 'pendente' : 'conectado',
    pode: () => !isLoading && isAdmin === true,
    motivo: isLoading ? MOTIVO_PENDENTE : isAdmin === true ? '' : MOTIVO_NEGADO,
  }), [isAdmin, isLoading])

  return (
    <AdminPermissionContext.Provider value={value}>
      {children}
    </AdminPermissionContext.Provider>
  )
}

export function useAdminPermissao(): AdminPermissionContextType {
  const context = useContext(AdminPermissionContext)
  if (!context) {
    throw new Error('useAdminPermissao deve ser usado dentro de AdminPermissionProvider')
  }
  return context
}
