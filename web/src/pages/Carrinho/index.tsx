import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/common/Button'
import { QuantitySelector } from '@/components/commerce/QuantitySelector'
import { Card } from '@/components/dashboard/Card'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'

export function CarrinhoPage() {
  const { items, total, count, removeFromCart, updateQuantity, clearCart } = useCart()
  const [cep, setCep] = React.useState('')
  const [frete, setFrete] = React.useState(0)

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
    setCep(value)
    if (value.length === 8) {
      fetch(`https://viacep.com.br/api/json/${value}/`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.erro) {
            setFrete(15)
          }
        })
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container-angel text-center">
          <div className="w-24 h-24 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-rose" />
          </div>
          <h2 className="font-display font-bold text-2xl text-soft-black mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-warm-gray mb-6">
            Adicione produtos para continuar comprando
          </p>
          <Button variant="primary">
            <a href="/produtos">Ver produtos</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-angel">
        <h1 className="font-display font-bold text-3xl text-soft-black mb-8">
          Meu Carrinho
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-20 h-20 rounded-lg bg-blush flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={32} className="text-rose" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-soft-black">{item.productName}</h3>
                  <p className="text-deep-rose font-semibold">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.id, qty)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-display font-bold text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-coral hover:text-deep-rose text-sm"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Resumo do pedido
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-warm-gray">Subtotal ({count} itens)</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Frete</span>
                  <span className="font-medium">{frete > 0 ? formatPrice(frete) : 'Calculado no checkout'}</span>
                </div>
                <div className="border-t border-champagne pt-3">
                  <div className="flex justify-between">
                    <span className="font-display font-bold text-lg">Total</span>
                    <span className="font-display font-bold text-2xl text-deep-rose">
                      {formatPrice(total + frete)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-blush rounded-2xl p-4">
              <label className="block text-sm font-medium text-warm-gray mb-2">
                CEP para calcular frete
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose"
                />
                <Button variant="primary" size="md">Calcular</Button>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Ir para checkout
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={clearCart}>
              Limpar carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}