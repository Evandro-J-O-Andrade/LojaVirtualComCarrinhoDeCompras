import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/dashboard/Card'

export function OrcamentoNovo() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm">← Voltar</Button>
          <div>
            <h1 className="font-display font-bold text-3xl text-soft-black">
              Novo Orçamento
            </h1>
            <p className="text-warm-gray">Crie uma proposta comercial para seu cliente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome" placeholder="Nome do cliente" />
                <Input label="Telefone" placeholder="(11) 99999-9999" />
                <Input label="E-mail" placeholder="email@exemplo.com" />
                <Input label="Cidade" placeholder="Cidade" />
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">Produtos</h3>
              <div className="text-center py-8 text-warm-gray">
                <p>Selecione os produtos para incluir no orçamento</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  + Adicionar Produto
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">Condicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Desconto (%)" placeholder="0" />
                <Input label="Acréscimo (%)" placeholder="0" />
                <Input label="Frete" placeholder="R$ 0,00" />
                <Input label="Condição de Pagamento" placeholder="Ex: 3x sem juros" />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-warm-gray">Subtotal</span>
                  <span className="font-medium">R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Desconto</span>
                  <span className="font-medium text-coral">-R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Acréscimo</span>
                  <span className="font-medium">+R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Frete</span>
                  <span className="font-medium">R$ 0,00</span>
                </div>
                <div className="border-t border-champagne pt-3">
                  <div className="flex justify-between">
                    <span className="font-display font-bold text-lg">Total</span>
                    <span className="font-display font-bold text-2xl text-deep-rose">R$ 0,00</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button variant="primary" size="lg" className="w-full">
                Gerar PDF
              </Button>
              <Button variant="ghost" size="lg" className="w-full">
                Salvar Rascunho
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
