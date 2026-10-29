import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, RefreshCw, Tag, X } from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { Button } from '@/components/common/Button'
import { supabase } from '@/lib/supabase'
import { useAdminPermissao } from '../context/AdminPermissionContext'

interface CategoriaAdmin {
  id: number
  nome: string
  slug: string
  ativo: boolean
}

function slugificar(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function listarCategorias(): Promise<CategoriaAdmin[]> {
  const { data, error } = await supabase
    .from('categoria')
    .select('id,nome,slug,ativo')
    .order('nome', { ascending: true })
  if (error) throw new Error(`Não foi possível carregar categorias: ${error.message}`)
  return (data ?? []) as CategoriaAdmin[]
}

export function AdminCategoriasPage() {
  const queryClient = useQueryClient()
  const { pode, motivo } = useAdminPermissao()
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const categorias = useQuery({
    queryKey: ['admin-categorias-completas'],
    queryFn: listarCategorias,
    retry: false,
  })

  const salvar = useMutation({
    mutationFn: async () => {
      const nomeLimpo = nome.trim()
      const slugLimpo = (slug || slugificar(nomeLimpo)).trim()
      if (!nomeLimpo || !slugLimpo) throw new Error('Nome e slug são obrigatórios.')
      const valores = { nome: nomeLimpo, slug: slugLimpo, updated_at: new Date().toISOString() }
      const resultado = editandoId === null
        ? await supabase.from('categoria').insert({ ...valores, ativo: true }).select('id').single()
        : await supabase.from('categoria').update(valores).eq('id', editandoId).select('id').maybeSingle()
      if (resultado.error) throw new Error(`Não foi possível salvar a categoria: ${resultado.error.message}`)
      if (!resultado.data) throw new Error('Nenhuma categoria foi alterada. Verifique a permissão administrativa.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias-completas'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
      setNome('')
      setSlug('')
      setSlugManual(false)
      setEditandoId(null)
      setErro(null)
    },
    onError: (error) => setErro(error instanceof Error ? error.message : 'Erro ao salvar categoria.'),
  })

  const alternarStatus = useMutation({
    mutationFn: async (categoria: CategoriaAdmin) => {
      const { error } = await supabase.from('categoria')
        .update({ ativo: !categoria.ativo, updated_at: new Date().toISOString() })
        .eq('id', categoria.id)
      if (error) throw new Error(`Não foi possível alterar o status: ${error.message}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias-completas'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
    },
    onError: (error) => setErro(error instanceof Error ? error.message : 'Erro ao alterar status.'),
  })

  const filtradas = (categorias.data ?? []).filter((categoria) =>
    `${categoria.nome} ${categoria.slug}`.toLowerCase().includes(busca.trim().toLowerCase()),
  )

  function limparFormulario() {
    setNome('')
    setSlug('')
    setSlugManual(false)
    setEditandoId(null)
    setErro(null)
  }

  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    if (!pode('produto.editar')) {
      setErro(motivo || 'Sem permissão para administrar categorias.')
      return
    }
    salvar.mutate()
  }

  return (
    <div className="p-4 lg:p-6">
      <SeoHead title="Categorias — Admin Angel" description="Gerencie categorias do catálogo Angel." canonical="/admin/categorias" robots="noindex, nofollow" />
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blush text-deep-rose"><Tag size={22} aria-hidden /></div>
        <div>
          <h1 className="font-display text-2xl font-bold text-soft-black">Categorias</h1>
          <p className="text-sm text-content-muted">Categorias do catálogo, com persistência no Supabase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="h-fit rounded-2xl border border-champagne bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-soft-black">{editandoId === null ? 'Nova categoria' : 'Editar categoria'}</h2>
          <form onSubmit={submeter} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium text-soft-black">Nome
              <input required maxLength={120} value={nome} onChange={(e) => {
                const valor = e.target.value
                setNome(valor)
                if (!slugManual) setSlug(slugificar(valor))
              }} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
            </label>
            <label className="block space-y-1 text-sm font-medium text-soft-black">Slug
              <input required maxLength={140} value={slug} onChange={(e) => {
                setSlug(e.target.value)
                setSlugManual(true)
              }} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
            </label>
            {!pode('produto.editar') && <p className="text-xs text-content-muted">{motivo || 'Verificando permissão administrativa…'}</p>}
            {erro && <p role="alert" className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-soft-black">{erro}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="primary" disabled={!pode('produto.editar') || salvar.isPending}>
                <Check size={16} aria-hidden /> {salvar.isPending ? 'Salvando…' : editandoId === null ? 'Criar categoria' : 'Salvar alterações'}
              </Button>
              {editandoId !== null && <Button type="button" variant="outline" onClick={limparFormulario} disabled={salvar.isPending}><X size={16} aria-hidden /> Cancelar</Button>}
            </div>
          </form>
        </section>

        <section className="min-w-0 rounded-2xl border border-champagne bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-soft-black">Categorias cadastradas <span className="text-sm font-normal text-content-muted">({categorias.data?.length ?? 0})</span></h2>
            <Button type="button" variant="outline" size="sm" onClick={() => void categorias.refetch()} disabled={categorias.isFetching}><RefreshCw size={15} aria-hidden /> Atualizar</Button>
          </div>
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar categoria ou slug" aria-label="Buscar categorias" className="mb-4 w-full rounded-lg border-2 border-champagne bg-white px-3 py-2 text-sm" />
          {categorias.isLoading ? <p className="py-10 text-center text-sm text-content-muted">Carregando categorias…</p>
            : categorias.error ? <div role="alert" className="py-8 text-sm text-coral">{categorias.error.message}<Button type="button" variant="outline" size="sm" className="ml-3" onClick={() => void categorias.refetch()}>Tentar novamente</Button></div>
            : filtradas.length === 0 ? <p className="py-10 text-center text-sm text-content-muted">Nenhuma categoria encontrada.</p>
            : <div className="overflow-x-auto"><table className="w-full min-w-[460px] text-left text-sm">
                <thead className="border-b border-champagne text-xs uppercase tracking-wide text-content-muted"><tr><th className="py-3 pr-3">Categoria</th><th className="py-3 pr-3">Status</th><th className="py-3 text-right">Ações</th></tr></thead>
                <tbody className="divide-y divide-champagne">
                  {filtradas.map((categoria) => <tr key={categoria.id}>
                    <td className="py-3 pr-3"><span className="block font-medium text-soft-black">{categoria.nome}</span><span className="text-xs text-content-muted">{categoria.slug}</span></td>
                    <td className="py-3 pr-3"><span className={categoria.ativo ? 'text-emerald-700' : 'text-content-muted'}>{categoria.ativo ? 'Ativa' : 'Inativa'}</span></td>
                    <td className="py-3 text-right"><div className="inline-flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" disabled={!pode('produto.editar')} onClick={() => {
                        setEditandoId(categoria.id); setNome(categoria.nome); setSlug(categoria.slug); setSlugManual(true); setErro(null)
                      }}><Pencil size={14} aria-hidden /> Editar</Button>
                      <Button type="button" variant="outline" size="sm" disabled={!pode('produto.editar') || alternarStatus.isPending} onClick={() => alternarStatus.mutate(categoria)}>{categoria.ativo ? 'Desativar' : 'Ativar'}</Button>
                    </div></td>
                  </tr>)}
                </tbody>
              </table></div>}
        </section>
      </div>
    </div>
  )
}
