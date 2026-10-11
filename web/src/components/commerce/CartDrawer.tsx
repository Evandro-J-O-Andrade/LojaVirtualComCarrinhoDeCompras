import React from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useCarrinho } from '@/domains/carrinho/context/CarrinhoProvider'
import { ProdutoImagem } from '@/domains/produtos/components/ProdutoImagem'
import {
  subtotalBase,
  valorPromocao,
  type CarrinhoItem,
} from '@/domains/carrinho/model/carrinho'
import { formatPrice } from '@/lib/utils'

function chave(item: CarrinhoItem): string {
  return `${item.produto.id}-${item.varianteId ?? ''}`
}

/**
 * Carrinho lateral: drawer de verdade — abertura
 * animada pela lateral, overlay com fechamento,
 * Esc, trava de scroll, foco gerenciado e
 * totais recalculados na hora.
 */
export function CartDrawer() {
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    itens,
    subtotal,
    contagem,
    remover,
    atualizarQuantidade,
  } = useCarrinho()

  const closeRef = React.useRef<HTMLButtonElement>(null)
  const restoreRef = React.useRef<Element | null>(null)

  // Cadeia de preços idêntica à de /carrinho e ao
  // checkout: base → promoção → total. Nenhum
  // número diverge entre telas.
  const base = subtotalBase(itens)
  const desconto = valorPromocao(itens)

  // Esc fecha, scroll trava e o foco volta ao
  // gatilho ao fechar.
  React.useEffect(() => {
    if (!isOpen) return

    restoreRef.current = document.activeElement
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const aoTeclado = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', aoTeclado)

    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', aoTeclado)
      const alvo = restoreRef.current
      if (alvo instanceof HTMLElement) alvo.focus()
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-blush transition-colors"
        aria-label="Abrir carrinho"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <ShoppingBag size={22} className="text-soft-black" />
        {contagem > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-5 h-5 bg-deep-rose text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {contagem}
          </span>
        )}
        <span className="sr-only">
          {contagem > 0
            ? `— ${contagem} ${contagem === 1 ? 'item' : 'itens'}`
            : '— vazio'}
        </span>
      </button>

      {isOpen &&
        (typeof document !== 'undefined'
          ? createPortal(
              <>
                <div
                  className="fixed inset-0 z-overlay animate-fade-in bg-soft-black/40 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Carrinho de compras"
                  className="fixed right-0 inset-y-0 z-modal w-full max-w-md animate-slide-in-right bg-ivory shadow-2xl flex flex-col safe-bottom"
                >
            <div className="flex items-center justify-between p-4 border-b border-champagne">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <ShoppingBag size={20} />
                Seu Carrinho
              </h2>
              <button
                ref={closeRef}
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-blush transition-colors"
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {itens.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-blush flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-deep-rose" />
                  </div>
                  <p className="font-display font-medium text-lg mb-2">
                    Seu carrinho está vazio
                  </p>
                  <p className="text-warm-gray text-sm mb-6">
                    Descubra nossos produtos e comece a comprar
                  </p>
                  <Button variant="ghost" onClick={() => setIsOpen(false)}>
                    Ver produtos
                    <ArrowRight size={16} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itens.map((item) => (
                    <div key={chave(item)} className="flex gap-3 bg-white rounded-xl p-3">
                      <Link to={`/produtos/${item.produto.slug}`} className="w-16 h-16 rounded-lg bg-blush flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <ProdutoImagem
                          src={item.produto.imagem}
                          alt={item.produto.nome}
                          imgClassName="h-full w-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.produto.nome}</h4>
                        {item.varianteSku && (
                          <p className="text-xs text-content-subtle">
                            SKU: {item.varianteSku}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2 mt-1">
                          <p className="text-deep-rose font-semibold text-sm">
                            {formatPrice(
                              item.precoUnitario * item.quantidade,
                            )}
                          </p>
                          {item.promocao && (
                            <span className="text-xs font-medium text-coral">
                              {item.promocao.rotulo}
                            </span>
                          )}
                        </div>
                        {item.quantidade > 1 && (
                          <p className="text-xs text-content-subtle">
                            {item.quantidade} ×{' '}
                            {formatPrice(item.precoUnitario)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              atualizarQuantidade(
                                item.produto.id,
                                item.varianteId,
                                item.quantidade - 1,
                              )
                            }
                            className="w-6 h-6 rounded-full bg-blush flex items-center justify-center hover:bg-rose transition-colors"
                            aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            aria-live="polite"
                            className="text-sm font-medium w-6 text-center"
                          >
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() =>
                              atualizarQuantidade(
                                item.produto.id,
                                item.varianteId,
                                item.quantidade + 1,
                              )
                            }
                            className="w-6 h-6 rounded-full bg-blush flex items-center justify-center hover:bg-rose transition-colors"
                            aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => remover(item.produto.id, item.varianteId)}
                        className="self-start p-1 text-warm-gray hover:text-coral transition-colors"
                        aria-label={`Remover ${item.produto.nome}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {itens.length > 0 && (
              <div className="border-t border-champagne p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">
                    Subtotal ({contagem} itens)
                  </span>
                  <span className="font-medium">
                    {formatPrice(base)}
                  </span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-sm text-coral">
                    <span className="text-warm-gray">
                      Promoções vigentes
                    </span>
                    <span className="font-medium">
                      −{formatPrice(desconto)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Frete</span>
                  <span className="text-warm-gray">
                    Calculado no checkout
                  </span>
                </div>
                <div className="flex justify-between font-display font-bold text-lg pt-3 border-t border-champagne">
                  <span>Total</span>
                  <span
                    aria-live="polite"
                    className="text-deep-rose"
                  >
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-content-subtle">
                  Valores informativos — o servidor confirma
                  preço, promoção, estoque e frete na
                  finalização.
                </p>
                <Link to="/checkout" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full">
                    Finalizar compra
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>,
              document.body,
            )
          : null
        )
      }
    </>
  )
}
