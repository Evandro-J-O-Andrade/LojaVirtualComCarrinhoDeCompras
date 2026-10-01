import { FileText, MessageCircle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/dashboard/Card'

export function OrcamentoPage() {
  return (
    <div className="py-8">
      <div className="container-angel">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-soft-black mb-4">
            Solicite um orçamento
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Conte-nos sobre seu projeto e nossa equipe prepara uma proposta
            personalizada para você.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Dados do cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome completo" placeholder="Seu nome" required />
                <Input label="E-mail" type="email" placeholder="seu@email.com" required />
                <Input label="Telefone" placeholder="(11) 99999-9999" />
                <Input label="Cidade" placeholder="Sua cidade" />
              </div>
            </Card>

            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Detalhes do projeto
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-2">
                    Tipo de projeto
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose">
                    <option>Beleza e Maquiagem</option>
                    <option>Casa (Cama, Mesa & Banho)</option>
                    <option>Moda Feminina</option>
                    <option>Combo / Kit</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-2">
                    Orçamento aproximado
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose">
                    <option>Até R$ 100</option>
                    <option>R$ 100 - R$ 300</option>
                    <option>R$ 300 - R$ 500</option>
                    <option>R$ 500 - R$ 1000</option>
                    <option>Acima de R$ 1000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Conte-nos sobre seu projeto, produtos de interesse, quantidade, etc."
                    className="w-full px-4 py-3 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose resize-none"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-lg mb-4">
                Resumo da solicitação
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-warm-gray">Tipo</span>
                  <span className="font-medium">A definir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Valor estimado</span>
                  <span className="font-medium">A definir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray">Prazo</span>
                  <span className="font-medium">A definir</span>
                </div>
              </div>
            </Card>

            <div className="bg-blush rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-deep-rose/10 flex items-center justify-center">
                  <MessageCircle size={24} className="text-deep-rose" />
                </div>
                <div>
                  <p className="font-semibold text-soft-black">Atendimento personalizado</p>
                  <p className="text-sm text-warm-gray">Equipe ANGEL</p>
                </div>
              </div>
              <p className="text-sm text-warm-gray">
                Nossa equipe entrará em contato em até 24h com uma proposta
                personalizada para seu projeto.
              </p>
            </div>

            <Button variant="primary" size="lg" className="w-full">
              <FileText size={20} />
              Enviar solicitação
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
