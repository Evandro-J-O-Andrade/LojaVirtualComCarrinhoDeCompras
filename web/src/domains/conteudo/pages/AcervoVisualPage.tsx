import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Image as ImageIcon } from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { supabase } from '@/lib/supabase'

interface ImagemAcervo {
  id: number
  url: string
  produtoId: number | null
  principal: boolean
}

export function AcervoVisualPage() {
  const [imagens, setImagens] = useState<ImagemAcervo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    let cancelado = false
    supabase
      .from('produto_imagem')
      .select('id, url, produto_id, principal')
      .order('id', { ascending: false })
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) {
          setErro('Não foi possível carregar o acervo.')
          setCarregando(false)
          return
        }
        setImagens(
          (data ?? []).map((row: { id: number; url: string; produto_id: number | null; principal: boolean }) => ({
            id: row.id,
            url: row.url,
            produtoId: row.produto_id,
            principal: row.principal,
          })),
        )
        setCarregando(false)
      })
    return () => { cancelado = true }
  }, [])

  const imagensFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    if (!termo) return imagens
    return imagens.filter((img) => img.url.toLocaleLowerCase('pt-BR').includes(termo))
  }, [imagens, busca])

  return (
    <main className="section-angel min-h-[60vh]">
      <SeoHead title="Acervo visual | Angel Cosméticos" description="Explore o acervo visual de beleza, campanhas e imagens editoriais da Angel Cosméticos." />
      <div className="container-angel">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar à loja
        </Link>
        <header className="mb-8 max-w-3xl">
          <p className="overline-angel mb-2">Patrimônio visual</p>
          <h1 className="title-h1">Acervo visual Angel</h1>
          <p className="mt-3 text-body-lg text-content-muted">Imagens vinculadas ao catálogo comercial do Supabase. A associação de uma imagem a um produto é feita na ficha do produto.</p>
          <p className="mt-3 text-sm text-content-subtle">{imagens.length} imagens no acervo · {imagensFiltradas.length} exibidas</p>
        </header>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Buscar imagens por nome</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por URL…" className="field-angel pl-10" />
          </label>
        </div>

        {carregando ? (
          <div className="surface-card px-6 py-16 text-center">
            <p className="text-body text-content-muted">Carregando acervo…</p>
          </div>
        ) : erro ? (
          <div className="surface-card px-6 py-16 text-center">
            <p className="text-body text-coral">{erro}</p>
          </div>
        ) : imagensFiltradas.length === 0 ? (
          <div className="surface-card px-6 py-16 text-center">
            <ImageIcon size={28} className="mx-auto text-content-subtle" aria-hidden="true" />
            <h2 className="mt-4 title-h3">Nenhuma imagem encontrada</h2>
            <p className="mt-2 text-body text-content-muted">Altere a busca ou associe imagens a produtos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {imagensFiltradas.map((imagem) => (
              <article key={imagem.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-alt p-3">
                  <img src={imagem.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-content-subtle">
                    {imagem.principal ? 'Principal' : 'Galeria'}
                    {imagem.produtoId ? ` · Produto ${imagem.produtoId}` : ' · Sem produto'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}