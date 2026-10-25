import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Image as ImageIcon } from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { ACERVO_CATEGORIAS, ACERVO_IMAGENS, type AcervoCategoria } from '../model/acervo-visual'

export function AcervoVisualPage() {
  const [categoria, setCategoria] = useState<AcervoCategoria | 'todas'>('todas')
  const [busca, setBusca] = useState('')
  const imagens = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return ACERVO_IMAGENS.filter((imagem) => {
      const correspondeCategoria = categoria === 'todas' || imagem.categoria === categoria
      const correspondeBusca = !termo || imagem.arquivo.toLocaleLowerCase('pt-BR').includes(termo) || imagem.titulo.toLocaleLowerCase('pt-BR').includes(termo)
      return correspondeCategoria && correspondeBusca
    })
  }, [categoria, busca])

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
          <p className="mt-3 text-body-lg text-content-muted">As imagens do lote foram organizadas por finalidade visual. Esta galeria não substitui o cadastro comercial: a associação de uma imagem a um produto só será feita quando for confirmada no catálogo.</p>
          <p className="mt-3 text-sm text-content-subtle">{ACERVO_IMAGENS.length} arquivos inventariados · {imagens.length} exibidos</p>
        </header>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Buscar imagens por nome</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome do arquivo…" className="field-angel pl-10" />
          </label>
        </div>
        <div className="mb-8 flex flex-wrap gap-2" aria-label="Filtrar por categoria">
          {ACERVO_CATEGORIAS.map((item) => {
            const count = item.id === 'todas' ? ACERVO_IMAGENS.length : ACERVO_IMAGENS.filter((imagem) => imagem.categoria === item.id).length
            const ativo = categoria === item.id
            return <button key={item.id} type="button" onClick={() => setCategoria(item.id)} aria-pressed={ativo} className={ativo ? 'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast' : 'rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-content hover:border-primary'}>{item.label} <span className="ml-1 opacity-75">{count}</span></button>
          })}
        </div>

        {imagens.length === 0 ? (
          <div className="surface-card px-6 py-16 text-center">
            <ImageIcon size={28} className="mx-auto text-content-subtle" aria-hidden="true" />
            <h2 className="mt-4 title-h3">Nenhuma imagem encontrada</h2>
            <p className="mt-2 text-body text-content-muted">Altere a busca ou escolha outra categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {imagens.map((imagem) => (
              <article key={imagem.arquivo} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-alt p-3">
                  <img src={imagem.src} alt={imagem.titulo} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-content">{imagem.titulo}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-content-subtle">{imagem.categoria}</p>
                  <p className="mt-2 break-all text-[11px] text-content-subtle">{imagem.arquivo}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
