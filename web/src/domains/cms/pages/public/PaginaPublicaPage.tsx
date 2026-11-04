import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { paginaRepositorySupabase } from '../../repositories/pagina.repository.supabase'
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
      return <div className="prose mb-4" dangerouslySetInnerHTML={{ __html: bloco.conteudo ?? '' }} />
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
    case 'html':
      return <div className="mb-4" dangerouslySetInnerHTML={{ __html: bloco.conteudo ?? '' }} />
    case 'galeria':
      return (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {bloco.url && <img src={bloco.url} alt={bloco.titulo ?? ''} className="rounded-lg" />}
        </div>
      )
    case 'produtos_destaque':
    case 'categorias':
    case 'promocoes':
    case 'beneficios':
    case 'servicos':
      return (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          {bloco.titulo && <h3 className="text-lg font-semibold mb-2">{bloco.titulo}</h3>}
          {bloco.conteudo && <p className="text-gray-600">{bloco.conteudo}</p>}
        </div>
      )
    default:
      return null
  }
}