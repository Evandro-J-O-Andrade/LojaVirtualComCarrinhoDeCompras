import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Instagram, Facebook, Twitter } from '@/components/icons/SocialIcons'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'

export function ContatoPage() {
  return (
    <div>
      <SeoHead
        title="Contato"
        description="Fale conosco. Estamos aqui para ajudar. Envie uma mensagem!"
        canonical="/contato"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Contato', href: '/contato' },
        ])}
      />

      <div className="py-8">
      <div className="container-angel">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-soft-black mb-4">
            Fale conosco
          </h1>
          <p className="text-warm-gray text-lg">Estamos aqui para ajudar. Envie uma mensagem!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-2xl text-soft-black mb-6">
              Informações de contato
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} className="text-deep-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-soft-black">Endereço</h3>
                  <p className="text-warm-gray">Rua das Flores, 123 - São Paulo, SP</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-deep-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-soft-black">E-mail</h3>
                  <p className="text-warm-gray">contato@angel.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center flex-shrink-0">
                  <Phone size={24} className="text-deep-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-soft-black">Telefone</h3>
                  <p className="text-warm-gray">(11) 99999-9999</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-deep-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-soft-black">Horário</h3>
                  <p className="text-warm-gray">Segunda a Sexta, 9h às 18h</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-deep-rose hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-deep-rose hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-blush flex items-center justify-center hover:bg-deep-rose hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-display font-bold text-2xl text-soft-black mb-6">
              Envie uma mensagem
            </h2>
            <form className="space-y-5">
              <Input label="Nome" placeholder="Seu nome" required />
              <Input label="E-mail" type="email" placeholder="seu@email.com" required />
              <Input label="Assunto" placeholder="Assunto da mensagem" />
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
    </div>
  )
}
