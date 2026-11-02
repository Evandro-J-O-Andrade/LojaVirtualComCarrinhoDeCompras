import { useState, useEffect, useCallback } from 'react'
import { experienciaRepositorySupabase } from '../repositories/experiencia.repository.supabase'
import type { Experiencia, ExperienciaInput } from '../model/experiencia'

export function AdminExperienciasPage() {
  const [items, setItems] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ExperienciaInput>({
    titulo: '',
    slug: '',
    resumo: '',
    conteudo: '',
    status: 'rascunho',
    ordem: 0,
  })

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await experienciaRepositorySupabase.listar()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar experiências')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await experienciaRepositorySupabase.atualizar(editingId, form)
      } else {
        await experienciaRepositorySupabase.criar(form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ titulo: '', slug: '', resumo: '', conteudo: '', status: 'rascunho', ordem: 0 })
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const handleEditar = (item: Experiencia) => {
    setForm({
      titulo: item.titulo,
      slug: item.slug,
      resumo: item.resumo ?? '',
      conteudo: item.conteudo ?? '',
      status: item.status,
      ordem: item.ordem,
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handlePublicar = async (id: number) => {
    try {
      await experienciaRepositorySupabase.publicar(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao publicar')
    }
  }

  const handleArquivar = async (id: number) => {
    try {
      await experienciaRepositorySupabase.arquivar(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao arquivar')
    }
  }

  const handleExcluir = async (id: number) => {
    if (!confirm('Excluir esta experiência?')) return
    try {
      await experienciaRepositorySupabase.excluir(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Experiências</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setForm({ titulo: '', slug: '', resumo: '', conteudo: '', status: 'rascunho', ordem: 0 })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Nova Experiência
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded space-y-4">
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Título"
            className="w-full p-2 border rounded"
            required
          />
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="Slug (URL)"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={form.resumo}
            onChange={(e) => setForm({ ...form, resumo: e.target.value })}
            placeholder="Resumo"
            className="w-full p-2 border rounded"
            rows={2}
          />
          <textarea
            value={form.conteudo}
            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
            placeholder="Conteúdo"
            className="w-full p-2 border rounded"
            rows={6}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Experiencia['status'] })}
            className="p-2 border rounded"
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
            <option value="arquivado">Arquivado</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Título</th>
            <th className="text-left p-2">Slug</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.titulo}</td>
              <td className="p-2">{item.slug}</td>
              <td className="p-2">{item.status}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleEditar(item)} className="text-blue-600">Editar</button>
                {item.status !== 'publicado' && (
                  <button onClick={() => handlePublicar(item.id)} className="text-green-600">Publicar</button>
                )}
                {item.status !== 'arquivado' && (
                  <button onClick={() => handleArquivar(item.id)} className="text-yellow-600">Arquivar</button>
                )}
                <button onClick={() => handleExcluir(item.id)} className="text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}