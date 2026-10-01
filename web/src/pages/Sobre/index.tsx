import { Heart, Star, Mail } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'

export function SobrePage() {
  return (
    <div>
      <SeoHead
        title="Sobre a ANGEL"
        description="Conheça a história da ANGEL Cosméticos. Nascemos da crença de que a beleza é um ato de empoderamento."
        canonical="/sobre"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Sobre', href: '/sobre' },
        ])}
      />

      <div className="py-8">
      <div className="container-angel">
        <div className="text-center mb-16">
          <h1 className="font-display font-bold text-5xl md:text-6xl text-soft-black mb-6">
            Sobre a <span className="text-deep-rose">ANGEL</span>
          </h1>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Nascemos da crença de que a beleza é um ato de empoderamento.
            Cada produto é cuidadosamente selecionado para celebrar a mulher
            que somos: forte, elegante e indispensável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-display font-bold text-3xl text-soft-black mb-4">
              Uma história de beleza e resistência
            </h2>
            <p className="text-warm-gray mb-4">
              A ANGEL nasceu do sonho de criar um espaço no e-commerce que
              não vendesse apenas produtos, mas celebrasse a jornada da mulher
              moderna. Conectamos as mulheres às melhores marcas de beleza,
              moda e casa, com a qualidade e confiança que merecem.
            </p>
            <p className="text-warm-gray">
              Nossa missão é ser a parceira de confiança na jornada de
              autoestima, levando produtos que transformam o dia a dia em
              experiências únicas.
            </p>
          </div>
          <div className="aspect-square bg-blush rounded-2xl flex items-center justify-center">
            <span className="text-rose text-lg">Imagem da história</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-deep-rose" />
            </div>
            <h3 className="font-display font-bold text-xl text-soft-black mb-2">
              Empoderamento
            </h3>
            <p className="text-warm-gray">
              Acreditamos que cada mulher tem o poder de transformar seu dia
              com os produtos certos.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <Star size={28} className="text-deep-rose" />
            </div>
            <h3 className="font-display font-bold text-xl text-soft-black mb-2">
              Qualidade
            </h3>
            <p className="text-warm-gray">
              Selecionamos rigorosamente cada produto para garantir os mais
              altos padrões de qualidade e satisfação.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-deep-rose" />
            </div>
            <h3 className="font-display font-bold text-xl text-soft-black mb-2">
              Atendimento
            </h3>
            <p className="text-warm-gray">
              Estamos sempre aqui para ajudar. Nossa equipe está pronta
              para atendê-la em qualquer momento.
            </p>
          </div>
        </div>

        <div className="bg-blush rounded-3xl p-12 text-center">
          <h2 className="font-display font-bold text-3xl text-soft-black mb-4">
            Nossa equipe
          </h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Somos um time de mulheres dedicadas a tornar a experiência de
            compra na ANGEL inesquecível. Cada integrante traz sua energia,
            criatividade e paixão para o projeto.
          </p>
        </div>
</div>
      </div>
    </div>
  )
}
