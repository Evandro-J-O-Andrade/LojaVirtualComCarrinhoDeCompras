import { useState, useEffect, useCallback } from 'react'
import { paginaRepositorySupabase } from '../repositories/pagina.repository.supabase'
import type { Pagina, PaginaInput } from '../model/pagina'

export function AdminPaginasPage() {
  const [paginas, setPaginas] = useState<Pagina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PaginaInput>({
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
      const data = await paginaRepositorySupabase.listar()
      setPaginas(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar páginas')
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
        await paginaRepositorySupabase.atualizar(editingId, form)
      } else {
        await paginaRepositorySupabase.criar(form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ titulo: '', slug: '', resumo: '', conteudo: '', status: 'rascunho', ordem: 0 })
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const handleEditar = (pagina: Pagina) => {
    setForm({
      titulo: pagina.titulo,
      slug: pagina.slug,
      resumo: pagina.resumo ?? '',
      conteudo: pagina.conteudo ?? '',
      status: pagina.status,
      ordem: pagina.ordem,
    })
    setEditingId(pagina.id)
    setShowForm(true)
  }

  const handlePublicar = async (id: number) => {
    try {
      await paginaRepositorySupabase.publicar(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao publicar')
    }
  }

  const handleArquivar = async (id: number) => {
    try {
      await paginaRepositorySupabase.arquivar(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao arquivar')
    }
  }

  const handleExcluir = async (id: number) => {
    if (!confirm('Excluir esta página?')) return
    try {
      await paginaRepositorySupabase.excluir(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Páginas (CMS)</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setForm({ titulo: '', slug: '', resumo: '', conteudo: '', status: 'rascunho', ordem: 0 })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Nova Página
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
            onChange={(e) => setForm({ ...form, status: e.target.value as Pagina['status'] })}
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
          {paginas.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.titulo}</td>
              <td className="p-2">{p.slug}</td>
              <td className="p-2">{p.status}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleEditar(p)} className="text-blue-600">Editar</button>
                {p.status !== 'publicado' && (
                  <button onClick={() => handlePublicar(p.id)} className="text-green-600">Publicar</button>
                )}
                {p.status !== 'arquivado' && (
                  <button onClick={() => handleArquivar(p.id)} className="text-yellow-600">Arquivar</button>
                )}
                <button onClick={() => handleExcluir(p.id)} className="text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
