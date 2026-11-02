import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AgendamentoRow {
  id: number
  protocolo: string
  status: string
  data: string
  horario_inicio: string
  contato_nome: string | null
  contato_telefone: string | null
  contato_email: string | null
  observacao: string | null
  servico_id: number
  profissional_id: number
  criado_em: string
}

export function AdminAgendamentosPage() {
  const [items, setItems] = useState<AgendamentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('agendamento')
        .select('id, protocolo, status, data, horario_inicio, contato_nome, contato_telefone, contato_email, observacao, servico_id, profissional_id, criado_em')
        .order('criado_em', { ascending: false })
      if (err) throw err
      setItems((data ?? []) as AgendamentoRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const { error: err } = await supabase
        .from('agendamento')
        .update({ status })
        .eq('id', id)
      if (err) throw err
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar status')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Protocolo</th>
            <th className="text-left p-2">Cliente</th>
            <th className="text-left p-2">Data</th>
            <th className="text-left p-2">Horário</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.protocolo}</td>
              <td className="p-2">{item.contato_nome ?? '—'}</td>
              <td className="p-2">{item.data}</td>
              <td className="p-2">{item.horario_inicio}</td>
              <td className="p-2">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="solicitado">Solicitado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="nao_compareceu">Não compareceu</option>
                  <option value="reagendado">Reagendado</option>
                  <option value="expirado">Expirado</option>
                </select>
              </td>
              <td className="p-2">
                {item.contato_telefone && <span className="text-sm text-gray-500">{item.contato_telefone}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}