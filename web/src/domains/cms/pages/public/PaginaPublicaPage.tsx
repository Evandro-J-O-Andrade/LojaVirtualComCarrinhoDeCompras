import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { paginaRepositorySupabase } from '../../repositories/pagina.repository.supabase'
import { supabase } from '@/lib/supabase'
import type { Pagina, PaginaSecao, PaginaBloco } from '../../model/pagina'

export function PaginaPublicaPage() {
  const { slug } = useParams<{ slug: string }>()
  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    paginaRepositorySupabase
      .buscarPorSlug(slug)
      .then((p: Pagina | null) => {
        if (!p) setError('Página não encontrada')
        else setPagina(p)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="p-8 text-center">Carregando...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!pagina) return null

  return (
    <article className="container-angel py-8">
      <h1 className="text-3xl font-bold mb-4">{pagina.titulo}</h1>
      {pagina.resumo && <p className="text-lg text-gray-600 mb-6">{pagina.resumo}</p>}
      {pagina.secoes?.map((secao: PaginaSecao) => (
        <section key={secao.id} className="mb-8">
          {secao.titulo && <h2 className="text-2xl font-semibold mb-3">{secao.titulo}</h2>}
          {secao.subtitulo && <p className="text-gray-500 mb-3">{secao.subtitulo}</p>}
          {secao.blocos?.map((bloco: PaginaBloco) => (
            <BlocoRenderer key={bloco.id} bloco={bloco} />
          ))}
        </section>
      ))}
    </article>
  )
}

function BlocoRenderer({ bloco }: { bloco: PaginaBloco }) {
  if (!bloco.visivel) return null
  switch (bloco.tipo) {
    case 'texto':
      return <div className="prose mb-4 whitespace-pre-wrap">{bloco.conteudo ?? ''}</div>
    case 'imagem':
      return bloco.url ? <img src={bloco.url} alt={bloco.titulo ?? ''} className="rounded-lg mb-4" /> : null
    case 'banner':
      return (
        <div className="relative mb-4 rounded-xl overflow-hidden">
          {bloco.url && <img src={bloco.url} alt={bloco.titulo ?? ''} className="w-full" />}
          {bloco.titulo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">{bloco.titulo}</h3>
            </div>
          )}
        </div>
      )
    case 'cta':
      return (
        <div className="mb-4 text-center">
          {bloco.titulo && <h3 className="text-xl font-semibold mb-2">{bloco.titulo}</h3>}
          {bloco.conteudo && <p className="mb-3">{bloco.conteudo}</p>}
          {bloco.url && (
            <a href={bloco.url} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg">
              {bloco.subtitulo ?? 'Saiba mais'}
            </a>
          )}
        </div>
      )
    case 'galeria':
      return (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {bloco.url && <img src={bloco.url} alt={bloco.titulo ?? ''} className="rounded-lg" />}
        </div>
      )
    case 'produtos_destaque':
      return <DynamicBlock titulo={bloco.titulo} conteudo={bloco.conteudo} fetcher="produtos" />
    case 'categorias':
      return <DynamicBlock titulo={bloco.titulo} conteudo={bloco.conteudo} fetcher="categorias" />
    case 'promocoes':
      return <DynamicBlock titulo={bloco.titulo} conteudo={bloco.conteudo} fetcher="promocoes" />
    case 'beneficios':
      return (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          {bloco.titulo && <h3 className="text-lg font-semibold mb-2">{bloco.titulo}</h3>}
          {bloco.conteudo && <p className="text-gray-600">{bloco.conteudo}</p>}
        </div>
      )
    case 'servicos':
      return <DynamicBlock titulo={bloco.titulo} conteudo={bloco.conteudo} fetcher="servicos" />
    default:
      return null
  }
}

function DynamicBlock({ titulo, conteudo, fetcher }: { titulo?: string; conteudo?: string; fetcher: string }) {
  const [items, setItems] = useState<{ id: number; nome: string; slug?: string; imagem?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let data: { id: number; nome: string; slug?: string; imagem?: string }[] = []
        if (fetcher === 'produtos') {
          const { data: d } = await supabase.from('produto').select('id, nome, slug, imagem_capa').eq('ativo', true).limit(6)
          data = (d ?? []).map((r: { id: number; nome: string; slug?: string; imagem_capa?: string }) => ({ id: r.id, nome: r.nome, slug: r.slug, imagem: r.imagem_capa }))
        } else if (fetcher === 'categorias') {
          const { data: d } = await supabase.from('produto_categoria').select('id, nome, slug').limit(8)
          data = (d ?? []).map((r: { id: number; nome: string; slug?: string }) => ({ id: r.id, nome: r.nome, slug: r.slug }))
        } else if (fetcher === 'servicos') {
          const { data: d } = await supabase.from('servico').select('id, nome, slug, imagem_capa').eq('ativo', true).limit(6)
          data = (d ?? []).map((r: { id: number; nome: string; slug?: string; imagem_capa?: string }) => ({ id: r.id, nome: r.nome, slug: r.slug, imagem: r.imagem_capa }))
        } else if (fetcher === 'promocoes') {
          const { data: d } = await supabase.from('promocao').select('id, nome, slug').limit(4)
          data = (d ?? []).map((r: { id: number; nome: string; slug?: string }) => ({ id: r.id, nome: r.nome, slug: r.slug }))
        }
        if (!cancelled) setItems(data)
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [fetcher])

  return (
    <div className="mb-6">
      {titulo && <h3 className="text-lg font-semibold mb-3">{titulo}</h3>}
      {conteudo && <p className="text-gray-600 mb-3">{conteudo}</p>}
      {loading ? (
        <div className="animate-pulse h-20 bg-gray-100 rounded" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
              {item.imagem && <img src={item.imagem} alt={item.nome} className="w-full h-32 object-cover rounded mb-2" />}
              <p className="font-medium text-sm">{item.nome}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}