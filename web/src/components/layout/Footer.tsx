import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook } from '@/components/icons/SocialIcons'

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
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
              <span className="font-display font-bold text-2xl leading-none text-ivory">
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 text-ivory transition-colors hover:bg-primary hover:text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/angelcosmeticos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Angel Cosméticos"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 text-ivory transition-colors hover:bg-primary hover:text-white"
              >
                <Facebook size={20} />
              </a>
            </div>
            <p className="mt-4 text-body-sm text-warm-gray/70">
              CNPJ 48.591.163/0001-12
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-warm-gray text-sm">
            © 2026 Angel Cosméticos — CNPJ 48.591.163/0001-12. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
