import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface PedidoRow {
  id: number
  cliente_id: number | null
  status: string | null
  total: number | null
  criado_em: string
}

export function AdminPedidosPage() {
  const [items, setItems] = useState<PedidoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('pedido').select('*').order('criado_em', { ascending: false })
      if (err) throw err
      setItems((data ?? []) as PedidoRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const { error: err } = await supabase.from('pedido').update({ status }).eq('id', id)
      if (err) throw err
      carregar()
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao atualizar') }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Cliente</th><th className="text-left p-2">Status</th><th className="text-left p-2">Total</th><th className="text-left p-2">Criado em</th><th className="text-left p-2">Ações</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.cliente_id ?? '—'}</td>
              <td className="p-2">
                <select value={item.status ?? ''} onChange={e => handleStatusChange(item.id, e.target.value)} className="p-1 border rounded">
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_preparacao">Em preparação</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </td>
              <td className="p-2">{item.total != null ? `R$ ${item.total.toFixed(2)}` : '—'}</td>
              <td className="p-2 text-sm">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</td>
              <td className="p-2"></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum pedido cadastrado</td></tr>}
        </tbody>
      </table>
    </div>
  )
}