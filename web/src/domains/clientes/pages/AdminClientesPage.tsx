import { useState, useEffect, useCallback } from 'react'
import { clienteRepositorySupabase } from '../repositories/cliente.repository.supabase'
import type { Cliente, ClienteInput } from '../model/cliente'

export function AdminClientesPage() {
  const [items, setItems] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ClienteInput>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  })

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await clienteRepositorySupabase.listar()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar clientes')
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
        await clienteRepositorySupabase.atualizar(editingId, form)
      } else {
        await clienteRepositorySupabase.criar(form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ nome: '', email: '', telefone: '', cpf: '' })
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const handleEditar = (item: Cliente) => {
    setForm({
      nome: item.nome,
      email: item.email ?? '',
      telefone: item.telefone ?? '',
      cpf: item.cpf ?? '',
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleExcluir = async (id: number) => {
    if (!confirm('Excluir este cliente?')) return
    try {
      await clienteRepositorySupabase.excluir(id)
      carregar()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setForm({ nome: '', email: '', telefone: '', cpf: '' })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Novo Cliente
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded space-y-4">
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" className="w-full p-2 border rounded" required />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail" className="w-full p-2 border rounded" />
          <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" className="w-full p-2 border rounded" />
          <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="CPF" className="w-full p-2 border rounded" />
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
            <th className="text-left p-2">E-mail</th>
            <th className="text-left p-2">Telefone</th>
            <th className="text-left p-2">CPF</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.nome}</td>
              <td className="p-2">{item.email}</td>
              <td className="p-2">{item.telefone}</td>
              <td className="p-2">{item.cpf}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleEditar(item)} className="text-blue-600">Editar</button>
                <button onClick={() => handleExcluir(item.id)} className="text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}