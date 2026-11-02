import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Database,
  Package,
  ShoppingBag,
  Users,
  FileText,
  TriangleAlert,
  Heart,
  Calendar,
} from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { Card } from '@/components/dashboard/Card'
import { Button } from '@/components/common/Button'
import { useAdminProdutos } from '../hooks/useAdminProdutos'
import { useAdminPermissao } from '../context/AdminPermissionContext'
import { useEffect, useState } from 'react'
import { clienteRepositorySupabase } from '@/domains/clientes/repositories/cliente.repository.supabase'

interface Atalho {
  rotulo: string
  descricao: string
  href: string | null
  icon: typeof Package
}

const ATALHOS: Atalho[] = [
  {
    rotulo: 'Catálogo de produtos',
    descricao: 'Buscar, filtrar e revisar o catálogo.',
    href: '/admin/produtos',
    icon: Package,
  },
  {
    rotulo: 'Clientes',
    descricao: 'Cadastro central e endereços.',
    href: '/admin/clientes',
    icon: Users,
  },
  {
    rotulo: 'Serviços',
    descricao: 'Catálogo de serviços e agendamentos.',
    href: '/admin/servicos',
    icon: Calendar,
  },
  {
    rotulo: 'Experiências',
    descricao: 'Gestão de experiências.',
    href: '/admin/experiencias',
    icon: Heart,
  },
  {
    rotulo: 'Páginas (CMS)',
    descricao: 'Criar e editar páginas do site.',
    href: '/admin/paginas',
    icon: FileText,
  },
  {
    rotulo: 'Orçamentos',
    descricao: 'Propostas comerciais em aberto.',
    href: null,
    icon: FileText,
  },
  {
    rotulo: 'Pedidos',
    descricao: 'Acompanhamento de pedidos.',
    href: null,
    icon: ShoppingBag,
  },
]

/**
 * Dashboard administrativo — KPIs
 * estruturais SEM números inventados.
 *
 * Só o que já tem autoridade real:
 * a contagem de produtos do banco.
 * Pedidos, clientes e receita mostram
 * "—" até a integração. Atividade
 * só existe quando há backend.
 */
export function DashboardPage() {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useAdminProdutos()
  const { estado: permissaoEstado, motivo } =
    useAdminPermissao()

  const [clientesCount, setClientesCount] = useState<number | null>(null)
  const [mimosCount, setMimosCount] = useState<number | null>(null)

  useEffect(() => {
    clienteRepositorySupabase.listar().then((r: any[]) => setClientesCount(r.length)).catch(() => setClientesCount(null))
    setMimosCount(null)
  }, [])

  const conectado =
    !error && data?.estado === 'conectado'
  const naoconectado =
    !error && data?.estado === 'nao-integrado'
  const totalProdutos =
    conectado ? data?.produtos.length : null

  return (
    <div>
      <SeoHead
        title="Dashboard — Angel Cosméticos"
        description="Visão geral administrativa da Angel Cosméticos."
        canonical="/admin"
        robots="noindex, nofollow"
      />

      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-soft-black">
            Visão geral
          </h1>
          <p className="text-sm text-content-muted">
            Painel administrativo — dados
            reais ou nada.
          </p>
        </div>

        {/* Alertas de integração */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-coral/40 bg-coral/10 p-4"
          >
            <TriangleAlert
              size={20}
              className="mt-0.5 shrink-0 text-coral"
              aria-hidden
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-soft-black">
                Não foi possível carregar os
                dados administrativos.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {naoconectado && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-champagne bg-blush/40 p-4">
            <Database
              size={20}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden
            />
            <p className="text-sm text-soft-black">
              Backend não integrado: os
              dados administrativos
              aparecem com a Etapa 8.
              Nada é simulado.
            </p>
          </div>
        )}

        {conectado && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-champagne bg-blush/40 p-4">
            <Database
              size={20}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden
            />
            <p className="text-sm text-soft-black">
              Dados de desenvolvimento
              presentes: a classificação
              real/desenvolvimento/inválido
              está pendente — não trate
              estes números como produção.
            </p>
          </div>
        )}

        {/* KPIs estruturais */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            icon={Package}
            rotulo="Produtos no catálogo"
            valor={
              isLoading
                ? '…'
                : totalProdutos !== null
                  ? String(totalProdutos)
                  : '—'
            }
            nota={
              totalProdutos !== null
                ? 'Contagem real do banco'
                : 'Após a integração'
            }
          />
          <KpiCard
            icon={Users}
            rotulo="Clientes"
            valor={clientesCount !== null ? String(clientesCount) : '—'}
            nota={clientesCount !== null ? 'Contagem real do banco' : 'Após a integração'}
          />
          <KpiCard
            icon={Heart}
            rotulo="Mimos"
            valor={mimosCount !== null ? String(mimosCount) : '—'}
            nota={mimosCount !== null ? 'Contagem real do banco' : 'Após a integração'}
          />
          <KpiCard
            icon={Calendar}
            rotulo="Agendamentos"
            valor="—"
            nota="Em progresso"
          />
          <KpiCard
            icon={FileText}
            rotulo="Orçamentos em aberto"
            valor="—"
            nota="Após a integração"
          />
          <KpiCard
            icon={ShoppingBag}
            rotulo="Pedidos"
            valor="—"
            nota="Após a integração"
          />
        </div>

        {/* Atalhos */}
        <h2 className="font-display mb-3 text-lg font-bold text-soft-black">
          Atalhos
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ATALHOS.map((atalho) => {
            const Icon = atalho.icon
            const href = atalho.href
            return href !== null ? (
              <Card key={atalho.rotulo}>
                <Link
                  to={href}
                  className="group flex items-start gap-4"
                >
                  <Icon
                    size={24}
                    className="shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-soft-black">
                      {atalho.rotulo}
                    </h3>
                    <p className="text-sm text-content-muted">
                      {atalho.descricao}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-content-muted transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Card>
            ) : (
              <Card key={atalho.rotulo}>
                <div className="flex items-start gap-4">
                  <Icon
                    size={24}
                    className="shrink-0 text-content-muted"
                    aria-hidden
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-content-muted">
                      {atalho.rotulo}
                    </h3>
                    <p className="text-sm text-content-muted">
                      Em breve — após a
                      integração.
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <h2 className="font-display mb-3 text-lg font-bold text-soft-black">Módulos administrativos</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/admin/clientes" className="p-2 border rounded hover:bg-gray-50">Clientes</Link>
              <Link to="/admin/servicos" className="p-2 border rounded hover:bg-gray-50">Serviços</Link>
              <Link to="/admin/experiencias" className="p-2 border rounded hover:bg-gray-50">Experiências</Link>
              <Link to="/admin/paginas" className="p-2 border rounded hover:bg-gray-50">Páginas (CMS)</Link>
              <Link to="/admin/produtos" className="p-2 border rounded hover:bg-gray-50">Produtos</Link>
              <Link to="/admin/categorias" className="p-2 border rounded hover:bg-gray-50">Categorias</Link>
            </div>
          </Card>
          <Card>
            <h2 className="font-display mb-3 text-lg font-bold text-soft-black">Status</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>CMS / Páginas</span><span className="text-green-600">Implementado</span></li>
              <li className="flex justify-between"><span>Experiências</span><span className="text-green-600">Implementado</span></li>
              <li className="flex justify-between"><span>Serviços</span><span className="text-green-600">Implementado</span></li>
              <li className="flex justify-between"><span>Clientes</span><span className="text-green-600">Implementado</span></li>
              <li className="flex justify-between"><span>Agendamentos</span><span className="text-yellow-600">Em progresso</span></li>
              <li className="flex justify-between"><span>Biblioteca de Mídia</span><span className="text-yellow-600">Em progresso</span></li>
            </ul>
          </Card>
        </div>

        {/* Permissões (seam RBAC) */}
        <Card className="mt-6">
          <h2 className="font-display mb-2 text-lg font-bold text-soft-black">
            Permissões
          </h2>
          <p className="text-sm text-content-muted">
            Estado:{' '}
            <span className="font-medium text-soft-black">
              {permissaoEstado === 'pendente'
                ? 'pendente'
                : 'conectado'}
            </span>
            . {motivo}.
          </p>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  rotulo,
  valor,
  nota,
}: {
  icon: typeof Package
  rotulo: string
  valor: string
  nota: string
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-content-muted">
            {rotulo}
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-soft-black">
            {valor}
          </p>
          <p className="mt-1 text-xs text-content-muted">
            {nota}
          </p>
        </div>
        <Icon
          size={22}
          className="shrink-0 text-primary"
          aria-hidden
        />
      </div>
    </Card>
  )
}
