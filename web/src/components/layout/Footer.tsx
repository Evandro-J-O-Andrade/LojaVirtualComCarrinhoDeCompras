import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook } from '@/components/icons/SocialIcons'

export function Footer() {
  return (
    <footer className="bg-[#0B0B0D] text-[#F5F5F5]">
      <div className="container-angel py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/brand/angel-logo-64.png"
                alt=""
                width={64}
                height={62}
                className="h-12 w-auto"
              />
              <span className="font-display font-bold text-2xl leading-none text-[#F5F5F5]">
                Angel <span className="text-champagne">Cosméticos</span>
              </span>
            </Link>
            <p className="text-warm-gray text-sm">
              Sua beleza, seu estilo. Produtos selecionados para celebrar a mulher moderna.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4">Produtos</h4>
            <ul className="space-y-3">
              <li><Link to="/produtos?categoria=beleza" className="text-warm-gray hover:text-white transition-colors text-sm">Beleza & Maquiagem</Link></li>
              <li><Link to="/produtos?categoria=casa" className="text-warm-gray hover:text-white transition-colors text-sm">Casa</Link></li>
              <li><Link to="/produtos?categoria=moda" className="text-warm-gray hover:text-white transition-colors text-sm">Moda Feminina</Link></li>
              <li><Link to="/produtos" className="text-warm-gray hover:text-white transition-colors text-sm">Todos os produtos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4">Ajuda</h4>
            <ul className="space-y-3">
              <li><Link to="/atendimento" className="text-warm-gray hover:text-white transition-colors text-sm">Atendimento</Link></li>
              <li><Link to="/contato" className="text-warm-gray hover:text-white transition-colors text-sm">Contato</Link></li>
              <li><Link to="/orcamentos/novo" className="text-warm-gray hover:text-white transition-colors text-sm">Orçamento</Link></li>
              <li><Link to="/sobre" className="text-warm-gray hover:text-white transition-colors text-sm">Sobre</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-4">Onde nos encontrar</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-warm-gray text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                Viela Aristides de Oliveira, nº 130 — Poá/SP — CEP 08551-275
              </li>
              <li className="flex items-center gap-2 text-warm-gray text-sm">
                <Mail size={16} className="shrink-0" />
                contato@angelcosmeticos.com.br
              </li>
              <li className="flex items-center gap-2 text-warm-gray text-sm">
                <Phone size={16} className="shrink-0" />
                <a
                  href="https://wa.me/5511963205776"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  (11) 96320-5776
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/angelcosmeticos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Angel Cosméticos"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#F5F5F5] transition-colors hover:bg-primary hover:text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/angelcosmeticos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Angel Cosméticos"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#F5F5F5] transition-colors hover:bg-primary hover:text-white"
              >
                <Facebook size={20} />
              </a>
            </div>
            <p className="mt-4 text-body-sm text-warm-gray/70">
              CNPJ 48.591.163/0001-12
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="mx-auto max-w-2xl text-body text-[#F5F5F5]">
            Muito obrigada por escolher a Angel Cosméticos!
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-body-sm text-warm-gray">
            Estamos aqui para realçar a sua beleza única, oferecendo os melhores
            produtos que celebram a sua confiança e autenticidade. 💖
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-body-sm text-warm-gray">
            Explore nossas novidades e aproveite promoções exclusivas feitas
            especialmente para você. 💅
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-body-sm text-warm-gray">
            Você merece o melhor, e nós estamos ao seu lado para ajudá-la a
            brilhar a cada momento. ✨
          </p>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-warm-gray text-sm">
            © Angel Cosméticos · Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}
