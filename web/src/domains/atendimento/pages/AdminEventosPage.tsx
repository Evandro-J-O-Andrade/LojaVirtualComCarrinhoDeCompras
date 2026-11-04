import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface EventoRow {
  id: number
  nome: string | null
  entidade_tipo: string | null
  entidade_id: number | null
  status: string | null
  tentativas: number
  criado_em: string
}

export function AdminEventosPage() {
  const [items, setItems] = useState<EventoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('evento').select('*').order('criado_em', { ascending: false })
      if (err) throw err
      setItems((data ?? []) as EventoRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Nome</th><th className="text-left p-2">Entidade</th><th className="text-left p-2">Status</th><th className="text-left p-2">Tentativas</th><th className="text-left p-2">Criado em</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.nome ?? '—'}</td>
              <td className="p-2">{item.entidade_tipo ?? '—'} {item.entidade_id ? `#${item.entidade_id}` : ''}</td>
              <td className="p-2">{item.status ?? '—'}</td>
              <td className="p-2">{item.tentativas}</td>
              <td className="p-2 text-sm">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum evento registrado</td></tr>}
        </tbody>
      </table>
    </div>
  )
}