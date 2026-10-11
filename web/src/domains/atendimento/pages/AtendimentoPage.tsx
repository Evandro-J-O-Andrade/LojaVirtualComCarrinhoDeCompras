import { ArrowRight } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { Card } from '@/components/dashboard/Card'
import { cn } from '@/lib/utils'
import { AtendimentoForm } from '../components/AtendimentoForm'
import { useAtendimento } from '../hooks/useAtendimento'
import {
  ATENDIMENTO_CONTEXTO_LISTA,
  type AtendimentoContexto,
} from '../model/atendimento'

/**
 * Atendimento — um formulário, seis contextos.
 *
 * Contato é aquisição; atendimento é operação
 * de suporte. Cada cartão contextualiza o
 * formulário (Produto, Orçamento/Pedido,
 * Agendamento, Pagamento, Entrega, Equipe)
 * e pode carregar a referência comercial via
 * deep-link (?contexto=…&referencia=…).
 */
export function AtendimentoPage() {
  const atendimento = useAtendimento()

  const selecionar = (
    contexto: AtendimentoContexto,
  ) => {
    atendimento.atualizar('contexto', contexto)
    document
      .getElementById('atendimento-form')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <SeoHead
        title="Atendimento — Angel Cosméticos"
        description="Atendimento Angel Cosméticos: dúvidas sobre produtos, orçamentos, agendamentos, pagamentos e entregas."
        canonical="/atendimento"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Atendimento', href: '/atendimento' },
        ])}
      />

      <header className="section-angel">
        <div className="container-angel max-w-3xl">
          <p className="overline-angel mb-3">
            Atendimento
          </p>
          <h1 className="title-h1">
            Como podemos ajudar?
          </h1>
          <p className="mt-4 text-body-lg text-content-muted">
            Escolha o assunto: o formulário se
            ajusta ao que você precisa. Se já
            veio de um produto, orçamento ou
            agendamento, a referência vem
            preenchida.
          </p>
        </div>
      </header>

      <section className="section-angel-tight">
        <div className="container-angel">
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ATENDIMENTO_CONTEXTO_LISTA.map(
              (info) => (
                <Card
                  key={info.contexto}
                  className={cn(
                    'cursor-pointer transition-colors hover:border-deep-rose',
                    atendimento.campos.contexto ===
                      info.contexto &&
                      'border-deep-rose',
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      selecionar(info.contexto)
                    }
                    className="group flex h-full w-full flex-col items-start text-left"
                    aria-pressed={
                      atendimento.campos.contexto ===
                      info.contexto
                    }
                  >
                    <h2 className="font-display mb-2 text-lg font-bold text-soft-black">
                      {info.rotulo}
                    </h2>
                    <p className="mb-4 flex-1 text-sm text-content-muted">
                      {info.descricao}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-deep-rose">
                      Escrever
                      <ArrowRight
                        size={16}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </button>
                </Card>
              ),
            )}
          </div>

          <div
            id="atendimento-form"
            className="mx-auto max-w-2xl scroll-mt-24 rounded-2xl border border-champagne bg-white p-6 shadow-sm lg:p-8"
          >
            <h2 className="font-display mb-1 text-2xl font-bold text-soft-black">
              {
                ATENDIMENTO_CONTEXTO_LISTA.find(
                  (c) =>
                    c.contexto ===
                    atendimento.campos.contexto,
                )?.rotulo
              }
            </h2>
            <p className="mb-6 text-sm text-content-muted">
              Sua mensagem fica salva enquanto
              você escreve — nada se perde.
            </p>
            <AtendimentoForm
              atendimento={atendimento}
              mostrarContexto={false}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
