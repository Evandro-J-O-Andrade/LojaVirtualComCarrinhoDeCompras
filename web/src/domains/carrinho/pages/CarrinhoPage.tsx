import { Link } from 'react-router-dom'
import { ArrowRight, Package, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/dashboard/Card'
import { QuantitySelector } from '@/components/commerce/QuantitySelector'
import { useCarrinho } from '@/domains/carrinho/context/CarrinhoProvider'
import { ProdutoImagem } from '@/domains/produtos/components/ProdutoImagem'
import { formatDateBR } from '@/domains/produtos/model/produto'
import {
  formatPrice,
} from '@/lib/utils'
import {
  contagem,
  rotuloDisponibilidadeCarrinho,
  subtotalBase,
  subtotalOfertado,
  valorPromocao,
  type CarrinhoItem,
} from '@/domains/carrinho/model/carrinho'

function chave(item: CarrinhoItem): string {
  return `${item.produto.id}-${item.varianteId ?? ''}`
}

export function CarrinhoPage() {
  const { itens, atualizarQuantidade, remover, limpar } = useCarrinho()

  if (itens.length === 0) {
    return (
      <div className="py-20">
        <div className="container-angel text-center">
          <div className="w-24 h-24 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-rose" />
          </div>
          <h1 className="font-display font-bold text-2xl text-soft-black mb-4">
            Seu carrinho está vazio
          </h1>
          <p className="text-warm-gray mb-6">
            Adicione produtos para continuar comprando
          </p>
          <Button variant="primary" size="lg">
            <Link to="/produtos">Ver produtos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const base = subtotalBase(itens)
  const promocao = valorPromocao(itens)
  const ofertado = subtotalOfertado(itens)

  return (
    <div className="py-8">
      <div className="container-angel">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl text-soft-black">
            Meu Carrinho
          </h1>
          <Button variant="ghost" size="sm" onClick={limpar}>
            <Trash2 size={16} /> Limpar carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {itens.map((item) => (
              <Card key={chave(item)} className="p-4">
                <div className="flex gap-4">
                  <Link
                    to={`/produtos/${item.produto.slug}`}
                    className="w-20 h-20 rounded-lg bg-blush flex items-center justify-center flex-shrink-0 overflow-hidden"
                  >
                    <ProdutoImagem
                      src={item.produto.imagem}
                      alt={item.produto.nome}
                      imgClassName="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/produtos/${item.produto.slug}`}
                          className="font-medium text-soft-black hover:text-primary transition-colors"
                        >
                          {item.produto.nome}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.varianteSku && (
                            <span className="text-xs text-content-subtle">
                              SKU: {item.varianteSku}
                            </span>
                          )}
                          <span
                            className={
                              'text-xs font-medium ' +
                              (item.disponibilidade === 'em_estoque'
                                ? 'text-primary'
                                : item.disponibilidade === 'sem_estoque'
                                  ? 'text-coral'
                                  : 'text-content-muted')
                            }
                          >
                            {rotuloDisponibilidadeCarrinho(
                              item.disponibilidade,
                            )}
                          </span>
                          {item.composto && (
                            <span className="text-xs font-medium bg-blush text-deep-rose rounded-full px-2 py-0.5">
                              Kit
                            </span>
                          )}
                        </div>
                        {item.atributosTexto && (
                          <p className="text-xs text-content-subtle mt-1">
                            {item.atributosTexto}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          remover(item.produto.id, item.varianteId)
                        }
                        className="text-content-subtle hover:text-coral transition-colors p-1"
                        aria-label={`Remover ${item.produto.nome}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-champagne pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-content-muted">
                          Quantidade
                        </span>
                        <QuantitySelector
                          value={item.quantidade}
                          onChange={(quantidade) =>
                            atualizarQuantidade(
                              item.produto.id,
                              item.varianteId,
                              quantidade,
                            )
                          }
                          min={1}
                          size="sm"
                        />
                      </div>
                      <div className="text-right">
                        {item.promocao && (
                          <p className="text-xs text-coral font-medium">
                            {item.promocao.rotulo} · até{' '}
                            {formatDateBR(item.promocao.dataFim)}
                          </p>
                        )}
                        <p className="text-sm text-content-subtle">
                          {formatPrice(item.precoUnitario)} cada
                        </p>
                        <p className="font-display font-bold text-lg text-primary">
                          {formatPrice(
                            item.precoUnitario * item.quantidade,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">
                Resumo
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-content-muted">
                    Subtotal ({contagem(itens)} itens)
                  </dt>
                  <dd className="font-medium">
                    {formatPrice(base)}
                  </dd>
                </div>
                {promocao > 0 && (
                  <div className="flex justify-between text-coral">
                    <dt className="text-content-muted">
                      Promoções vigentes
                    </dt>
                    <dd className="font-medium">
                      −{formatPrice(promocao)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-content-muted">Frete</dt>
                  <dd className="font-medium text-content-subtle">
                    Calculado no checkout
                  </dd>
                </div>
                <div className="border-t border-champagne pt-3 flex justify-between items-baseline">
                  <dt className="font-display font-bold text-lg">
                    Total
                  </dt>
                  <dd className="font-display font-bold text-2xl text-primary">
                    {formatPrice(ofertado)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-content-subtle leading-relaxed">
                Valores informativos: o servidor revalida preço,
                promoção e estoque antes de confirmar o pedido.
              </p>
            </Card>

            <Button variant="primary" size="lg" className="w-full">
              <Link
                to="/checkout"
                className="flex items-center gap-2"
              >
                Finalizar compra <ArrowRight size={18} />
              </Link>
            </Button>

            <Button variant="ghost" size="lg" className="w-full">
              <Link
                to="/produtos"
                className="flex items-center gap-2"
              >
                <Package size={18} /> Continuar comprando
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
