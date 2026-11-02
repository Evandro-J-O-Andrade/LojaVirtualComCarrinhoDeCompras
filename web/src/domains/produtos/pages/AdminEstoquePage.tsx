import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface EstoqueRow {
  id: number
  produto_id: number
  quantidade: number
  minimo: number | null
  criado_em: string
}

export function AdminEstoquePage() {
  const [items, setItems] = useState<EstoqueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('estoque').select('*').order('produto_id')
      if (err) throw err
      setItems((data ?? []) as EstoqueRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar estoque')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estoque</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Produto</th><th className="text-left p-2">Quantidade</th><th className="text-left p-2">Mínimo</th><th className="text-left p-2">Status</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.produto_id}</td>
              <td className="p-2">{item.quantidade}</td>
              <td className="p-2">{item.minimo ?? '—'}</td>
              <td className="p-2">{item.minimo != null && item.quantidade <= item.minimo ? 'Baixo' : 'OK'}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nenhum registro de estoque</td></tr>}
        </tbody>
      </table>
    </div>
  )
}