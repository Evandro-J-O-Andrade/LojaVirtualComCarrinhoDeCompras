import { useQuery } from '@tanstack/react-query'
import {
  supabase,
  supabaseConfigurado,
} from '@/lib/supabase'

/**
 * FATIA 12 — Administração.
 *
 * A autoridade de quem é administrador é
 * o backend: a função `public.is_admin()`
 * (SECURITY DEFINER) consulta `admin_user`
 * sem RLS. O frontend não decide — ele
 * pergunta ao Supabase.
 *
 * Sem configuração, sem rede ou com erro,
 * a resposta é `false`: ninguém ganha
 * acesso por falha.
 */
export async function verificarAdmin(): Promise<boolean> {
  if (!supabaseConfigurado) return false
  try {
    const { data, error } = await supabase.rpc('is_admin')
    if (error) return false
    return data === true
  } catch {
    return false
  }
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ['admin-is-admin'],
    queryFn: verificarAdmin,
    retry: false,
    staleTime: 60 * 1000,
  })
}
