import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, PackagePlus, Search } from 'lucide-react'
import { SeoHead } from '@/lib/seo'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
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
} from '@/domains/produtos/model/produto'
import { useAdminPermissao } from '../context/AdminPermissionContext'
import { AdminEstadoDados } from '../components/AdminEstadoDados'
import {
  estadoAdminProdutos,
  useAdminCategorias,
  useAdminProdutos,
} from '../hooks/useAdminProdutos'

type FiltroStatus = 'todos' | 'ativo' | 'inativo'

/**
 * /admin/produtos — listagem
 * administrativa real.
 *
 * Busca, filtro de status e
 * categoria, imagem, nome, SKU,
 * categoria, preço, estoque e
 * status. Ações de escrita
 * (novo produto) ficam indisponíveis
 * até o RBAC — nunca CRUD fake.
 */
export function AdminProdutosPage() {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useAdminProdutos()
  const { data: categorias = [] } =
    useAdminCategorias()
  const { pode, motivo } = useAdminPermissao()

  const [busca, setBusca] = useState('')
  const [status, setStatus] =
    useState<FiltroStatus>('todos')
  const [categoriaSlug, setCategoriaSlug] =
    useState('')

  const estado = estadoAdminProdutos(data, error)

  const produtos = useMemo(() => {
    const lista = data?.produtos ?? []
    const termo = busca.trim().toLowerCase()
    return lista.filter((produto) => {
      if (
        termo &&
        !produto.nome.toLowerCase().includes(termo) &&
        !produto.sku?.toLowerCase().includes(termo)
      ) {
        return false
      }
      if (status === 'ativo' && !produto.ativo)
        return false
      if (status === 'inativo' && produto.ativo)
        return false
      if (
        categoriaSlug &&
        !produto.categorias.some(
          (categoria) => categoria.slug === categoriaSlug,
        )
      ) {
        return false
      }
      return true
    })
  }, [data, busca, status, categoriaSlug])

  return (
    <div>
      <SeoHead
        title="Produtos — Admin Angel"
        description="Listagem administrativa de produtos Angel Cosméticos."
        canonical="/admin/produtos"
        robots="noindex, nofollow"
      />

      <div className="p-4 lg:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-soft-black">
              Produtos
            </h1>
            <p className="text-sm text-content-muted">
              Catálogo completo — ativos e
              inativos.
            </p>
          </div>
          <Button
            variant="primary"
            disabled={!pode('produto.criar')}
            title={
              pode('produto.criar')
                ? undefined
                : motivo
            }
          >
            <PackagePlus size={18} aria-hidden />
            Novo produto
          </Button>
        </div>

        <AdminEstadoDados
          estado={estado}
          rotulo="produtos"
          aoTentarNovamente={() => void refetch()}
        >
          {/* Classificação de dados */}
          <p className="mb-4 rounded-xl border border-champagne bg-blush/40 px-4 py-3 text-sm text-content-muted">
            Conectado ao banco. Os dados
            presentes são de desenvolvimento
            até a classificação final
            (real/desenvolvimento/inválido).
          </p>

          {/* Busca + filtros */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-56 flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                aria-hidden
              />
              <input
                type="search"
                value={busca}
                onChange={(evento) =>
                  setBusca(evento.target.value)
                }
                placeholder="Buscar por nome ou SKU"
                aria-label="Buscar produtos"
                className="w-full rounded-lg border-2 border-champagne bg-ivory py-2 pl-10 pr-4 focus:border-deep-rose focus:outline-none"
              />
            </div>
            <select
              value={status}
              onChange={(evento) =>
                setStatus(
                  evento.target.value as FiltroStatus,
                )
              }
              aria-label="Filtrar por status"
              className="rounded-lg border-2 border-champagne bg-ivory px-3 py-2 text-sm focus:border-deep-rose focus:outline-none"
            >
              <option value="todos">
                Todos os status
              </option>
              <option value="ativo">
                Ativos
              </option>
              <option value="inativo">
                Inativos
              </option>
            </select>
            <select
              value={categoriaSlug}
              onChange={(evento) =>
                setCategoriaSlug(evento.target.value)
              }
              aria-label="Filtrar por categoria"
              className="rounded-lg border-2 border-champagne bg-ivory px-3 py-2 text-sm focus:border-deep-rose focus:outline-none"
            >
              <option value="">
                Todas as categorias
              </option>
              {categorias.map((categoria) => (
                <option
                  key={categoria.id}
                  value={categoria.slug}
                >
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <p className="py-16 text-center text-sm text-content-muted">
              Carregando produtos…
            </p>
          ) : produtos.length === 0 ? (
            <p className="py-16 text-center text-sm text-content-muted">
              {busca || status !== 'todos' || categoriaSlug
                ? 'Nenhum produto corresponde aos filtros.'
                : 'Nenhum produto no catálogo.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço base</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">
                      Detalhes
                    </span>
                  </TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {productsRows(produtos)}
              </TableBody>
            </Table>
          )}
        </AdminEstadoDados>
      </div>
    </div>
  )
}

function productsRows(produtos: Produto[]) {
  return produtos.map((produto) => (
    <TableRow key={produto.id}>
      <TableCell>
        <Link
          to={`/admin/produtos/${produto.id}`}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blush">
            <img
              src={imagemOuFallback(produto)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </span>
          <span className="font-medium text-soft-black">
            {produto.nome}
          </span>
        </Link>
      </TableCell>
      <TableCell className="text-content-muted">
        {produto.sku ?? '—'}
      </TableCell>
      <TableCell className="text-content-muted">
        {produto.categorias[0]?.nome ?? '—'}
      </TableCell>
      <TableCell>
        {formatPrice(produto.precoBase)}
      </TableCell>
      <TableCell>
        {produto.estoque === null
          ? '—'
          : produto.estoque.disponivel}
      </TableCell>
      <TableCell>
        <Badge variant={produto.ativo ? 'new' : 'default'}>
          {produto.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </TableCell>
      <TableCell>
          <Link
            to={`/admin/produtos/${produto.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-deep-rose hover:underline"
            aria-label={`Detalhes de ${produto.nome}`}
          >
          Abrir
          <ChevronRight size={16} aria-hidden />
        </Link>
      </TableCell>
    </TableRow>
  ))
}
