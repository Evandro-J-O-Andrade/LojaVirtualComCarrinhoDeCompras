import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarClock,
  FileText,
  Image,
  LayoutDashboard,
  Package,
  PackageOpen,
  Bell,
  Settings,
  ShoppingBag,
  CreditCard,
  Store,
  Users,
  MessageCircle,
  Tag,
  Layers,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Megaphone,
} from 'lucide-react'

/**
 * FATIA 12A — Administração (shell +
 * dashboard + produtos).
 *
 * Produtividade > cinematografia:
 * informação densa, tabelas, filtros,
 * breadcrumbs, ações rápidas.
 *
 * Regra fechada: nenhum dado inventado.
 * Cada módulo respeita três estados —
 * conectado (dados reais), não
 * integrado ("disponível após
 * integração") e erro (erro + retry).
 */

export type AdminDadosEstado =
  | 'conectado'
  | 'nao-integrado'
  | 'erro'

/** Ações protegidas pelo RBAC real (Etapa 8). */
export type AdminAcao =
  | 'produto.criar'
  | 'produto.editar'
  | 'produto.excluir'
  | 'categoria.criar'
  | 'categoria.editar'
  | 'orcamento.ler'
  | 'orcamento.editar'
  | 'pedido.ler'
  | 'pedido.editar'
  | 'agendamento.ler'
  | 'cliente.ler'
  | 'cliente.editar'
  | 'atendimento.ler'
  | 'auditoria.ler'
  | 'configuracao.editar'

export interface AdminModulo {
  rotulo: string
  href: string | null
  icon: LucideIcon
  /** Módulo previsto, ainda sem página. */
  emBreve?: boolean
}

export interface AdminGrupo {
  grupo: string
  modulos: AdminModulo[]
}

/**
 * Estrutura completa do painel. Módulos
 * que ainda não nasceram ficam visíveis
 * como "em breve" — nunca como link
 * quebrado ou página falsa.
 */
export const ADMIN_GRUPOS: AdminGrupo[] = [
  {
    grupo: 'Visão geral',
    modulos: [
      {
        rotulo: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    grupo: 'Comercial',
    modulos: [
      {
        rotulo: 'Produtos',
        href: '/admin/produtos',
        icon: Package,
      },
      { rotulo: 'Categorias', href: '/admin/categorias', icon: Tag },
      { rotulo: 'Promoções', href: null, icon: Megaphone, emBreve: true },
      { rotulo: 'Kits', href: null, icon: Layers, emBreve: true },
      { rotulo: 'Orçamentos', href: null, icon: FileText, emBreve: true },
      { rotulo: 'Pedidos', href: null, icon: ShoppingBag, emBreve: true },
      { rotulo: 'Pagamentos', href: null, icon: CreditCard, emBreve: true },
      { rotulo: 'Estoque', href: null, icon: PackageOpen, emBreve: true },
    ],
  },
  {
    grupo: 'Experiências',
    modulos: [
      { rotulo: 'Serviços', href: null, icon: Sparkles, emBreve: true },
      { rotulo: 'Profissionais', href: null, icon: Users, emBreve: true },
      { rotulo: 'Agenda', href: null, icon: CalendarClock, emBreve: true },
      { rotulo: 'Agendamentos', href: null, icon: ClipboardList, emBreve: true },
      { rotulo: 'Mimos', href: null, icon: Store, emBreve: true },
      { rotulo: 'Eventos', href: null, icon: BarChart3, emBreve: true },
    ],
  },
  {
    grupo: 'Relacionamento',
    modulos: [
      { rotulo: 'Clientes', href: null, icon: Users, emBreve: true },
      { rotulo: 'Atendimentos', href: null, icon: MessageCircle, emBreve: true },
      { rotulo: 'Notificações', href: null, icon: Bell, emBreve: true },
    ],
  },
  {
    grupo: 'Conteúdo',
    modulos: [
      { rotulo: 'Mídia', href: null, icon: Image, emBreve: true },
      { rotulo: 'Páginas', href: null, icon: FileText, emBreve: true },
    ],
  },
  {
    grupo: 'Sistema',
    modulos: [
      { rotulo: 'Auditoria', href: null, icon: ShieldCheck, emBreve: true },
      { rotulo: 'Configurações', href: null, icon: Settings, emBreve: true },
    ],
  },
]

/** Módulos com rota real hoje (resto é "em breve"). */
export const ADMIN_MODULOS_ATIVOS = ADMIN_GRUPOS.flatMap(
  (grupo) => grupo.modulos,
).filter((modulo) => modulo.href !== null)

/** Rótulo honesto para um estado de dados. */
export function rotuloEstadoDados(
  estado: AdminDadosEstado,
): string {
  switch (estado) {
    case 'conectado':
      return 'Dados reais conectados'
    case 'nao-integrado':
      return 'Dados disponíveis após integração'
    case 'erro':
      return 'Não foi possível carregar os dados'
  }
}
