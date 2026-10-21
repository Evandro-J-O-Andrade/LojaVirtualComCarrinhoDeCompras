import { useCallback, useState } from 'react'
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
}

function DetalheContent({
  produto,
  podeEditar,
  motivoPermissao,
}: DetalheContentProps) {
  const promocaoAtiva = produto.promocoes.find(
    (promocao) => promocao.ativo,
  )
  const [carregandoUpload, setCarregandoUpload] =
    useState(false)
  const [erroUpload, setErroUpload] = useState<string | null>(null)

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
      } catch (err) {
        setErroUpload(
          err instanceof Error
            ? err.message
            : 'Erro inesperado ao enviar imagens.',
        )
        throw err
      }
    },
    [produto.id, podeEditar],
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
    },
    [produto.id, podeEditar],
  )

  const handleTogglePrincipal = useCallback(
    async (imagemId: string) => {
      if (!podeEditar) return
      const produtoIdNum = Number(produto.id)
      await produtoImagemService.definirPrincipalUnica(
        produtoIdNum,
        Number(imagemId),
      )
    },
    [produto.id, podeEditar],
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
            disabled={!podeEditar}
            title={podeEditar ? undefined : motivoPermissao}
          >
            <Pencil size={16} aria-hidden />
            Editar
          </Button>
        </div>

        <p className="mb-6 rounded-xl border border-champagne bg-blush/40 px-4 py-3 text-sm text-content-muted">
          Dados de desenvolvimento: classificação
          real/desenvolvimento/inválido pendente. Não
          trate esta ficha como produção.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Dados principais */}
          <Card className="lg:col-span-2">
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
          </Card>

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
                  <tr>
                    <TableHead>SKU</TableHead>
                    <TableHead>Atributos</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
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
