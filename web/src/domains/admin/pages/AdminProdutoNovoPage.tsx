import { useState, type FormEvent, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, PackagePlus } from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { Button } from '@/components/common/Button'
import { supabase } from '@/lib/supabase'
import { useAdminPermissao } from '../context/AdminPermissionContext'
import { criarProdutoAdmin } from '../services/adminProduto.service'

function gerarSlug(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function AdminProdutoNovoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pode, motivo } = useAdminPermissao()
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditado, setSlugEditado] = useState(false)
  const [sku, setSku] = useState('')
  const [descricao, setDescricao] = useState('')
  const [precoBase, setPrecoBase] = useState('')
  const [ativo, setAtivo] = useState(false)
  const [categoriaIds, setCategoriaIds] = useState<string[]>([])
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<Array<{ id: number; nome: string }>>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    supabase
      .from('categoria')
      .select('id,nome')
      .eq('ativo', true)
      .order('nome', { ascending: true })
      .then(({ data }) => {
        if (cancelado) return
        setCategoriasDisponiveis((data ?? []) as Array<{ id: number; nome: string }>)
      })
    return () => { cancelado = true }
  }, [])

  async function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!pode('produto.criar')) {
      setErro(motivo || 'Sua conta não tem permissão para criar produtos.')
      return
    }

    try {
      setSalvando(true)
      setErro(null)
      const id = await criarProdutoAdmin({
        nome,
        slug: slug || gerarSlug(nome),
        sku,
        descricao,
        precoBase: Number(precoBase.replace(',', '.')),
        ativo,
        categoriaIds,
      })
      await queryClient.invalidateQueries({ queryKey: ['admin-produtos'] })
      navigate(`/admin/produtos/${id}`, { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível criar o produto.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <SeoHead title="Novo produto — Admin Angel" description="Cadastro administrativo de produto." canonical="/admin/produtos/novo" robots="noindex, nofollow" />
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/produtos" aria-label="Voltar para produtos" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-champagne text-content-muted hover:border-deep-rose">
          <ArrowLeft size={18} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-soft-black">Novo produto</h1>
          <p className="text-sm text-content-muted">Cadastre os dados comerciais no catálogo da Angel.</p>
        </div>
      </div>

      <form onSubmit={submeter} className="max-w-3xl space-y-5 rounded-2xl border border-champagne bg-white p-5 lg:p-7">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-soft-black">Nome do produto
            <input required maxLength={180} value={nome} onChange={(e) => {
              const valor = e.target.value
              setNome(valor)
              if (!slugEditado) setSlug(gerarSlug(valor))
            }} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-soft-black">Slug da URL
            <input required maxLength={200} value={slug} onChange={(e) => {
              setSlug(e.target.value)
              setSlugEditado(true)
            }} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-soft-black">SKU
            <input maxLength={100} value={sku} onChange={(e) => setSku(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-soft-black">Preço base (R$)
            <input required type="number" min="0" step="0.01" value={precoBase} onChange={(e) => setPrecoBase(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-soft-black md:col-span-2">Descrição
            <textarea rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-soft-black md:col-span-2">Categorias
            <div className="mt-1 flex flex-wrap gap-3">
              {categoriasDisponiveis.map((cat) => (
                <label key={cat.id} className="inline-flex items-center gap-1.5 text-sm text-soft-black">
                  <input
                    type="checkbox"
                    checked={categoriaIds.includes(String(cat.id))}
                    onChange={(e) => {
                      setCategoriaIds((prev) =>
                        e.target.checked
                          ? [...prev, String(cat.id)]
                          : prev.filter((id) => id !== String(cat.id)),
                      )
                    }}
                  />
                  {cat.nome}
                </label>
              ))}
            </div>
          </label>
          <label className="flex items-center gap-2 text-sm text-soft-black md:col-span-2">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
            Manter ativo na vitrine após salvar
          </label>
        </div>

        {!pode('produto.criar') && <p role="status" className="text-sm text-content-muted">{motivo || 'Verificando autorização administrativa…'}</p>}
        {erro && <p role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-soft-black">{erro}</p>}
        <div className="flex flex-wrap justify-end gap-3 border-t border-champagne pt-4">
          <Link to="/admin/produtos"><Button type="button" variant="outline" disabled={salvando}>Cancelar</Button></Link>
          <Button type="submit" variant="primary" disabled={!pode('produto.criar') || salvando}>
            <PackagePlus size={17} aria-hidden />
            {salvando ? 'Salvando…' : 'Criar produto'}
          </Button>
        </div>
      </form>
    </div>
  )
}
