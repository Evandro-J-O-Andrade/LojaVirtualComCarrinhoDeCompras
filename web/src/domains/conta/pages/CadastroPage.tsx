import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Mail,
  MapPin,
  Search,
  ServerCrash,
  User,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { useAccount } from '../context/AccountContext'
import { supabase } from '@/lib/supabase'

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
  if (normalizado.includes('already registered') || normalizado.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.'
  }
  return erro
}

function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, '')
}

export function CadastroPage() {
  const navigate = useNavigate()
  const { signUp, authenticated, error, configurado } =
    useAccount()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)

  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const submissaoEmAndamento = useRef(false)

  useEffect(() => {
    if (authenticated) navigate('/conta', { replace: true })
  }, [authenticated, navigate])

  const buscarCep = async () => {
    const cepLimpo = apenasDigitos(cep)
    if (cepLimpo.length !== 8) {
      setErro('Informe um CEP válido com 8 dígitos.')
      return
    }
    setBuscandoCep(true)
    setErro('')
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await resp.json()
      if (data.erro) {
        setErro('CEP não encontrado.')
        return
      }
      setLogradouro(data.logradouro || '')
      setBairro(data.bairro || '')
      setCidade(data.localidade || '')
      setUf(data.uf || '')
    } catch {
      setErro('Não foi possível buscar o CEP agora.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const submeter = async (evento: FormEvent) => {
    evento.preventDefault()
    if (submissaoEmAndamento.current) return
    setErro('')
    if (!nome.trim()) {
      setErro('Informe seu nome completo.')
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
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.')
      return
    }
    const cepLimpo = apenasDigitos(cep)
    if (cepLimpo && cepLimpo.length !== 8) {
      setErro('Informe um CEP válido ou deixe em branco.')
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

      // Tentar criar cliente e endereço após cadastro
      try {
        const { data: authUser } = await supabase.auth.getUser()
        const userId = authUser.user?.id

        const clientePayload: Record<string, unknown> = {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim() || null,
          cpf: apenasDigitos(cpf) || null,
          nascimento: nascimento || null,
        }
        if (userId) {
          clientePayload.auth_user_id = userId
        }

        const { data: clienteCriado, error: clienteErro } = await supabase
          .from('cliente')
          .upsert(clientePayload, { onConflict: 'email' })
          .select()
          .maybeSingle()

        if (!clienteErro && clienteCriado && cepLimpo && logradouro && numero && bairro && cidade && uf) {
          await supabase.from('endereco').insert({
            cliente_id: clienteCriado.id,
            logradouro: logradouro.trim(),
            numero: numero.trim(),
            complemento: complemento.trim() || null,
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            uf: uf.trim().toUpperCase(),
            cep: cepLimpo,
            principal: true,
            ativo: true,
          })
        }
      } catch {
        // Não bloquear o cadastro se criação de cliente/endereco falhar
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
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-soft-black">Identificação</p>
                    <Input
                      id="cadastro-nome"
                      label="Nome completo"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome completo"
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        id="cadastro-telefone"
                        label="Telefone / WhatsApp"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(evento) =>
                          setTelefone(evento.target.value)
                        }
                      />
                      <Input
                        id="cadastro-cpf"
                        label="CPF"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(evento) =>
                          setCpf(evento.target.value)
                        }
                      />
                    </div>
                    <Input
                      id="cadastro-nascimento"
                      label="Data de nascimento"
                      type="date"
                      value={nascimento}
                      onChange={(evento) =>
                        setNascimento(evento.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-soft-black flex items-center gap-2">
                      <MapPin size={16} /> Endereço principal
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="cadastro-cep"
                        label="CEP"
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(evento) =>
                          setCep(evento.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6"
                        onClick={buscarCep}
                        disabled={buscandoCep}
                      >
                        <Search size={16} />
                        {buscandoCep ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </div>
                    <Input
                      id="cadastro-logradouro"
                      label="Logradouro"
                      type="text"
                      value={logradouro}
                      onChange={(evento) =>
                        setLogradouro(evento.target.value)
                      }
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        id="cadastro-numero"
                        label="Número"
                        type="text"
                        value={numero}
                        onChange={(evento) =>
                          setNumero(evento.target.value)
                        }
                      />
                      <Input
                        id="cadastro-complemento"
                        label="Complemento"
                        type="text"
                        value={complemento}
                        onChange={(evento) =>
                          setComplemento(evento.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Input
                        id="cadastro-bairro"
                        label="Bairro"
                        type="text"
                        value={bairro}
                        onChange={(evento) =>
                          setBairro(evento.target.value)
                        }
                      />
                      <Input
                        id="cadastro-cidade"
                        label="Cidade"
                        type="text"
                        value={cidade}
                        onChange={(evento) =>
                          setCidade(evento.target.value)
                        }
                      />
                      <Input
                        id="cadastro-uf"
                        label="UF"
                        type="text"
                        maxLength={2}
                        value={uf}
                        onChange={(evento) =>
                          setUf(evento.target.value.toUpperCase())
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-soft-black">Acesso</p>
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
                    <Input
                      id="cadastro-confirmar-senha"
                      label="Confirmar senha"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmarSenha}
                      onChange={(evento) =>
                        setConfirmarSenha(evento.target.value)
                      }
                      required
                    />
                  </div>

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
