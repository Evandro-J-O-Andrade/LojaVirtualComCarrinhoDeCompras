import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface ProfissionalRow {
  id: number
  nome: string
  email: string | null
  telefone: string | null
  especialidade: string | null
  ativo: boolean
  criado_em: string
}

export function AdminProfissionaisPage() {
  const [items, setItems] = useState<ProfissionalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ProfissionalRow | null>(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', especialidade: '', ativo: true })

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.from('profissional').select('*').order('nome')
      if (err) throw err
      setItems((data ?? []) as ProfissionalRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const resetForm = () => { setForm({ nome: '', email: '', telefone: '', especialidade: '', ativo: true }); setEditing(null) }

  const handleSave = async () => {
    try {
      const payload = { nome: form.nome, email: form.email || null, telefone: form.telefone || null, especialidade: form.especialidade || null, ativo: form.ativo }
      if (editing) {
        const { error: err } = await supabase.from('profissional').update(payload).eq('id', editing.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('profissional').insert(payload)
        if (err) throw err
      }
      resetForm(); carregar()
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao salvar') }
  }

  const handleEdit = (item: ProfissionalRow) => {
    setEditing(item)
    setForm({ nome: item.nome, email: item.email ?? '', telefone: item.telefone ?? '', especialidade: item.especialidade ?? '', ativo: item.ativo })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este profissional?')) return
    try {
      const { error: err } = await supabase.from('profissional').delete().eq('id', id)
      if (err) throw err
      carregar()
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao excluir') }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profissionais</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Profissional' : 'Novo Profissional'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} className="p-2 border rounded" />
          <input placeholder="E-mail" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="p-2 border rounded" />
          <input placeholder="Telefone" value={form.telefone} onChange={e => setForm(f => ({...f, telefone: e.target.value}))} className="p-2 border rounded" />
          <input placeholder="Especialidade" value={form.especialidade} onChange={e => setForm(f => ({...f, especialidade: e.target.value}))} className="p-2 border rounded" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={e => setForm(f => ({...f, ativo: e.target.checked}))} /> Ativo</label>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">{editing ? 'Atualizar' : 'Criar'}</button>
          {editing && <button onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>}
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead><tr className="border-b bg-gray-100"><th className="text-left p-2">Nome</th><th className="text-left p-2">E-mail</th><th className="text-left p-2">Telefone</th><th className="text-left p-2">Especialidade</th><th className="text-left p-2">Status</th><th className="text-left p-2">Ações</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.nome}</td>
              <td className="p-2 text-sm">{item.email ?? '—'}</td>
              <td className="p-2 text-sm">{item.telefone ?? '—'}</td>
              <td className="p-2">{item.especialidade ?? '—'}</td>
              <td className="p-2">{item.ativo ? 'Ativo' : 'Inativo'}</td>
              <td className="p-2">
                <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-blue-500 text-white rounded text-sm mr-2">Editar</button>
                <button onClick={() => handleDelete(item.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}