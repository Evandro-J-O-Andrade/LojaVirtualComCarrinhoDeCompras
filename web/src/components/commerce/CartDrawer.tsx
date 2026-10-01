import React from 'react'
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { items, total, count, removeFromCart, updateQuantity } = useCart()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-blush transition-colors"
        aria-label="Carrinho"
      >
        <ShoppingBag size={22} className="text-soft-black" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-deep-rose text-white text-xs rounded-full flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-soft-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-ivory shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-champagne">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <ShoppingBag size={20} />
                Seu Carrinho
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-blush">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
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
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-white rounded-xl p-3">
                      <div className="w-16 h-16 rounded-lg bg-blush flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={24} className="text-rose" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                        <p className="text-deep-rose font-semibold text-sm">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-blush flex items-center justify-center hover:bg-rose transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-blush flex items-center justify-center hover:bg-rose transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="self-start p-1 text-warm-gray hover:text-coral transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-champagne p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Frete</span>
                  <span className="text-warm-gray">Calculado no checkout</span>
                </div>
                <div className="flex justify-between font-display font-bold text-lg pt-3 border-t border-champagne">
                  <span>Total</span>
                  <span className="text-deep-rose">{formatPrice(total)}</span>
                </div>
                <Button variant="primary" size="lg" className="w-full" onClick={() => setIsOpen(false)}>
                  Ir para checkout
                  <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}