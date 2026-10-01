import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/dashboard/Card'
import { QuantitySelector } from '@/components/commerce/QuantitySelector'
import { formatPrice } from '@/lib/utils'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { ShoppingBag, CreditCard, Shield, CheckCircle, MapPin, Truck } from 'lucide-react'

export function CheckoutPage() {
  const { items, total, updateQuantity } = useCart()
  const [cep, setCep] = React.useState('')
  const [address, setAddress] = React.useState<any>(null)

  const handleCepBlur = async () => {
    if (cep.length === 8) {
      const res = await fetch(`https://viacep.com.br/api/json/${cep}/`)
      const data = await res.json()
      if (!data.erro) {
        setAddress(data)
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container-angel text-center">
          <h2 className="font-display font-bold text-2xl text-soft-black mb-4">
            Carrinho vazio
          </h2>
          <Button variant="primary">
            <a href="/produtos">Ver produtos</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SeoHead
        title="Checkout"
        description="Finalize sua compra na ANGEL Cosméticos. Entrega segura e rápida."
        canonical="/checkout"
        robots="noindex, nofollow"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Carrinho', href: '/carrinho' },
          { name: 'Checkout', href: '/checkout' },
        ])}
      />

      <div className="py-8">
      <div className="container-angel">
        <h1 className="font-display font-bold text-3xl text-soft-black mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Endereço de entrega
              </h3>
              <div className="space-y-4">
                <Input
                  label="CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                />
                {address && (
                  <div className="bg-blush rounded-lg p-4">
                    <p className="text-sm text-warm-gray">
                      {address.logadouro}, {address.bairro} - {address.localidade}/{address.uf}
                    </p>
                  </div>
                )}
                <Input label="Rua" placeholder="Nome da rua" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Número" placeholder="123" />
                  <Input label="Complemento" placeholder="Apto 45" />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Forma de pagamento
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-champagne cursor-pointer hover:border-deep-rose">
                  <input type="radio" name="payment" defaultChecked className="accent-deep-rose" />
                  <CreditCard size={20} className="text-deep-rose" />
                  <div>
                    <p className="font-medium text-soft-black">Cartão de crédito</p>
                    <p className="text-sm text-warm-gray">Até 12x sem juros</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-champagne cursor-pointer hover:border-deep-rose">
                  <input type="radio" name="payment" className="accent-deep-rose" />
                  <MapPin size={20} className="text-deep-rose" />
                  <div>
                    <p className="font-medium text-soft-black">Pix</p>
                    <p className="text-sm text-warm-gray">Pagamento instantâneo</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-champagne cursor-pointer hover:border-deep-rose">
                  <input type="radio" name="payment" className="accent-deep-rose" />
                  <Truck size={20} className="text-deep-rose" />
                  <div>
                    <p className="font-medium text-soft-black">Entrega</p>
                    <p className="text-sm text-warm-gray">Pagamento na entrega</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Resumo do pedido
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blush flex items-center justify-center">
                        <ShoppingBag size={18} className="text-rose" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(qty) => updateQuantity(item.id, qty)}
                          size="sm"
                        />
                      </div>
                    </div>
                    <span className="font-medium text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-champagne pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Frete</span>
                    <span>R$ 15,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-display font-bold text-lg">Total</span>
                    <span className="font-display font-bold text-2xl text-deep-rose">
                      {formatPrice(total + 15)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Button variant="primary" size="lg" className="w-full">
              <CheckCircle size={20} />
              Confirmar pedido
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-warm-gray">
              <Shield size={16} />
              <span>Pagamento seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}