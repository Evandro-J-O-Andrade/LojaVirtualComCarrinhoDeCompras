import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AtendimentoRow {
  id: number
  cliente_id: number | null
  tipo: string | null
  assunto: string | null
  descricao: string | null
  status: string | null
  criado_em: string
}

export function AdminAtendimentosPage() {
  const [items, setItems] = useState<AtendimentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('atendimento').select('*').order('criado_em', { ascending: false })
      if (err) throw err
      setItems((data ?? []) as AtendimentoRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar atendimentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const { error: err } = await supabase.from('atendimento').update({ status }).eq('id', id)
      if (err) throw err
      carregar()
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao atualizar') }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Atendimentos</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Cliente</th><th className="text-left p-2">Tipo</th><th className="text-left p-2">Assunto</th><th className="text-left p-2">Status</th><th className="text-left p-2">Criado em</th><th className="text-left p-2">Ações</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.cliente_id ?? '—'}</td>
              <td className="p-2">{item.tipo ?? '—'}</td>
              <td className="p-2">{item.assunto ?? '—'}</td>
              <td className="p-2">
                <select value={item.status ?? ''} onChange={e => handleStatusChange(item.id, e.target.value)} className="p-1 border rounded">
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="resolvido">Resolvido</option>
                  <option value="fechado">Fechado</option>
                </select>
              </td>
              <td className="p-2 text-sm">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</td>
              <td className="p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}