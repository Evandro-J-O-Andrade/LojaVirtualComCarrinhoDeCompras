import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AuditoriaRow {
  id: number
  entidade_tipo: string | null
  entidade_id: number | null
  campo: string | null
  valor_anterior: string | null
  valor_novo: string | null
  usuario_id: number | null
  acao: string | null
  criado_em: string
}

export function AdminAuditoriaPage() {
  const [items, setItems] = useState<AuditoriaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('auditoria').select('*').order('criado_em', { ascending: false }).limit(100)
      if (err) throw err
      setItems((data ?? []) as AuditoriaRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar auditoria')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Auditoria</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">ID</th><th className="text-left p-2">Entidade</th><th className="text-left p-2">Campo</th><th className="text-left p-2">Ação</th><th className="text-left p-2">Usuário</th><th className="text-left p-2">Data</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.id}</td>
              <td className="p-2">{item.entidade_tipo ?? '—'} {item.entidade_id ? `#${item.entidade_id}` : ''}</td>
              <td className="p-2">{item.campo ?? '—'}</td>
              <td className="p-2">{item.acao ?? '—'}</td>
              <td className="p-2">{item.usuario_id ?? '—'}</td>
              <td className="p-2 text-sm">{new Date(item.criado_em).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum registro de auditoria</td></tr>}
        </tbody>
      </table>
    </div>
  )
}