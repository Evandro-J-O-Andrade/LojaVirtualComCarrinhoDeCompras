import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  Image as ImageIcon,
  Package,
  Pencil,
  Tag,
  Truck,
} from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/dashboard/Card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/dashboard/Table'
import { formatPrice } from '@/lib/utils'
import {
  imagemOuFallback,
  type Produto,
  type Promocao,
} from '@/domains/produtos/model/produto'
import { ProdutoImagemUpload } from '../components/ProdutoImagemUpload'
import { produtoImagemService } from '@/domains/produtos/services/produtoImagem.service'
import { atualizarProdutoAdmin } from '../services/adminProduto.service'
import { useAdminPermissao } from '../context/AdminPermissionContext'
import {
  estadoAdminProdutos,
  useAdminProdutos,
} from '../hooks/useAdminProdutos'

const PROMOCAO_TIPO_ROTULO: Record<
  Promocao['tipo'],
  string
> = {
  percentual: 'Desconto',
  fixo: 'Redução',
}

/**
 * /admin/produtos/:id — detalhe
 * administrativo real.
 *
 * Dados principais, variantes,
 * mídia, preço, promoção, composição
 * e status — tudo do banco. Edição
 * fica indisponível até o RBAC.
 * Dados de desenvolvimento são
 * rotulados como tais.
 */
export function AdminProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useAdminProdutos()
  const { pode, motivo } = useAdminPermissao()

  const estado = estadoAdminProdutos(data, error)

  const produto = (data?.produtos ?? []).find(
    (item) => item.id === id,
  )

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <p className="py-16 text-center text-sm text-content-muted">
          Carregando produto…
        </p>
      </div>
    )
  }

  if (error || estado === 'erro') {
    return (
      <div className="p-4 lg:p-6">
        <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
          <h1 className="title-h2">
            Não foi possível carregar o produto
          </h1>
          <p className="mt-3 max-w-md text-body text-content-muted">
            Ocorreu um erro ao buscar o
            produto.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => void refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (estado === 'nao-integrado') {
    return (
      <div className="p-4 lg:p-6">
        <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
          <Database />
          <h1 className="title-h2">
            Produto disponível após integração
          </h1>
          <p className="mt-3 max-w-md text-body text-content-muted">
            A ficha do produto lê o banco
            em produção. A integração entra
            com a Etapa 8.
          </p>
        </div>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="p-4 lg:p-6">
        <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
          <h1 className="title-h2">
            Produto não encontrado
          </h1>
          <p className="mt-3 max-w-md text-body text-content-muted">
            Este produto não existe no
            catálogo.
          </p>
          <Link to="/admin/produtos">
            <Button variant="outline" className="mt-6">
              <ArrowLeft size={16} aria-hidden />
              Voltar para produtos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DetalheContent
      produto={produto}
      podeEditar={pode('produto.editar')}
      motivoPermissao={motivo}
      aoAtualizar={async () => { await refetch() }}
    />
  )
}

function Database() {
  return (
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-champagne-light">
      <Package size={30} className="text-primary" aria-hidden />
    </div>
  )
}

interface DetalheContentProps {
  produto: Produto
  podeEditar: boolean
  motivoPermissao: string
  aoAtualizar: () => Promise<void>
}

function DetalheContent({
  produto,
  podeEditar,
  motivoPermissao,
  aoAtualizar,
}: DetalheContentProps) {
  const promocaoAtiva = produto.promocoes.find(
    (promocao) => promocao.ativo,
  )
  const [carregandoUpload, setCarregandoUpload] =
    useState(false)
  const [erroUpload, setErroUpload] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)
  const [sucessoSalvar, setSucessoSalvar] = useState(false)
  const [nome, setNome] = useState(produto.nome)
  const [slug, setSlug] = useState(produto.slug)
  const [sku, setSku] = useState(produto.sku ?? '')
  const [descricao, setDescricao] = useState(produto.descricao ?? '')
  const [precoBase, setPrecoBase] = useState(String(produto.precoBase))
  const [ativo, setAtivo] = useState(produto.ativo)

  useEffect(() => {
    setNome(produto.nome)
    setSlug(produto.slug)
    setSku(produto.sku ?? '')
    setDescricao(produto.descricao ?? '')
    setPrecoBase(String(produto.precoBase))
    setAtivo(produto.ativo)
  }, [produto])

  const cancelarEdicao = useCallback(() => {
    setNome(produto.nome)
    setSlug(produto.slug)
    setSku(produto.sku ?? '')
    setDescricao(produto.descricao ?? '')
    setPrecoBase(String(produto.precoBase))
    setAtivo(produto.ativo)
    setErroSalvar(null)
    setEditando(false)
  }, [produto])

  const handleSalvarProduto = useCallback(async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!podeEditar) return
    const preco = Number(precoBase.replace(',', '.'))
    try {
      setSalvando(true)
      setErroSalvar(null)
      setSucessoSalvar(false)
      await atualizarProdutoAdmin(Number(produto.id), {
        nome, slug, sku, descricao, precoBase: preco, ativo,
      })
      await aoAtualizar()
      setEditando(false)
      setSucessoSalvar(true)
    } catch (err) {
      setErroSalvar(err instanceof Error ? err.message : 'Não foi possível salvar o produto.')
    } finally {
      setSalvando(false)
    }
  }, [aoAtualizar, ativo, descricao, nome, podeEditar, precoBase, produto.id, sku, slug])

  const handleEnviarImagens = useCallback(
    async (arquivos: File[]) => {
      if (!podeEditar) return
      const produtoIdNum = Number(produto.id)
      try {
        setCarregandoUpload(true)
        setErroUpload(null)
        await produtoImagemService.uploadMultiplo(
          produtoIdNum,
          arquivos,
        )
        await aoAtualizar()
      } catch (err) {
        setErroUpload(
          err instanceof Error
            ? err.message
            : 'Erro inesperado ao enviar imagens.',
        )
        throw err
      }
    },
    [aoAtualizar, produto.id, podeEditar],
  )

  const handleRemover = useCallback(
    async (imagemId: string, url: string) => {
      if (!podeEditar) return
      const produtoIdNum = Number(produto.id)
      await produtoImagemService.removerImagem(
        produtoIdNum,
        Number(imagemId),
        url,
      )
      await aoAtualizar()
    },
    [aoAtualizar, produto.id, podeEditar],
  )

  const handleTogglePrincipal = useCallback(
    async (imagemId: string) => {
      if (!podeEditar) return
      const produtoIdNum = Number(produto.id)
      await produtoImagemService.definirPrincipalUnica(
        produtoIdNum,
        Number(imagemId),
      )
      await aoAtualizar()
    },
    [aoAtualizar, produto.id, podeEditar],
  )

  return (
    <div>
      <SeoHead
        title={`${produto.nome} — Admin Angel`}
        description={`Ficha administrativa de ${produto.nome}.`}
        canonical={`/admin/produtos/${produto.id}`}
        robots="noindex, nofollow"
      />

      <div className="p-4 lg:p-6">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/produtos"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-champagne text-content-muted transition-colors hover:border-deep-rose"
              aria-label="Voltar para produtos"
            >
              <ArrowLeft size={18} aria-hidden />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-soft-black">
                {produto.nome}
              </h1>
              <p className="text-sm text-content-muted">
                SKU {produto.sku ?? '—'} ·{' '}
                {produto.ativo ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <Badge variant={produto.ativo ? 'new' : 'default'}>
              {produto.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <Button
            variant="outline"
            disabled={!podeEditar || salvando}
            title={podeEditar ? undefined : motivoPermissao}
            onClick={() => {
              setErroSalvar(null)
              setSucessoSalvar(false)
              if (editando) cancelarEdicao()
              else setEditando(true)
            }}
          >
            <Pencil size={16} aria-hidden />
            {editando ? 'Cancelar edição' : 'Editar produto'}
          </Button>
        </div>

        <p className="mb-6 rounded-xl border border-champagne bg-blush/40 px-4 py-3 text-sm text-content-muted">
          Dados de desenvolvimento: classificação
          real/desenvolvimento/inválido pendente. Não
          trate esta ficha como produção.
        </p>

        {sucessoSalvar && (
          <p role="status" className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Produto salvo com sucesso.</p>
        )}
        {editando && (
          <Card className="mb-6">
            <h2 className="mb-4 font-display text-lg font-bold text-soft-black">Editar dados do produto</h2>
            <form onSubmit={handleSalvarProduto} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-soft-black">Nome
                <input required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
              </label>
              <label className="space-y-1 text-sm font-medium text-soft-black">Slug
                <input required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
              </label>
              <label className="space-y-1 text-sm font-medium text-soft-black">SKU
                <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
              </label>
              <label className="space-y-1 text-sm font-medium text-soft-black">Preço base (R$)
                <input required type="number" min="0" step="0.01" value={precoBase} onChange={(e) => setPrecoBase(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
              </label>
              <label className="space-y-1 text-sm font-medium text-soft-black md:col-span-2">Descrição
                <textarea rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-lg border-2 border-champagne bg-white px-3 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm text-soft-black md:col-span-2">
                <input type="checkbox" checked={ativo} disabled={!ativo && produto.imagens.length === 0} onChange={(e) => setAtivo(e.target.checked)} />
                Produto ativo e disponível para a vitrine
              </label>
              {produto.imagens.length === 0 && <p className="text-xs text-content-muted md:col-span-2">Adicione ao menos uma imagem antes de publicar este produto na vitrine.</p>}
              {erroSalvar && <p role="alert" className="text-sm text-coral md:col-span-2">{erroSalvar}</p>}
              <div className="flex justify-end gap-3 md:col-span-2">
                <Button type="button" variant="outline" disabled={salvando} onClick={cancelarEdicao}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={salvando || !podeEditar}>{salvando ? 'Salvando…' : 'Salvar alterações'}</Button>
              </div>
            </form>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Dados principais */}
          {!editando && <Card className="lg:col-span-2">
            <h2 className="font-display mb-4 text-lg font-bold text-soft-black">
              Dados principais
            </h2>
            <dl className="space-y-4 text-sm">
              <Linha rotulo="Nome" valor={produto.nome} />
              <Linha rotulo="Slug" valor={produto.slug} />
              <Linha
                rotulo="SKU"
                valor={produto.sku ?? 'Não informado'}
              />
              <Linha
                rotulo="Fornecedor"
                valor={
                  produto.fornecedor?.nome ??
                  'Não informado'
                }
              />
              <Linha
                rotulo="Categorias"
                valor={
                  produto.categorias.length > 0
                    ? produto.categorias
                        .map((categoria) => categoria.nome)
                        .join(', ')
                    : 'Não informado'
                }
              />
              <div>
                <dt className="mb-1 text-content-muted">
                  Descrição
                </dt>
                <dd className="text-soft-black">
                  {produto.descricao ??
                    'Não informada'}
                </dd>
              </div>
            </dl>
          </Card>}

          {/* Mídia */}
          <Card>
            <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-soft-black">
              <ImageIcon size={18} aria-hidden />
              Mídia
            </h2>
            <div className="mb-4 overflow-hidden rounded-xl border border-champagne">
              <img
                src={imagemOuFallback(produto)}
                alt=""
                className="aspect-square w-full object-cover"
              />
            </div>
            <ProdutoImagemUpload
              produtoId={produto.id}
              imagensExistentes={produto.imagens}
              podeEditar={podeEditar}
              motivoPermissao={motivoPermissao}
              carregando={carregandoUpload}
              aoEnviar={handleEnviarImagens}
              aoRemover={handleRemover}
              aoTogglePrincipal={handleTogglePrincipal}
              aoSetCarregando={setCarregandoUpload}
            />
            {erroUpload && (
              <div className="mt-3 flex items-center gap-2 text-sm text-coral">
                <span>{erroUpload}</span>
              </div>
            )}
          </Card>

          {/* Preço e promoção */}
          <Card>
            <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-soft-black">
              <Tag size={18} aria-hidden />
              Preço e promoção
            </h2>
            <dl className="space-y-4 text-sm">
              <Linha
                rotulo="Preço base"
                valor={formatPrice(produto.precoBase)}
              />
              <Linha
                rotulo="Promoção ativa"
                valor={
                  promocaoAtiva
                    ? `${PROMOCAO_TIPO_ROTULO[promocaoAtiva.tipo]} de ${promocaoAtiva.valor}${promocaoAtiva.tipo === 'percentual' ? '%' : ''} até ${formatData(promocaoAtiva.dataFim)}`
                    : 'Nenhuma'
                }
              />
            </dl>
            {produto.promocoes.length > 0 && (
              <PromocoesLista
                promocoes={produto.promocoes}
              />
            )}
          </Card>

          {/* Estoque */}
          <Card>
            <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-soft-black">
              <Truck size={18} aria-hidden />
              Estoque
            </h2>
            {produto.estoque ? (
              <Linha
                rotulo="Disponível"
                valor={String(produto.estoque.disponivel)}
              />
            ) : (
              <p className="text-sm text-content-muted">
                Controle de estoque não
                cadastrado para este produto.
              </p>
            )}
          </Card>

          {/* Variantes */}
          <Card className="lg:col-span-2">
            <h2 className="font-display mb-4 text-lg font-bold text-soft-black">
              Variantes
            </h2>
            {produto.variantes.length === 0 ? (
              <p className="text-sm text-content-muted">
                Produto sem variantes.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead>SKU</TableHead>
                  <TableHead>Atributos</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Status</TableHead>
                </TableHeader>
                <TableBody>
                  {produto.variantes.map((variante) => (
                    <TableRow key={variante.id}>
                      <TableCell className="font-medium text-soft-black">
                        {variante.sku}
                      </TableCell>
                      <TableCell className="text-content-muted">
                        {variante.atributos.length > 0
                          ? variante.atributos
                              .map(
                                (atributo) =>
                                  `${atributo.valor}`,
                              )
                              .join(' · ')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {formatPrice(variante.preco)}
                      </TableCell>
                      <TableCell className="text-content-muted">
                        {variante.peso === null
                          ? '—'
                          : `${variante.peso} g`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            variante.ativo
                              ? 'new'
                              : 'default'
                          }
                        >
                          {variante.ativo
                            ? 'Ativa'
                            : 'Inativa'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Composição */}
          <Card>
            <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-soft-black">
              <CalendarClock size={18} aria-hidden />
              Composição
            </h2>
            {produto.composicao.length === 0 ? (
              <p className="text-sm text-content-muted">
                Composição não cadastrada.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-content-muted">
                {produto.composicao.map((item) => (
                  <li key={item.id}>
                    {item.nome}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Linha({
  rotulo,
  valor,
}: {
  rotulo: string
  valor: string
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <dt className="text-content-muted">{rotulo}</dt>
      <dd className="font-medium text-soft-black">
        {valor}
      </dd>
    </div>
  )
}

function PromocoesLista({
  promocoes,
}: {
  promocoes: Promocao[]
}) {
  return (
    <ul className="mt-4 space-y-2 border-t border-champagne pt-4 text-sm text-content-muted">
      {promocoes.map((promocao) => (
        <li key={promocao.id}>
          {PROMOCAO_TIPO_ROTULO[promocao.tipo]} de{' '}
          {promocao.valor}
          {promocao.tipo === 'percentual' ? '%' : ''} ·{' '}
          {formatData(promocao.dataInicio)} a{' '}
          {formatData(promocao.dataFim)} ·{' '}
          {promocao.ativo ? 'ativa' : 'inativa'}
        </li>
      ))}
    </ul>
  )
}

function formatData(iso: string): string {
  const data = new Date(iso)
  return Number.isNaN(data.getTime())
    ? iso
    : data.toLocaleDateString('pt-BR')
}
