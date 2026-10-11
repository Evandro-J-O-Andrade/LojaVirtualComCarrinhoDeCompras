import { Mail, MapPin } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { AtendimentoForm } from '../components/AtendimentoForm'
import { useAtendimento } from '../hooks/useAtendimento'

/**
 * Contato — os canais reais da Angel.
 *
 * Só o que existe: endereço de Poá/SP,
 * e-mail e CNPJ. Sem telefone, horário ou
 * redes sociais inventados.
 */
export function ContatoPage() {
  const atendimento = useAtendimento()

  return (
    <div>
      <SeoHead
        title="Contato — Angel Cosméticos"
        description="Fale com a Angel Cosméticos: endereço em Poá/SP, e-mail e formulário de contato."
        canonical="/contato"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Contato', href: '/contato' },
        ])}
      />

      <header className="section-angel">
        <div className="container-angel max-w-3xl">
          <p className="overline-angel mb-3">Contato</p>
          <h1 className="title-h1">Fale com a gente</h1>
          <p className="mt-4 text-body-lg text-content-muted">
            Dúvida, elogio ou parceria: escreva
            para a equipe. Respondemos pelo
            canal que você preferir.
          </p>
        </div>
      </header>

      <section className="section-angel-tight">
        <div className="container-angel">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blush">
                  <MapPin
                    size={24}
                    className="text-deep-rose"
                    aria-hidden
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-soft-black">
                    Endereço
                  </h2>
                  <p className="text-body text-content-muted">
                    Viela Aristides de Oliveira, nº
                    130 — Poá/SP — CEP 08551-275
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blush">
                  <Mail
                    size={24}
                    className="text-deep-rose"
                    aria-hidden
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-soft-black">
                    E-mail
                  </h2>
                  <a
                    href="mailto:contato@angelcosmeticos.com.br"
                    className="text-body text-deep-rose underline-offset-4 hover:underline"
                  >
                    contato@angelcosmeticos.com.br
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-champagne bg-white p-5 shadow-sm">
                <p className="text-sm text-content-muted">
                  CNPJ 48.591.163/0001-12
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-champagne bg-white p-6 shadow-sm lg:col-span-3 lg:p-8">
              <h2 className="font-display mb-6 text-2xl font-bold text-soft-black">
                Envie uma mensagem
              </h2>
              <AtendimentoForm
                atendimento={atendimento}
                mostrarContexto
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
