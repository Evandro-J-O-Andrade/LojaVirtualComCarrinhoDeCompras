import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface MimoRow {
  id: number
  nome: string
  slug: string
  titulo: string | null
  descricao: string | null
  contexto: string | null
  imagem: string | null
  video: string | null
  ativo: boolean
  inicio: string
  fim: string
  ordem: number
  seo_titulo: string | null
  seo_descricao: string | null
  criado_em: string
}

export function AdminMimosPage() {
  const [items, setItems] = useState<MimoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<MimoRow | null>(null)
  const [form, setForm] = useState({
    nome: '', slug: '', titulo: '', descricao: '', contexto: 'cuidar',
    imagem: '', video: '', ativo: true, inicio: '', fim: '', ordem: 0,
    seo_titulo: '', seo_descricao: '',
  })

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('mimo')
        .select('*')
        .order('ordem', { ascending: true })
      if (err) throw err
      setItems((data ?? []) as MimoRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar mimos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const resetForm = () => {
    setForm({ nome: '', slug: '', titulo: '', descricao: '', contexto: 'cuidar', imagem: '', video: '', ativo: true, inicio: '', fim: '', ordem: 0, seo_titulo: '', seo_descricao: '' })
    setEditing(null)
  }

  const handleSave = async () => {
    try {
      const payload = {
        nome: form.nome, slug: form.slug, titulo: form.titulo || null,
        descricao: form.descricao || null, contexto: form.contexto,
        imagem: form.imagem || null, video: form.video || null,
        ativo: form.ativo, inicio: form.inicio, fim: form.fim,
        ordem: form.ordem, seo_titulo: form.seo_titulo || null,
        seo_descricao: form.seo_descricao || null,
      }
      if (editing) {
        const { error: err } = await supabase.from('mimo').update(payload).eq('id', editing.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('mimo').insert(payload)
        if (err) throw err
      }
      resetForm()
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const handleEdit = (item: MimoRow) => {
    setEditing(item)
    setForm({
      nome: item.nome, slug: item.slug, titulo: item.titulo ?? '',
      descricao: item.descricao ?? '', contexto: item.contexto ?? 'cuidar',
      imagem: item.imagem ?? '', video: item.video ?? '', ativo: item.ativo,
      inicio: item.inicio, fim: item.fim, ordem: item.ordem,
      seo_titulo: item.seo_titulo ?? '', seo_descricao: item.seo_descricao ?? '',
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este mimo?')) return
    try {
      const { error: err } = await supabase.from('mimo').delete().eq('id', id)
      if (err) throw err
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mimos — Cuidados Diários</h1>
        <button onClick={carregar} className="px-4 py-2 bg-blue-600 text-white rounded">Atualizar</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Mimo' : 'Novo Mimo'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} className="p-2 border rounded" />
          <input placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className="p-2 border rounded" />
          <input placeholder="Título" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} className="p-2 border rounded" />
          <select value={form.contexto} onChange={e => setForm(f => ({...f, contexto: e.target.value}))} className="p-2 border rounded">
            <option value="cuidar">Cuidar</option>
            <option value="ritual">Ritual</option>
            <option value="presentear">Presentear</option>
          </select>
          <textarea placeholder="Descrição" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} className="p-2 border rounded col-span-2" rows={3} />
          <input placeholder="Imagem URL" value={form.imagem} onChange={e => setForm(f => ({...f, imagem: e.target.value}))} className="p-2 border rounded" />
          <input placeholder="Vídeo URL" value={form.video} onChange={e => setForm(f => ({...f, video: e.target.value}))} className="p-2 border rounded" />
          <input type="date" placeholder="Início" value={form.inicio} onChange={e => setForm(f => ({...f, inicio: e.target.value}))} className="p-2 border rounded" />
          <input type="date" placeholder="Fim" value={form.fim} onChange={e => setForm(f => ({...f, fim: e.target.value}))} className="p-2 border rounded" />
          <input type="number" placeholder="Ordem" value={form.ordem} onChange={e => setForm(f => ({...f, ordem: Number(e.target.value)}))} className="p-2 border rounded" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={e => setForm(f => ({...f, ativo: e.target.checked}))} /> Ativo</label>
          <input placeholder="SEO Título" value={form.seo_titulo} onChange={e => setForm(f => ({...f, seo_titulo: e.target.value}))} className="p-2 border rounded" />
          <textarea placeholder="SEO Descrição" value={form.seo_descricao} onChange={e => setForm(f => ({...f, seo_descricao: e.target.value}))} className="p-2 border rounded" rows={2} />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">{editing ? 'Atualizar' : 'Criar'}</button>
          {editing && <button onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="text-left p-2">Nome</th>
            <th className="text-left p-2">Slug</th>
            <th className="text-left p-2">Contexto</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Período</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.nome}</td>
              <td className="p-2 text-sm text-gray-500">{item.slug}</td>
              <td className="p-2">{item.contexto}</td>
              <td className="p-2">{item.ativo ? 'Ativo' : 'Inativo'}</td>
              <td className="p-2 text-sm">{item.inicio} → {item.fim}</td>
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