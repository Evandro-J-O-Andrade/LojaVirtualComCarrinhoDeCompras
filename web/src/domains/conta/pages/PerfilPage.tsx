import { Mail, Phone, User } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useAccount } from '../context/AccountContext'
import { ContaProtegida } from '../components/ContaProtegida'
import { nomeExibicao } from '../model/conta'

/**
 * Perfil — identidade real.
 *
 * E-mail vem do Supabase Auth.
 * Telefone é da tabela de perfil,
 * que entra com a Etapa 8: enquanto
 * isso, o campo diz o que falta em
 * vez de fingir um dado.
 */
export function PerfilPage() {
  const { profile } = useAccount()

  return (
    <ContaProtegida>
      <div>
        <SeoHead
          title="Perfil — Angel Cosméticos"
          description="Seus dados de identificação na Angel Cosméticos."
          canonical="/conta/perfil"
          jsonLd={breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Minha conta', href: '/conta' },
            { name: 'Perfil', href: '/conta/perfil' },
          ])}
        />

        <header className="section-angel">
          <div className="container-angel max-w-3xl">
            <p className="overline-angel mb-3">
              Minha conta
            </p>
            <h1 className="title-h1">Perfil</h1>
          </div>
        </header>

        <section className="section-angel-tight">
          <div className="container-angel max-w-3xl">
            <div className="surface-card space-y-6 p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blush">
                  <User
                    size={24}
                    className="text-deep-rose"
                    aria-hidden
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-soft-black">
                    Nome
                  </h2>
                  <p className="text-body text-content-muted">
                    {profile
                      ? nomeExibicao(profile)
                      : '—'}
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
                  <p className="text-body text-content-muted">
                    {profile?.email ?? '—'}
                  </p>
                  <p className="text-body-sm text-content-muted">
                    Confirmado pela sua entrada
                    segura.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blush">
                  <Phone
                    size={24}
                    className="text-deep-rose"
                    aria-hidden
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-soft-black">
                    Telefone
                  </h2>
                  <p className="text-body text-content-muted">
                    Ainda não informado
                  </p>
                  <p className="text-body-sm text-content-muted">
                    O telefone de contato passa a
                    ser salvo com a integração do
                    perfil da conta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ContaProtegida>
  )
}
