import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface KitRow {
  id: number
  kit_produto_id: number | null
  produto_id: number | null
  variante_id: number | null
  produto_opcao_id: number | null
  quantidade: number
  ordem: number
  ativo: boolean
  criado_em: string
}

export function AdminKitsPage() {
  const [items, setItems] = useState<KitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('kit_composicao').select('*').order('ordem', { ascending: true })
      if (err) throw err
      setItems((data ?? []) as KitRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar kits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kits</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Kit Produto</th><th className="text-left p-2">Produto</th><th className="text-left p-2">Variante</th><th className="text-left p-2">Qtd</th><th className="text-left p-2">Ordem</th><th className="text-left p-2">Ativo</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.kit_produto_id ?? '—'}</td>
              <td className="p-2">{item.produto_id ?? '—'}</td>
              <td className="p-2">{item.variante_id ?? '—'}</td>
              <td className="p-2">{item.quantidade}</td>
              <td className="p-2">{item.ordem}</td>
              <td className="p-2">{item.ativo ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nenhum kit cadastrado</td></tr>}
        </tbody>
      </table>
    </div>
  )
}