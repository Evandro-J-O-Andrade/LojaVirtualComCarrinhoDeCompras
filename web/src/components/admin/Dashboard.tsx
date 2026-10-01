import { TrendingUp, ShoppingBag, Users, FileText } from 'lucide-react'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { Card } from '@/components/dashboard/Card'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/dashboard/Table'
import { Badge } from '@/components/common/Badge'

const recentOrders = [
  { id: '#ANG-001', cliente: 'Maria Silva', produto: 'Kit Maquiagem', valor: 'R$ 199,90', status: 'Entregue' },
  { id: '#ANG-002', cliente: 'Ana Santos', produto: 'Vestido Florido', valor: 'R$ 129,90', status: 'Enviado' },
  { id: '#ANG-003', cliente: 'Juliana Costa', produto: 'Kit Cama', valor: 'R$ 299,90', status: 'Pendente' },
]

export function AdminDashboard() {
  const stats = [
    { label: 'Vendas Hoje', value: 'R$ 4.520', change: 12, icon: <TrendingUp size={22} /> },
    { label: 'Total Pedidos', value: '1.234', change: 8, icon: <ShoppingBag size={22} /> },
    { label: ' Clientes', value: '568', change: 5, icon: <Users size={22} /> },
    { label: 'Orçamentos', value: '42', change: 15, icon: <FileText size={22} /> },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-soft-black">
          Dashboard
        </h1>
        <p className="text-warm-gray">Visão geral do seu comércio</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Pedidos Recentes</h3>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>{order.produto}</TableCell>
                  <TableCell>{order.valor}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'Entregue' ? 'promo'
                        : order.status === 'Enviado' ? 'new'
                        : 'sale'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-lg mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center">
                <ShoppingBag size={18} className="text-deep-rose" />
              </div>
              <div>
                <p className="text-sm font-medium">Nova venda registrada</p>
                <p className="text-xs text-warm-gray">Há 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center">
                <Users size={18} className="text-deep-rose" />
              </div>
              <div>
                <p className="text-sm font-medium">Novo cliente registrado</p>
                <p className="text-xs text-warm-gray">Há 1 hora</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center">
                <FileText size={18} className="text-deep-rose" />
              </div>
              <div>
                <p className="text-sm font-medium">Orçamento criado</p>
                <p className="text-xs text-warm-gray">Há 2 horas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
