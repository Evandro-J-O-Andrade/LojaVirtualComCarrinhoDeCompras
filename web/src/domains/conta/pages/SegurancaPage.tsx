import { useState } from 'react'
import { type FormEvent } from 'react'
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useAccount } from '../context/AccountContext'
import { ContaProtegida } from '../components/ContaProtegida'

export const SENHA_MIN = 8

/**
 * Segurança — senha, sessão e saída.
 *
 * A alteração de senha é feita pelo
 * Supabase Auth (`auth.updateUser`):
 * nunca por uma implementação própria.
 * A sessão mostrada é a real.
 */
export function SegurancaPage() {
  const { profile, alterarSenha, signOut } =
    useAccount()

  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] =
    useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] =
    useState(false)
  const [trocada, setTrocada] =
    useState(false)

  const submeter = async (
    evento: FormEvent,
  ) => {
    evento.preventDefault()
    setErro('')
    setTrocada(false)

    if (senha.length < SENHA_MIN) {
      setErro(
        `A nova senha precisa de pelo menos ${SENHA_MIN} caracteres.`,
      )
      return
    }
    if (senha !== confirmacao) {
      setErro('A confirmação não confere com a nova senha.')
      return
    }

    setEnviando(true)
    const resultado = await alterarSenha(senha)
    setEnviando(false)

    if (resultado.error) {
      setErro(resultado.error)
      return
    }
    setSenha('')
    setConfirmacao('')
    setTrocada(true)
  }

  return (
    <ContaProtegida>
      <div>
        <SeoHead
          title="Segurança — Angel Cosméticos"
          description="Altere sua senha, veja sua sessão e saia da conta Angel Cosméticos."
          canonical="/conta/seguranca"
          jsonLd={breadcrumbJsonLd([
            { name: 'Início', href: '/' },
            { name: 'Minha conta', href: '/conta' },
            { name: 'Segurança', href: '/conta/seguranca' },
          ])}
        />

        <header className="section-angel">
          <div className="container-angel max-w-3xl">
            <p className="overline-angel mb-3">
              Minha conta
            </p>
            <h1 className="title-h1">
              Segurança
            </h1>
          </div>
        </header>

        <section className="section-angel-tight">
          <div className="container-angel max-w-3xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="surface-card p-6 lg:p-8">
                <h2 className="font-display mb-1 text-xl font-bold text-soft-black">
                  Alterar senha
                </h2>
                <p className="mb-6 text-sm text-content-muted">
                  Feita de forma segura pelo
                  provedor de identidade da
                  Angel.
                </p>

                <form
                  onSubmit={submeter}
                  noValidate
                  className="space-y-5"
                  aria-label="Formulário de alteração de senha"
                >
                  <Input
                    id="seguranca-senha"
                    label="Nova senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder={`Mínimo ${SENHA_MIN} caracteres`}
                    value={senha}
                    onChange={(evento) =>
                      setSenha(evento.target.value)
                    }
                    aria-invalid={erro ? true : undefined}
                  />
                  <Input
                    id="seguranca-confirmacao"
                    label="Confirmar nova senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    value={confirmacao}
                    onChange={(evento) =>
                      setConfirmacao(
                        evento.target.value,
                      )
                    }
                  />

                  {erro && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-coral/40 bg-coral/10 p-4"
                    >
                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-coral"
                        aria-hidden
                      />
                      <p className="text-sm text-soft-black">
                        {erro}
                      </p>
                    </div>
                  )}

                  {trocada && !erro && (
                    <div
                      role="status"
                      className="flex items-start gap-3 rounded-xl border border-champagne bg-blush/40 p-4"
                    >
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-deep-rose"
                        aria-hidden
                      />
                      <p className="text-sm text-soft-black">
                        Senha alterada. Na próxima
                        entrada, use a nova.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={enviando}
                  >
                    <KeyRound size={18} aria-hidden />
                    {enviando
                      ? 'Alterando…'
                      : 'Alterar senha'}
                  </Button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="surface-card p-6 lg:p-8">
                  <h2 className="font-display mb-4 text-xl font-bold text-soft-black">
                    Sessão atual
                  </h2>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-content-muted">
                        Conta
                      </dt>
                      <dd className="break-all text-right font-medium text-soft-black">
                        {profile?.email ?? '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-content-muted">
                        Identidade
                      </dt>
                      <dd className="font-medium text-soft-black">
                        Supabase Auth
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="surface-card p-6 lg:p-8">
                  <h2 className="font-display mb-2 text-xl font-bold text-soft-black">
                    Sair
                  </h2>
                  <p className="mb-4 text-sm text-content-muted">
                    Encerra a sessão neste
                    dispositivo. Sua identidade
                    continua segura no provedor.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => void signOut()}
                  >
                    Sair da conta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ContaProtegida>
  )
}
