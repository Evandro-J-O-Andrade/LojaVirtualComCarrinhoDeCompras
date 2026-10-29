import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import type { AdminAcao } from '../model/admin'
import { verificarAdmin } from '../services/adminAuth'

interface AdminPermissionContextType {
  estado: 'pendente' | 'conectado'
  pode(acao: AdminAcao): boolean
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
  const [admin, setAdmin] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    verificarAdmin()
      .then((resultado) => {
        if (!ativo) return
        setAdmin(resultado)
        setCarregando(false)
      })
      .catch(() => {
        if (!ativo) return
        setAdmin(false)
        setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  const value = useMemo<AdminPermissionContextType>(
    () => ({
      estado: carregando
        ? 'pendente'
        : admin
          ? 'conectado'
          : 'pendente',
      pode: () => !carregando && admin,
      motivo: carregando || !admin ? MOTIVO_PENDENTE : '',
    }),
    [admin, carregando],
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