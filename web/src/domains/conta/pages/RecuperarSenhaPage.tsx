import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { supabase, supabaseConfigurado } from '@/lib/supabase'

export function RecuperarSenhaPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const submeter = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setErro('')
    if (!email.trim()) {
      setErro('Informe seu e-mail.')
      return
    }
    if (!supabaseConfigurado) {
      setErro('Serviço de identidade não configurado.')
      return
    }
    setEnviando(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/conta/seguranca` },
      )
      if (error) {
        setErro(error.message)
        return
      }
      setEnviado(true)
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Erro inesperado. Tente novamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <SeoHead
        title="Recuperar senha — Angel Cosméticos"
        description="Recupere o acesso à sua conta Angel Cosméticos."
        canonical="/recuperar-senha"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Recuperar senha', href: '/recuperar-senha' },
        ])}
      />

      <section className="section-angel">
        <div className="container-angel max-w-md">
          <div className="rounded-2xl border border-champagne bg-white p-6 shadow-sm lg:p-8">
            <p className="overline-angel mb-3">Sua conta</p>
            <h1 className="title-h1">Recuperar senha</h1>
            <p className="mt-3 text-body text-content-muted">
              Informe seu e-mail para receber o
              link de redefinição de senha.
            </p>

            {enviado ? (
              <div role="status" className="mt-8 rounded-xl border border-champagne bg-surface-sunken p-5">
                <p className="text-sm text-soft-black">
                  Se o e-mail estiver cadastrado,
                  você receberá um link para
                  redefinir sua senha.
                </p>
                <Link
                  to="/entrar"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-deep-rose underline-offset-4 hover:underline"
                >
                  <ArrowRight size={16} aria-hidden />
                  Voltar para entrar
                </Link>
              </div>
            ) : (
              <form
                onSubmit={submeter}
                noValidate
                className="mt-8 space-y-5"
                aria-label="Formulário de recuperação de senha"
              >
                <Input
                  id="recuperar-email"
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    <p className="text-sm text-soft-black">{erro}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={enviando}
                >
                  <Mail size={18} aria-hidden />
                  {enviando ? 'Enviando…' : 'Enviar link'}
                </Button>
              </form>
            )}

            <div className="mt-8 space-y-3 border-t border-champagne pt-6">
              <Link
                to="/entrar"
                className="inline-flex items-center gap-2 text-sm font-medium text-deep-rose underline-offset-4 hover:underline"
              >
                <ArrowRight size={16} className="-scale-x-100" aria-hidden />
                Voltar para entrar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
