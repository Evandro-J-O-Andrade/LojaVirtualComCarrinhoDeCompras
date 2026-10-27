import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Mail,
  KeyRound,
  ServerCrash,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useAccount } from '../context/AccountContext'
import { verificarAdmin } from '@/domains/admin/services/adminAuth'
import { destinoSeguro } from '../model/conta'

/**
 * Entrar — identidade real via Supabase
 * Auth. Sem conta local, sem estado
 * falso: ou o Supabase autentica, ou a
 * cliente continua anônima (e pode
 * navegar, orçar, agendar e falar com
 * o atendimento assim mesmo).
 */
export function EntrarPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { signIn, authenticated, error, configurado } =
    useAccount()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] =
    useState(false)

  // Só caminho interno: o parâmetro nunca
  // tira a cliente da loja.
  const destino = destinoSeguro(params.get('destino'))

  // Já autenticada: nada a fazer aqui.
  useEffect(() => {
    if (authenticated) navigate(destino, { replace: true })
  }, [authenticated, navigate, destino])

  const submeter = async (
    evento: FormEvent,
  ) => {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    const resultado = await signIn(
      email.trim(),
      senha,
    )
    setEnviando(false)
    if (resultado.error) {
      setErro(resultado.error)
      return
    }
    const admin = await verificarAdmin()
    if (admin) {
      navigate('/admin', { replace: true })
      return
    }
    navigate(destino, { replace: true })
  }

  return (
    <div>
      <SeoHead
        title="Entrar — Angel Cosméticos"
        description="Entre na sua conta Angel Cosméticos para ver pedidos, orçamentos e agendamentos."
        canonical="/entrar"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Entrar', href: '/entrar' },
        ])}
      />

      <section className="section-angel">
        <div className="container-angel max-w-md">
          <div className="rounded-2xl border border-champagne bg-white p-6 shadow-sm lg:p-8">
            <p className="overline-angel mb-3">
              Sua conta
            </p>
            <h1 className="title-h1">Entrar</h1>
            <p className="mt-3 text-body text-content-muted">
              Sua identidade é real: a
              autenticação é feita pelo
              sistema seguro da Angel.
            </p>

            {!configurado ? (
              <div
                role="alert"
                className="mt-8 rounded-xl border border-coral/40 bg-coral/10 p-5"
              >
                <div className="flex items-start gap-3">
                  <ServerCrash
                    size={20}
                    className="mt-0.5 shrink-0 text-coral"
                    aria-hidden
                  />
                  <div>
                    <h2 className="font-semibold text-soft-black">
                      Entrada indisponível
                      neste ambiente
                    </h2>
                    <p className="mt-2 text-sm text-content-muted">
                      {error ??
                        'O serviço de identidade da Angel não está configurado aqui agora.'}
                    </p>
                    <p className="mt-3 text-sm text-content-muted">
                      Nada é simulado enquanto
                      isso: sua conta continua
                      anônima e você pode
                      navegar, orçar, agendar e
                      falar com o atendimento.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {error && !erro && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded-xl border border-coral/40 bg-coral/10 p-4"
                  >
                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-coral"
                      aria-hidden
                    />
                    <p className="text-sm text-soft-black">
                      {error}
                    </p>
                  </div>
                )}

                <form
                  onSubmit={submeter}
                  noValidate
                  className="mt-8 space-y-5"
                  aria-label="Formulário de entrada"
                >
                  <Input
                    id="entrar-email"
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(evento) =>
                      setEmail(evento.target.value)
                    }
                    required
                  />
                  <Input
                    id="entrar-senha"
                    label="Senha"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(evento) =>
                      setSenha(evento.target.value)
                    }
                    required
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={enviando}
                  >
                    <KeyRound size={18} aria-hidden />
                    {enviando ? 'Entrando…' : 'Entrar'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Link
                    to="/recuperar-senha"
                    className="text-sm text-content-muted hover:text-deep-rose underline-offset-4 hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              </>
            )}

            <div className="mt-8 space-y-3 border-t border-champagne pt-6">
              <p className="text-sm text-content-muted">
                Primeira visita?{' '}
                <Link
                  to="/cadastro"
                  className="font-medium text-deep-rose underline-offset-4 hover:underline"
                >
                  Crie sua conta
                </Link>{' '}
                ou fale com o atendimento.
              </p>
              <Link
                to="/atendimento"
                className="inline-flex items-center gap-2 text-sm font-medium text-deep-rose underline-offset-4 hover:underline"
              >
                <Mail size={16} aria-hidden />
                Falar com o atendimento
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-primary"
              >
                <ArrowRight
                  size={16}
                  className="-scale-x-100"
                  aria-hidden
                />
                Voltar para a loja
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
