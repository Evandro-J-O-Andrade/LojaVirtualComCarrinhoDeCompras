import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AgendaRow {
  id: number
  profissional_id: number | null
  dia_semana: number | null
  horario_inicio: string | null
  horario_fim: string | null
  disponivel: boolean
  criado_em: string
}

export function AdminAgendaPage() {
  const [items, setItems] = useState<AgendaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('agenda').select('*').order('dia_semana', { ascending: true })
      if (err) throw err
      setItems((data ?? []) as AgendaRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar agenda')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Profissional</th><th className="text-left p-2">Dia da Semana</th><th className="text-left p-2">Início</th><th className="text-left p-2">Fim</th><th className="text-left p-2">Disponível</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.profissional_id ?? '—'}</td>
              <td className="p-2">{item.dia_semana ?? '—'}</td>
              <td className="p-2">{item.horario_inicio ?? '—'}</td>
              <td className="p-2">{item.horario_fim ?? '—'}</td>
              <td className="p-2">{item.disponivel ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum registro de agenda</td></tr>}
        </tbody>
      </table>
    </div>
  )
}