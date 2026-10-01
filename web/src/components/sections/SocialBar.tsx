import { Heart } from 'lucide-react'
import { Instagram, Facebook, Twitter } from '@/components/icons/SocialIcons'

export function SocialBar() {
  return (
    <section className="py-12 bg-soft-black text-white">
      <div className="container-angel">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-deep-rose" />
            <div>
              <p className="font-display font-bold text-lg">Junte-se à comunidade ANGEL</p>
              <p className="text-white/60 text-sm">Receba novidades, dicas de beleza e ofertas exclusivas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-deep-rose transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-deep-rose transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-deep-rose transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
