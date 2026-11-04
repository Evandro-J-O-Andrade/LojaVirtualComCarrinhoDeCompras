import { useState, useEffect, useCallback } from 'react'
import { paginaRepositorySupabase } from '../repositories/pagina.repository.supabase'
import type { Pagina, PaginaInput, PaginaSecao, PaginaBloco, PaginaBlocoTipo, PaginaBlocoInput } from '../model/pagina'

const BLOCO_TIPOS: PaginaBlocoTipo[] = [
  'banner', 'texto', 'imagem', 'video', 'produtos_destaque', 'categorias',
  'promocoes', 'beneficios', 'servicos', 'cta', 'galeria', 'html',
]

export function AdminPaginasPage() {
  const [paginas, setPaginas] = useState<Pagina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [form, setForm] = useState<PaginaInput>({
    titulo: '', slug: '', resumo: '', conteudo: '', status: 'rascunho', ordem: 0,
  })
  const [secaoForm, setSecaoForm] = useState({ tipo: 'hero', titulo: '', subtitulo: '', conteudo: '' })
  const [blocoForm, setBlocoForm] = useState<PaginaBlocoInput | null>(null)

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

  useEffect(() => { carregar() }, [carregar])

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
      titulo: pagina.titulo, slug: pagina.slug, resumo: pagina.resumo ?? '',
      conteudo: pagina.conteudo ?? '', status: pagina.status, ordem: pagina.ordem,
    })
    setEditingId(pagina.id)
    setShowForm(true)
  }

  const handlePublicar = async (id: number) => {
    try { await paginaRepositorySupabase.publicar(id); carregar() }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao publicar') }
  }

  const handleArquivar = async (id: number) => {
    try { await paginaRepositorySupabase.arquivar(id); carregar() }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao arquivar') }
  }

  const handleExcluir = async (id: number) => {
    if (!confirm('Excluir esta página?')) return
    try { await paginaRepositorySupabase.excluir(id); carregar() }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao excluir') }
  }

  const handleAdicionarSecao = async (paginaId: number) => {
    try {
      await paginaRepositorySupabase.adicionarSecao(paginaId, secaoForm.tipo, secaoForm.titulo || undefined, secaoForm.conteudo || undefined)
      setSecaoForm({ tipo: 'hero', titulo: '', subtitulo: '', conteudo: '' })
      carregar()
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao adicionar seção') }
  }

  const handleRemoverSecao = async (secaoId: number) => {
    if (!confirm('Remover esta seção?')) return
    try { await paginaRepositorySupabase.removerSecao(secaoId); carregar() }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao remover seção') }
  }

  const handleAdicionarBloco = async () => {
    if (!blocoForm) return
    try {
      await paginaRepositorySupabase.adicionarBloco(blocoForm)
      setBlocoForm(null)
      carregar()
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao adicionar bloco') }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Páginas (CMS)</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ titulo: '', slug: '', resumo: '', conteudo: '', status: 'rascunho', ordem: 0 }) }}
          className="px-4 py-2 bg-blue-600 text-white rounded">Nova Página</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded space-y-4">
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título" className="w-full p-2 border rounded" required />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (URL)" className="w-full p-2 border rounded" required />
          <textarea value={form.resumo} onChange={(e) => setForm({ ...form, resumo: e.target.value })} placeholder="Resumo" className="w-full p-2 border rounded" rows={2} />
          <textarea value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} placeholder="Conteúdo" className="w-full p-2 border rounded" rows={6} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Pagina['status'] })} className="p-2 border rounded">
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
            <option value="arquivado">Arquivado</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingId ? 'Atualizar' : 'Criar'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {paginas.map((p) => (
          <div key={p.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{p.titulo}</h3>
                <span className="text-sm text-gray-500">/{p.slug} — {p.status}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="text-blue-600 text-sm">
                  {expandedId === p.id ? 'Fechar' : 'Seções'}
                </button>
                <button onClick={() => handleEditar(p)} className="text-blue-600 text-sm">Editar</button>
                {p.status !== 'publicado' && <button onClick={() => handlePublicar(p.id)} className="text-green-600 text-sm">Publicar</button>}
                {p.status !== 'arquivado' && <button onClick={() => handleArquivar(p.id)} className="text-yellow-600 text-sm">Arquivar</button>}
                <button onClick={() => handleExcluir(p.id)} className="text-red-600 text-sm">Excluir</button>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="mt-4 pl-4 border-l-2 border-blue-200 space-y-4">
                <div className="flex gap-2 items-end">
                  <select value={secaoForm.tipo} onChange={(e) => setSecaoForm({ ...secaoForm, tipo: e.target.value })} className="p-2 border rounded">
                    <option value="hero">Hero</option>
                    <option value="texto">Texto</option>
                    <option value="banner">Banner</option>
                    <option value="produtos">Produtos</option>
                    <option value="galeria">Galeria</option>
                    <option value="cta">CTA</option>
                  </select>
                  <input value={secaoForm.titulo} onChange={(e) => setSecaoForm({ ...secaoForm, titulo: e.target.value })} placeholder="Título da seção" className="p-2 border rounded flex-1" />
                  <button onClick={() => handleAdicionarSecao(p.id)} className="px-3 py-2 bg-green-600 text-white rounded text-sm">+ Seção</button>
                </div>

                {p.secoes?.map((secao: PaginaSecao) => (
                  <div key={secao.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{secao.tipo} — {secao.titulo ?? 'Sem título'}</span>
                      <button onClick={() => handleRemoverSecao(secao.id)} className="text-red-600 text-xs">Remover</button>
                    </div>
                    <div className="flex gap-2 items-end mb-2">
                      <select value={blocoForm?.secaoId === secao.id ? blocoForm.tipo : 'texto'}
                        onChange={(e) => setBlocoForm({ secaoId: secao.id, tipo: e.target.value as PaginaBlocoTipo, titulo: '', conteudo: '', url: '', ordem: 0, visivel: true })}
                        className="p-1 border rounded text-sm">
                        {BLOCO_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input value={blocoForm?.secaoId === secao.id ? (blocoForm.titulo ?? '') : ''}
                        onChange={(e) => setBlocoForm((prev) => prev ? { ...prev, titulo: e.target.value } : { secaoId: secao.id, tipo: 'texto' as PaginaBlocoTipo, titulo: e.target.value, ordem: 0, visivel: true })}
                        placeholder="Título do bloco" className="p-1 border rounded flex-1 text-sm" />
                      <button onClick={() => { if (!blocoForm || blocoForm.secaoId !== secao.id) setBlocoForm({ secaoId: secao.id, tipo: 'texto', titulo: '', ordem: 0, visivel: true }); handleAdicionarBloco() }}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs">+ Bloco</button>
                    </div>
                    {secao.blocos?.map((bloco: PaginaBloco) => (
                      <div key={bloco.id} className="text-sm text-gray-600 pl-2 border-l mb-1">
                        {bloco.tipo} — {bloco.titulo ?? 'Sem título'} {bloco.visivel ? '' : '(oculto)'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}