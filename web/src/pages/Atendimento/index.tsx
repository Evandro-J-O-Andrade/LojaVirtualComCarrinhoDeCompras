import { MessageCircle, Phone, Mail, Send } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/dashboard/Card'

export function AtendimentoPage() {
  return (
    <div className="py-8">
      <div className="container-angel">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-soft-black mb-4">
            Atendimento
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Nossa equipe está pronta para atendê-la. Escolha a forma preferida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-deep-rose" />
            </div>
            <h3 className="font-display font-bold text-xl text-soft-black mb-2">
              Chat online
            </h3>
            <p className="text-warm-gray mb-4">
              Fale conosco em tempo real
            </p>
            <Button variant="primary" size="sm">
              Iniciar chat
            </Button>
          </Card>

          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <Phone size={32} className="text-deep-rose" />
            </div>
            <h3 className="font-display font-bold text-xl text-soft-black mb-2">
              Telefone
            </h3>
            <p className="text-warm-gray mb-4">(11) 99999-9999</p>
            <Button variant="primary" size="sm">
              Ligar
            </Button>
          </Card>

          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-deep-rose" />
            </div>
            <h3 className="font-display font-bold text-xl text-soft-black mb-2">
              E-mail
            </h3>
            <p className="text-warm-gray mb-4">contato@angel.com</p>
            <Button variant="primary" size="sm">
              Enviar e-mail
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-2xl text-soft-black mb-6">
              Horário de atendimento
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                <span className="font-medium">Segunda a Sexta</span>
                <span className="text-warm-gray">9h às 18h</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                <span className="font-medium">Sábado</span>
                <span className="text-warm-gray">10h às 14h</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                <span className="font-medium">Domingo</span>
                <span className="text-warm-gray">Fechado</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl text-soft-black mb-6">
              Envie uma mensagem
            </h2>
            <form className="space-y-4">
              <Input label="Nome" placeholder="Seu nome" required />
              <Input label="E-mail" type="email" placeholder="seu@email.com" required />
              <Input label="Assunto" placeholder="Assunto" />
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Mensagem
                </label>
                <textarea
                  rows={5}
                  placeholder="Como podemos ajudar?"
                  className="w-full px-4 py-3 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose resize-none"
                />
              </div>
              <Button variant="primary" size="lg" className="w-full">
                <Send size={18} />
                Enviar mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
