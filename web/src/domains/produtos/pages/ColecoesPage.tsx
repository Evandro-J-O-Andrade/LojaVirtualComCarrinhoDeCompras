import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Layers3, SearchX } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { ImagemEditorial } from '@/components/brand/ImagemEditorial'
import { ProdutoCard } from '../components/ProdutoCard'
import { useCategorias, useProdutos } from '../hooks/useProdutos'
import { midiaDaCategoria } from '../model/categoria-editorial'
import type { CategoriaRef, Produto } from '../model/produto'

interface Colecao {
  slug: string
  titulo: string
  chamada: string
  descricao: string
  aliases: string[]
  tipo: 'categoria' | 'kits'
}

const COLECOES: Colecao[] = [
  {
    slug: 'moda',
    titulo: 'Moda',
    chamada: 'Vista a sua própria assinatura',
    descricao: 'Peças para compor o seu estilo, do essencial ao que transforma o visual.',
    aliases: ['moda', 'roupas', 'vestuario', 'vestuário', 'vestuario feminino'],
    tipo: 'categoria',
  },
  {
    slug: 'lingerie',
    titulo: 'Lingerie',
    chamada: 'Conforto que começa em você',
    descricao: 'Uma curadoria de lingerie que valoriza conforto, caimento e personalidade.',
    aliases: ['lingerie', 'lingeries', 'roupa intima', 'roupa íntima', 'intimates'],
    tipo: 'categoria',
  },
  {
    slug: 'cama-mesa-banho',
    titulo: 'Cama, Mesa & Banho',
    chamada: 'Detalhes que fazem a casa ser sua',
    descricao: 'Têxteis e essenciais para renovar o cuidado com cada ambiente.',
    aliases: ['cama-mesa-banho', 'cama mesa banho', 'cama', 'mesa', 'banho', 'casa'],
    tipo: 'categoria',
  },
  {
    slug: 'kits-presentes',
    titulo: 'Kits & Presentes',
    chamada: 'Presentes pensados por inteiro',
    descricao: 'Composições de produtos para presentear. A vitrine só considera kits com composição cadastrada.',
    aliases: ['kit', 'kits', 'presente', 'presentes', 'kits e presentes'],
    tipo: 'kits',
  },
]

function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function categoriaCorresponde(categoria: CategoriaRef, colecao: Colecao): boolean {
  const valores = [categoria.slug, categoria.nome].map(normalizar)
  return colecao.aliases.some((alias) => {
    const alvo = normalizar(alias)
    return valores.some((valor) => valor === alvo || valor.includes(alvo) || alvo.includes(valor))
  })
}

function pertenceAcolecao(produto: Produto, colecao: Colecao, slugs: Set<string>): boolean {
  if (colecao.tipo === 'kits') {
    return produto.composicao.length > 0
  }
  return produto.categorias.some((categoria) => slugs.has(categoria.slug))
}

export function ColecoesPage() {
  const { slug } = useParams<{ slug?: string }>()
  const colecao = COLECOES.find((item) => item.slug === slug)
  const { data: categorias = [], isLoading: carregandoCategorias } = useCategorias()
  const {
    data: produtos = [],
    isLoading: carregandoProdutos,
    error,
    refetch,
  } = useProdutos()

  const categoriasDaColecao = useMemo(
    () => colecao ? categorias.filter((categoria) => categoriaCorresponde(categoria, colecao)) : [],
    [categorias, colecao],
  )
  const slugsDaColecao = useMemo(
    () => new Set(categoriasDaColecao.map((categoria) => categoria.slug)),
    [categoriasDaColecao],
  )
  const produtosDaColecao = useMemo(
    () => colecao ? produtos.filter((produto) => pertenceAcolecao(produto, colecao, slugsDaColecao)) : [],
    [colecao, produtos, slugsDaColecao],
  )
  const carregando = carregandoCategorias || carregandoProdutos

  if (!slug) {
    return (
      <div>
        <SeoHead
          title="Coleções — Angel"
          description="Explore as coleções de moda, lingerie, casa e kits da Angel."
          canonical="/colecoes"
          jsonLd={breadcrumbJsonLd([{ name: 'Início', href: '/' }, { name: 'Coleções', href: '/colecoes' }])}
        />
        <section className="section-angel">
          <div className="container-angel">
            <header className="mb-10 max-w-3xl">
              <p className="overline-angel mb-3">Universo Angel</p>
              <h1 className="title-h1">Coleções com identidade própria</h1>
              <p className="body-angel-lg mt-4">
                Cada universo tem seu espaço, sua curadoria e seus produtos. Os itens exibidos vêm do catálogo conectado.
              </p>
            </header>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {COLECOES.map((item) => {
                const categoria = categorias.find((candidate) => categoriaCorresponde(candidate, item))
                const midia = categoria ? midiaDaCategoria(categoria, produtos) : null
                return (
                  <Link
                    key={item.slug}
                    to={`/colecoes/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-champagne/70 bg-surface transition-colors hover:border-primary/50"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface-sunken">
                      <ImagemEditorial
                        src={midia?.url ?? null}
                        alt={midia?.alt ?? item.titulo}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="font-display text-2xl font-semibold">{item.titulo}</p>
                        <p className="mt-2 text-sm text-white/85">{item.chamada}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <span className="text-sm text-content-muted">{item.descricao}</span>
                      <ArrowRight size={18} className="shrink-0 text-primary" aria-hidden />
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/categorias" className="btn-angel-subtle inline-flex items-center gap-2 px-5 py-3">Todas as categorias <ArrowRight size={16} /></Link>
              <Link to="/produtos" className="btn-angel-primary inline-flex items-center gap-2 px-5 py-3">Catálogo completo <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!colecao) {
    return (
      <section className="section-angel">
        <div className="container-angel">
          <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
            <SearchX size={36} className="mb-4 text-content-subtle" aria-hidden />
            <h1 className="title-h2">Coleção não encontrada</h1>
            <p className="mt-3 max-w-md body-angel">Esta coleção não está disponível.</p>
            <Link to="/colecoes" className="btn-angel-primary mt-6 inline-flex items-center gap-2 px-5 py-3">Explorar coleções <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    )
  }

  const canonical = `/colecoes/${colecao.slug}`
  const categoriaHero = categoriasDaColecao[0]
  const midia = categoriaHero ? midiaDaCategoria(categoriaHero, produtos) : null

  return (
    <div>
      <SeoHead
        title={`${colecao.titulo} — Angel`}
        description={colecao.descricao}
        canonical={canonical}
        ogImage={midia?.url ?? undefined}
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Coleções', href: '/colecoes' },
          { name: colecao.titulo, href: canonical },
        ])}
      />
      <section className="section-angel">
        <div className="container-angel">
          <nav className="mb-7 flex items-center gap-2 text-sm text-content-subtle" aria-label="Caminho de navegação">
            <Link to="/" className="hover:text-primary">Início</Link><span>/</span>
            <Link to="/colecoes" className="hover:text-primary">Coleções</Link><span>/</span>
            <span className="text-content">{colecao.titulo}</span>
          </nav>
          <header className="mb-10 grid overflow-hidden rounded-3xl border border-champagne/60 bg-surface md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-64 bg-surface-sunken">
              <ImagemEditorial src={midia?.url ?? null} alt={midia?.alt ?? colecao.titulo} className="h-full min-h-64" />
            </div>
            <div className="flex flex-col justify-center p-7 md:p-10">
              <p className="overline-angel mb-3 text-champagne-dark">Coleção Angel</p>
              <h1 className="title-h1">{colecao.titulo}</h1>
              <h2 className="mt-3 font-display text-xl text-primary">{colecao.chamada}</h2>
              <p className="mt-4 body-angel">{colecao.descricao}</p>
              <p className="mt-5 text-sm text-content-muted">
                {carregando ? 'Carregando catálogo…' : `${produtosDaColecao.length} ${produtosDaColecao.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
              </p>
            </div>
          </header>

          {error ? (
            <ErrorState message="Não foi possível carregar os produtos desta coleção." onRetry={() => void refetch()} />
          ) : carregando ? (
            <LoadingGrid count={4} columns={4} />
          ) : produtosDaColecao.length === 0 ? (
            <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
              {colecao.tipo === 'kits' ? <Layers3 size={36} className="mb-4 text-content-subtle" aria-hidden /> : <SearchX size={36} className="mb-4 text-content-subtle" aria-hidden />}
              <h2 className="title-h2">Ainda não há produtos nesta coleção</h2>
              <p className="mt-3 max-w-xl body-angel">
                {colecao.tipo === 'kits'
                  ? 'Nenhum kit com composição cadastrada foi encontrado. Para evitar ofertas incorretas, esta página não inventa kits nem disponibilidade.'
                  : 'A coleção está preparada, mas o catálogo ainda não retornou produtos vinculados a uma categoria compatível. Cadastre ou vincule os produtos no catálogo para que apareçam aqui.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/categorias" className="btn-angel-subtle inline-flex items-center gap-2 px-5 py-3">Ver categorias <ArrowRight size={16} /></Link>
                <Link to="/produtos" className="btn-angel-primary inline-flex items-center gap-2 px-5 py-3">Ver catálogo <ArrowRight size={16} /></Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {produtosDaColecao.map((produto) => <ProdutoCard key={produto.id} produto={produto} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
