import type { User } from '@supabase/supabase-js'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarClock,
  FileText,
  Heart,
  Package,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'

/**
 * FATIA 11 — Conta + Cliente.
 *
 * A conta NÃO é um localStorage disfarçado:
 * a autoridade de identidade é o Supabase
 * Auth (AuthContext). Este domínio é o
 * seam — `AccountContext` — que a UI
 * consome, para que a integração do
 * banco (Etapa 8) não reescreva a UI.
 *
 * Regra fechada: nenhum histórico
 * comercial inventado. Pedidos, orçamentos
 * e agendamentos só existem quando o
 * backend existir.
 */

export interface PerfilCliente {
  nome: string
  email: string
  /** Telefone vem da tabela de perfil (Etapa 8): null até lá. */
  telefone: string | null
}

export type SecaoConta =
  | 'perfil'
  | 'pedidos'
  | 'orcamentos'
  | 'agendamentos'
  | 'favoritos'
  | 'seguranca'

export interface SecaoContaInfo {
  secao: SecaoConta
  rotulo: string
  descricao: string
  href: string
  icon: LucideIcon
}

export const CONTA_SECOES: SecaoContaInfo[] = [
  {
    secao: 'perfil',
    rotulo: 'Perfil',
    descricao: 'Seus dados de identificação.',
    href: '/conta/perfil',
    icon: UserIcon,
  },
  {
    secao: 'pedidos',
    rotulo: 'Pedidos',
    descricao: 'O que você comprou e onde está.',
    href: '/conta/pedidos',
    icon: Package,
  },
  {
    secao: 'orcamentos',
    rotulo: 'Orçamentos',
    descricao: 'Propostas comerciais em aberto.',
    href: '/conta/orcamentos',
    icon: FileText,
  },
  {
    secao: 'agendamentos',
    rotulo: 'Agendamentos',
    descricao: 'Suas experiências marcadas.',
    href: '/conta/agendamentos',
    icon: CalendarClock,
  },
  {
    secao: 'favoritos',
    rotulo: 'Favoritos',
    descricao: 'Produtos que você salvou.',
    href: '/conta/favoritos',
    icon: Heart,
  },
  {
    secao: 'seguranca',
    rotulo: 'Segurança',
    descricao: 'Senha, sessão e saída.',
    href: '/conta/seguranca',
    icon: ShieldCheck,
  },
]

/**
 * Identidade a partir do usuário real do
 * Supabase Auth. Nada é inventado: telefone
 * só existe quando a tabela de perfil
 * entrar (Etapa 8).
 */
export function perfilDoUsuario(
  user: User | null,
): PerfilCliente | null {
  if (!user) return null
  const metadata = user.user_metadata as
    | { name?: string }
    | undefined
  return {
    nome: metadata?.name?.trim() || '',
    email: user.email ?? '',
    telefone: null,
  }
}

/** Nome de exibição: metadata, e-mail ou "Cliente". */
export function nomeExibicao(
  perfil: PerfilCliente | null,
): string {
  if (!perfil) return 'Cliente'
  return perfil.nome || perfil.email || 'Cliente'
}

/** Inicial do avatar, derivada do nome de exibição. */
export function inicialAvatar(
  perfil: PerfilCliente | null,
): string {
  const nome = nomeExibicao(perfil)
  return nome.charAt(0).toUpperCase()
}

/**
 * Destino de retorno depois de entrar.
 *
 * Só caminhos internos são aceitos. URL
 * externa, esquema, caminho absoluto de
 * site e barras invertidas caem no padrão:
 * o parâmetro `destino` nunca vira uma
 * saída da loja.
 */
export function destinoSeguro(
  candidato: string | null | undefined,
  padrao = '/conta',
): string {
  if (!candidato) return padrao
  const valor = candidato.trim()
  if (!valor.startsWith('/')) return padrao
  // "//exemplo.com" é caminho absoluto de
  // outro site disfarçado de relativo.
  if (valor.startsWith('//')) return padrao
  if (valor.includes('://')) return padrao
  if (valor.includes('\\')) return padrao
  // Caractere de controle (quebra de linha,
  // nulo) indica tentativa de injetar rota.
  for (const caractere of valor) {
    if ((caractere.codePointAt(0) ?? 0) < 32) {
      return padrao
    }
  }
  return valor
}
