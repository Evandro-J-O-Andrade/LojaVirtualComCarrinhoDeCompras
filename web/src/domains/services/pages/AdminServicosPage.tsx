import { useState, useEffect, useCallback } from 'react'
import { SupabaseServiceRepository } from '../repositories/service.repository.supabase'
import type { Service } from '../model/service'
import type { ServiceInput } from '../repositories/service.repository'
import { MediaLibraryModal } from '@/components/media/MediaLibraryModal'

const repo = new SupabaseServiceRepository()

export function AdminServicosPage() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceInput>({
    nome: '', slug: '', descricao: '', duracaoMinutos: 30, preco: null,
    imagemCapa: '', video: '', publicoAlvo: '', preparacao: '',
    requerAgendamento: true, requerConfirmacao: true, ativo: true,
  })
  const [showMediaModal, setShowMediaModal] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await repo.listAllServices()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) await repo.updateService(editingId, form)
      else await repo.createService(form)
      setShowForm(false)
      setEditingId(null)
      setForm({ nome: '', slug: '', descricao: '', duracaoMinutos: 30, preco: null, imagemCapa: '', video: '', publicoAlvo: '', preparacao: '', requerAgendamento: true, requerConfirmacao: true, ativo: true })
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const handleEditar = (item: Service) => {
    setForm({
      nome: item.nome, slug: item.slug, descricao: item.descricao,
      duracaoMinutos: item.duracaoMinutos, preco: item.preco,
      imagemCapa: item.imagemCapa, video: item.video,
      publicoAlvo: item.publicoAlvo, preparacao: item.preparacao,
      requerAgendamento: item.requerAgendamento, requerConfirmacao: item.requerConfirmacao, ativo: true,
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este serviço?')) return
    try { await repo.deleteService(id); carregar() }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao excluir') }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nome: '', slug: '', descricao: '', duracaoMinutos: 30, preco: null, imagemCapa: '', video: '', publicoAlvo: '', preparacao: '', requerAgendamento: true, requerConfirmacao: true, ativo: true }) }}
          className="px-4 py-2 bg-blue-600 text-white rounded">Novo Serviço</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded space-y-4">
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome" className="w-full p-2 border rounded" required />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (URL)" className="w-full p-2 border rounded" required />
          <textarea value={form.descricao ?? ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição" className="w-full p-2 border rounded" rows={4} />
          <input type="number" value={form.duracaoMinutos ?? 0} onChange={(e) => setForm({ ...form, duracaoMinutos: Number(e.target.value) })} placeholder="Duração (min)" className="w-full p-2 border rounded" />
          <input type="number" step="0.01" value={form.preco ?? ''} onChange={(e) => setForm({ ...form, preco: e.target.value ? Number(e.target.value) : null })} placeholder="Preço" className="w-full p-2 border rounded" />
          <div className="flex gap-2 items-center">
            <input value={form.imagemCapa ?? ''} onChange={(e) => setForm({ ...form, imagemCapa: e.target.value })} placeholder="URL imagem de capa" className="flex-1 p-2 border rounded" />
            <button type="button" onClick={() => setShowMediaModal(true)} className="px-3 py-2 bg-blue-500 text-white rounded text-sm">Selecionar imagem</button>
          </div>
          {form.imagemCapa && <img src={form.imagemCapa} alt="Preview" className="h-20 rounded" />}
          <input value={form.video ?? ''} onChange={(e) => setForm({ ...form, video: e.target.value })} placeholder="URL vídeo" className="w-full p-2 border rounded" />
          <input value={form.publicoAlvo ?? ''} onChange={(e) => setForm({ ...form, publicoAlvo: e.target.value })} placeholder="Público alvo" className="w-full p-2 border rounded" />
          <textarea value={form.preparacao ?? ''} onChange={(e) => setForm({ ...form, preparacao: e.target.value })} placeholder="Preparação" className="w-full p-2 border rounded" rows={2} />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingId ? 'Atualizar' : 'Criar'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          </div>
        </form>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Nome</th>
            <th className="text-left p-2">Slug</th>
            <th className="text-left p-2">Duração</th>
            <th className="text-left p-2">Preço</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.nome}</td>
              <td className="p-2">{item.slug}</td>
              <td className="p-2">{item.duracaoMinutos} min</td>
              <td className="p-2">{item.preco !== null ? `R$ ${item.preco.toFixed(2)}` : 'Sob consulta'}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleEditar(item)} className="text-blue-600">Editar</button>
                <button onClick={() => handleExcluir(item.id)} className="text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showMediaModal && (
        <MediaLibraryModal
          open={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onSelect={(item) => {
            setForm((prev) => ({ ...prev, imagemCapa: item.url }))
            setShowMediaModal(false)
          }}
        />
      )}
    </div>
  )
}