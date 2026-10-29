import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Mail,
  ServerCrash,
  User,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useAccount } from '../context/AccountContext'

function mensagemDeCadastro(erro: string): string {
  const normalizado = erro.toLowerCase()
  if (
    normalizado.includes('over_email_send_rate_limit') ||
    normalizado.includes('email rate limit') ||
    normalizado.includes('rate limit exceeded') ||
    normalizado.includes('too many requests') ||
    normalizado.includes('429')
  ) {
    return 'O serviço de cadastro atingiu o limite de envio de e-mails. Aguarde o período de liberação antes de tentar novamente. Não reenvie o formulário repetidamente.'
  }
  return erro
}

export function CadastroPage() {
  const navigate = useNavigate()
  const { signUp, authenticated, error, configurado } =
    useAccount()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const submissaoEmAndamento = useRef(false)

  useEffect(() => {
    if (authenticated) navigate('/conta', { replace: true })
  }, [authenticated, navigate])

  const submeter = async (evento: FormEvent) => {
    evento.preventDefault()
    if (submissaoEmAndamento.current) return
    setErro('')
    if (!nome.trim()) {
      setErro('Informe seu nome.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    submissaoEmAndamento.current = true
    setEnviando(true)
    try {
      const resultado = await signUp(
        email.trim(),
        senha,
        nome.trim(),
      )
      if (resultado.error) {
        setErro(mensagemDeCadastro(resultado.error))
        return
      }
      setSucesso(true)
    } catch (err) {
      setErro(
        mensagemDeCadastro(
          err instanceof Error
            ? err.message
            : 'Erro inesperado ao criar conta.',
        ),
      )
    } finally {
      submissaoEmAndamento.current = false
      setEnviando(false)
    }
  }

  return (
    <div>
      <SeoHead
        title="Cadastro — Angel Cosméticos"
        description="Crie sua conta Angel Cosméticos para ver pedidos, orçamentos e agendamentos."
        canonical="/cadastro"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Cadastro', href: '/cadastro' },
        ])}
      />

      <section className="section-angel">
        <div className="container-angel max-w-md">
          <div className="rounded-2xl border border-champagne bg-white p-6 shadow-sm lg:p-8">
            <p className="overline-angel mb-3">
              Sua conta
            </p>
            <h1 className="title-h1">Criar conta</h1>
            <p className="mt-3 text-body text-content-muted">
              Sua identidade é real: o
              cadastro é feito pelo sistema
              seguro da Angel.
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
                      Cadastro indisponível
                      neste ambiente
                    </h2>
                    <p className="mt-2 text-sm text-content-muted">
                      {error ??
                        'O serviço de identidade da Angel não está configurado aqui agora.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : sucesso ? (
              <div
                role="status"
                className="mt-8 rounded-xl border border-champagne bg-surface-sunken p-5"
              >
                <p className="text-sm text-soft-black">
                  Conta criada. Verifique seu
                  e-mail para confirmar o
                  cadastro e depois entre.
                </p>
                <Link
                  to="/entrar"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-deep-rose underline-offset-4 hover:underline"
                >
                  <ArrowRight size={16} aria-hidden />
                  Ir para entrar
                </Link>
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
                  aria-busy={enviando}
                  className="mt-8 space-y-5"
                  aria-label="Formulário de cadastro"
                >
                  <Input
                    id="cadastro-nome"
                    label="Nome"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(evento) =>
                      setNome(evento.target.value)
                    }
                    required
                  />
                  <Input
                    id="cadastro-email"
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
                    id="cadastro-senha"
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
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
                    <User size={18} aria-hidden />
                    {enviando
                      ? 'Criando conta…'
                      : 'Criar conta'}
                  </Button>
                </form>
              </>
            )}

            <div className="mt-8 space-y-3 border-t border-champagne pt-6">
              <p className="text-sm text-content-muted">
                Já tem conta? Entre com
                seu e-mail e senha.
              </p>
              <Link
                to="/entrar"
                className="inline-flex items-center gap-2 text-sm font-medium text-deep-rose underline-offset-4 hover:underline"
              >
                <Mail size={16} aria-hidden />
                Entrar
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
