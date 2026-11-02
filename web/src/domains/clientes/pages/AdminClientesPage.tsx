import { useState, useEffect, useCallback } from 'react'
import { clienteRepositorySupabase } from '../repositories/cliente.repository.supabase'
import type { Cliente, ClienteInput, Endereco } from '../model/cliente'
import { Search, MapPin, Plus, X } from 'lucide-react'

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
    nascimento: '',
  })
  const [search, setSearch] = useState('')
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [showEnderecoForm, setShowEnderecoForm] = useState(false)
  const [enderecoForm, setEnderecoForm] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    principal: true,
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
      setForm({ nome: '', email: '', telefone: '', cpf: '', nascimento: '' })
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
      nascimento: item.nascimento ?? '',
    })
    setEditingId(item.id)
    setShowForm(true)
    setSelectedCliente(null)
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

  const abrirDetalhes = async (cliente: Cliente) => {
    setSelectedCliente(cliente)
    try {
      const end = await clienteRepositorySupabase.listarEnderecos(cliente.id)
      setEnderecos(end)
    } catch {
      setEnderecos([])
    }
  }

  const salvarEndereco = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCliente) return
    try {
      await clienteRepositorySupabase.salvarEndereco(selectedCliente.id, enderecoForm)
      setShowEnderecoForm(false)
      setEnderecoForm({ logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '', principal: true })
      const end = await clienteRepositorySupabase.listarEnderecos(selectedCliente.id)
      setEnderecos(end)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar endereço')
    }
  }

  const buscarCepAdmin = async () => {
    const cepLimpo = enderecoForm.cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await resp.json()
      if (data.erro) return
      setEnderecoForm((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
      }))
    } catch {}
  }

  const filtered = items.filter((item) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      item.nome.toLowerCase().includes(term) ||
      (item.email || '').toLowerCase().includes(term) ||
      (item.telefone || '').includes(search) ||
      (item.cpf || '').includes(search)
    )
  })

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-500">Cadastro central, endereços e histórico</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setForm({ nome: '', email: '', telefone: '', cpf: '', nascimento: '' })
            setSelectedCliente(null)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Novo Cliente
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 max-w-md">
        <Search size={18} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail, telefone ou CPF"
          className="w-full p-2 border rounded"
        />
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo *" className="w-full p-2 border rounded" required />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail" className="w-full p-2 border rounded" />
            <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone / WhatsApp" className="w-full p-2 border rounded" />
            <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="CPF" className="w-full p-2 border rounded" />
            <input type="date" value={form.nascimento} onChange={(e) => setForm({ ...form, nascimento: e.target.value })} className="w-full p-2 border rounded" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editingId ? 'Atualizar' : 'Criar'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
              {filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => abrirDetalhes(item)}>
                  <td className="p-2 font-medium">{item.nome}</td>
                  <td className="p-2">{item.email}</td>
                  <td className="p-2">{item.telefone}</td>
                  <td className="p-2">{item.cpf}</td>
                  <td className="p-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEditar(item)} className="text-blue-600">Editar</button>
                    <button onClick={() => handleExcluir(item.id)} className="text-red-600">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-4 text-center text-gray-500">Nenhum cliente encontrado</div>}
        </div>

        <div className="border rounded p-4">
          {!selectedCliente ? (
            <div className="text-gray-500 text-sm">Selecione um cliente para ver detalhes, endereços e histórico</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{selectedCliente.nome}</h2>
                  <p className="text-sm text-gray-500">{selectedCliente.email}</p>
                </div>
                <button onClick={() => setSelectedCliente(null)}><X size={18} /></button>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Telefone:</strong> {selectedCliente.telefone || '-'}</p>
                <p><strong>CPF:</strong> {selectedCliente.cpf || '-'}</p>
                <p><strong>Nascimento:</strong> {selectedCliente.nascimento || '-'}</p>
                <p><strong>Auth User ID:</strong> {selectedCliente.authUserId || '-'}</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium flex items-center gap-2"><MapPin size={16} /> Endereços</h3>
                  <button onClick={() => setShowEnderecoForm(!showEnderecoForm)} className="text-blue-600 text-sm flex items-center gap-1"><Plus size={14} /> Adicionar</button>
                </div>
                {showEnderecoForm && (
                  <form onSubmit={salvarEndereco} className="space-y-2 mb-3 p-3 bg-gray-50 rounded">
                    <div className="flex gap-2">
                      <input value={enderecoForm.cep} onChange={(e) => setEnderecoForm({ ...enderecoForm, cep: e.target.value })} placeholder="CEP" className="flex-1 p-1 border rounded text-sm" />
                      <button type="button" onClick={buscarCepAdmin} className="px-2 py-1 bg-gray-200 rounded text-sm">Buscar</button>
                    </div>
                    <input value={enderecoForm.logradouro} onChange={(e) => setEnderecoForm({ ...enderecoForm, logradouro: e.target.value })} placeholder="Logradouro" className="w-full p-1 border rounded text-sm" />
                    <div className="flex gap-2">
                      <input value={enderecoForm.numero} onChange={(e) => setEnderecoForm({ ...enderecoForm, numero: e.target.value })} placeholder="Número" className="w-1/3 p-1 border rounded text-sm" />
                      <input value={enderecoForm.complemento} onChange={(e) => setEnderecoForm({ ...enderecoForm, complemento: e.target.value })} placeholder="Compl." className="flex-1 p-1 border rounded text-sm" />
                    </div>
                    <input value={enderecoForm.bairro} onChange={(e) => setEnderecoForm({ ...enderecoForm, bairro: e.target.value })} placeholder="Bairro" className="w-full p-1 border rounded text-sm" />
                    <div className="flex gap-2">
                      <input value={enderecoForm.cidade} onChange={(e) => setEnderecoForm({ ...enderecoForm, cidade: e.target.value })} placeholder="Cidade" className="flex-1 p-1 border rounded text-sm" />
                      <input value={enderecoForm.uf} onChange={(e) => setEnderecoForm({ ...enderecoForm, uf: e.target.value.toUpperCase() })} placeholder="UF" maxLength={2} className="w-16 p-1 border rounded text-sm" />
                    </div>
                    <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded text-sm">Salvar endereço</button>
                  </form>
                )}
                {enderecos.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum endereço cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {enderecos.map((end) => (
                      <div key={end.id} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">{end.logradouro}, {end.numero} {end.complemento && `- ${end.complemento}`}</p>
                        <p>{end.bairro} - {end.cidade}/{end.uf}</p>
                        <p>CEP: {end.cep} {end.principal && <span className="text-blue-600">(Principal)</span>}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}