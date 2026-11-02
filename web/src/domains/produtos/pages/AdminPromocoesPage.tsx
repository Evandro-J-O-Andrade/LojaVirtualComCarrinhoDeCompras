import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface PromocaoRow {
  id: number
  nome: string
  slug: string | null
  descricao: string | null
  ativo: boolean
  inicio: string | null
  fim: string | null
  criado_em: string
}

export function AdminPromocoesPage() {
  const [items, setItems] = useState<PromocaoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('promocao').select('*').order('created_at', { ascending: false })
      if (err) throw err
      setItems((data ?? []) as PromocaoRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar promoções')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promoções</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">Nome</th><th className="text-left p-2">Slug</th><th className="text-left p-2">Status</th><th className="text-left p-2">Período</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.nome}</td>
              <td className="p-2 text-sm text-gray-500">{item.slug ?? '—'}</td>
              <td className="p-2">{item.ativo ? 'Ativa' : 'Inativa'}</td>
              <td className="p-2 text-sm">{item.inicio ?? '—'} → {item.fim ?? '—'}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nenhuma promoção cadastrada</td></tr>}
        </tbody>
      </table>
    </div>
  )
}