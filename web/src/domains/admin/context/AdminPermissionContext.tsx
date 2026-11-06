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
  estado: 'carregando' | 'autorizado' | 'negado'
  pode(acao: AdminAcao): boolean
  motivo: string
}

const AdminPermissionContext =
  createContext<AdminPermissionContextType | undefined>(
    undefined,
  )

const MOTIVO_NEGADO =
  'Acesso negado: usuário não é administrador'

export function AdminPermissionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [admin, setAdmin] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

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
        setErro(true)
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
        ? 'carregando'
        : admin
          ? 'autorizado'
          : 'negado',
      pode: () => {
        if (carregando) return false
        if (!admin) return false
        return true
      },
      motivo: carregando
        ? 'Carregando permissões...'
        : admin
          ? ''
          : erro
            ? 'Erro ao verificar permissões. Tente novamente.'
            : MOTIVO_NEGADO,
    }),
    [admin, carregando, erro],
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