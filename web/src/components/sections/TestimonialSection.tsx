const testimonials = [
  {
    name: 'Maria Silva',
    text: 'Os produtos superaram minhas expectativas. A qualidade é incrível e o atendimento é nota 10!',
    rating: 5,
    product: 'Kit Maquiagem',
  },
  {
    name: 'Ana Santos',
    text: 'Comprei o vestido e fiquei apaixonada. Tecido excelente e caimento perfeito.',
    rating: 5,
    product: 'Vestido Florido',
  },
  {
    name: 'Juliana Costa',
    text: 'Meu lar ficou ainda mais lindo com os produtos da ANGEL. Recomendo muito!',
    rating: 5,
    product: 'Kit Cama',
  },
]

export function TestimonialSection() {
  return (
    <section className="py-16 bg-blush/30">
      <div className="container-angel">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl text-soft-black mb-4">
            O que nossas clientes dizem
          </h2>
          <p className="text-warm-gray text-lg">Mais de 1.000 mulheres confiam na ANGEL</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l2.9 6.3L22 9.2l-5 4.9L18.7 22 12 18.5 5.3 22 6.7 14.1l-5-4.9 7.1-1.2z" />
                  </svg>
                ))}
              </div>
              <p className="text-warm-gray mb-6 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-rose to-coral flex items-center justify-center text-white font-medium">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-soft-black">{t.name}</p>
                  <p className="text-sm text-warm-gray">Comprou {t.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
