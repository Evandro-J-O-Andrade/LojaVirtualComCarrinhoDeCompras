import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  CreditCard,
  MapPin,
  QrCode,
  Shield,
  Truck,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/dashboard/Card'
import { ProdutoImagem } from '@/domains/produtos/components/ProdutoImagem'
import { useCarrinho } from '@/domains/carrinho/context/CarrinhoProvider'
import {
  subtotalBase,
  subtotalOfertado,
  valorPromocao,
} from '@/domains/carrinho/model/carrinho'
import {
  type IntencaoDeCompra,
  type ModalidadeEntrega,
  type MetodoPagamento,
  arredondar,
} from '@/domains/checkout/model/intencao'
import { calcularFrete } from '@/domains/checkout/model/frete'
import { LocalIntencaoRepository } from '@/domains/checkout/repositories/intencao.repository.local'
import { buscarEnderecoPorCep } from '@/domains/checkout/services/cep'
import { formatPrice } from '@/lib/utils'

const intencoes = new LocalIntencaoRepository()

export function CheckoutPage() {
  const { itens, limpar } = useCarrinho()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [bairro, setBairro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [modalidade, setModalidade] =
    useState<ModalidadeEntrega>('entrega')
  const [metodo, setMetodo] = useState<MetodoPagamento>('pix')
  const [parcelas, setParcelas] = useState(1)
  const [confirmada, setConfirmada] =
    useState<IntencaoDeCompra | null>(null)

  const base = subtotalBase(itens)
  const promocao = valorPromocao(itens)
  const ofertado = subtotalOfertado(itens)
  /** DECISÃO 5: regra real ou nada. Retirada é
      genuinamente grátis; entrega só é autoridade
      após cálculo no backend. */
  const frete = calcularFrete(modalidade)
  const totalInformativo = arredondar(
    ofertado + (frete.valor ?? 0),
  )

  const aoBuscarCEP = async () => {
    setCepLoading(true)
    setCepError(null)
    const resultado = await buscarEnderecoPorCep(cep)
    if (!resultado.sucesso) {
      const mensagens: Record<string, string> = {
        'cep-invalido': 'CEP inválido. Digite 8 dígitos.',
        'cep-inexistente': 'CEP não encontrado.',
        'erro-no-servidor': 'Erro ao consultar o CEP. Tente novamente.',
        'erro-de-rede': 'Não foi possível buscar o CEP. Preencha manualmente.',
      }
      setCepError(mensagens[resultado.erro!] ?? 'Erro desconhecido.')
      setCepLoading(false)
      return
    }
    const dados = resultado.dados!
    if (dados.logradouro) setRua(dados.logradouro)
    if (dados.bairro) setBairro(dados.bairro)
    if (dados.localidade) setCidade(dados.localidade)
    if (dados.uf) setEstado(dados.uf)
    setCepLoading(false)
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim(),
  )
  const entregaValida =
    modalidade === 'retirada' ||
    (cep.length === 8 &&
      rua.trim() !== '' &&
      numero.trim() !== '' &&
      cidade.trim() !== '' &&
      estado.trim() !== '')
  const identificacaoValida =
    nome.trim() !== '' &&
    emailValido &&
    whatsapp.trim() !== ''
  const prontoParaConfirmar =
    itens.length > 0 &&
    identificacaoValida &&
    entregaValida

  const confirmar = () => {
    if (!prontoParaConfirmar) return
    const intencao: IntencaoDeCompra = {
      id: `intencao-${Date.now()}`,
      criadaEm: new Date().toISOString(),
      cliente: {
        nome: nome.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
      },
      endereco: {
        cep: cep.trim(),
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim() || null,
        complemento: complemento.trim() || null,
        cidade: cidade.trim(),
        estado: estado.trim(),
      },
      modalidadeEntrega: modalidade,
      pagamento: { metodo, parcelas },
      itens,
      totais: {
        subtotalBase: base,
        valorPromocao: promocao,
        subtotalOfertado: ofertado,
        frete: frete.valor,
        totalInformativo,
      },
      source: 'local',
    }
    intencoes.salvar(intencao)
    limpar()
    setConfirmada(intencao)
  }

  if (confirmada) {
    return (
      <div className="py-16">
        <div className="container-angel max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-4xl text-soft-black">
            Intenção de compra registrada
          </h1>
          <p className="text-warm-gray leading-relaxed">
            Sua seleção de {confirmada.itens.length}{' '}
            {confirmada.itens.length === 1 ? 'item' : 'itens'} foi
            registrada em{' '}
            <span className="font-semibold text-soft-black">
              {new Date(confirmada.criadaEm).toLocaleString('pt-BR')}
            </span>
            .
          </p>
          <Card className="p-5 text-left">
            <h2 className="font-display font-semibold mb-3">
              Resumo comercial
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-content-muted">
                  Subtotal (preço base)
                </dt>
                <dd className="font-medium">
                  {formatPrice(confirmada.totais.subtotalBase)}
                </dd>
              </div>
              {confirmada.totais.valorPromocao > 0 && (
                <div className="flex justify-between text-coral">
                  <dt className="text-content-muted">
                    Promoções vigentes
                  </dt>
                  <dd className="font-medium">
                    −
                    {formatPrice(
                      confirmada.totais.valorPromocao,
                    )}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-content-muted">
                  Frete
                </dt>
                <dd className="font-medium text-content-subtle">
                  {confirmada.totais.frete !== null
                    ? formatPrice(confirmada.totais.frete)
                    : 'A confirmar'}
                </dd>
              </div>
              <div className="border-t border-champagne pt-2 flex justify-between">
                <dt className="font-display font-bold">
                  Total informativo
                </dt>
                <dd className="font-display font-bold text-primary">
                  {formatPrice(
                    confirmada.totais.totalInformativo,
                  )}
                </dd>
              </div>
            </dl>
          </Card>
          <div className="bg-blush rounded-2xl p-5 text-left">
            <p className="text-sm text-soft-black font-medium mb-1">
              Importante
            </p>
            <p className="text-sm text-warm-gray leading-relaxed">
              Esta é uma intenção de compra local. A finalização
              do pedido — com revalidação de preço, promoção e
              estoque pelo servidor — será ativada com a
              integração do backend. Nada foi cobrado.
            </p>
          </div>
          <Button variant="primary" size="lg">
            <Link to="/">Voltar à loja</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (itens.length === 0) {
    return (
      <div className="py-20">
        <div className="container-angel text-center">
          <h2 className="font-display font-bold text-2xl text-soft-black mb-4">
            Carrinho vazio
          </h2>
          <p className="text-warm-gray mb-6">
            Adicione itens antes de finalizar a compra.
          </p>
          <Button variant="primary" size="lg">
            <Link to="/produtos">Ver produtos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-angel">
        <h1 className="font-display font-bold text-3xl text-soft-black mb-2">
          Checkout
        </h1>
        <p className="text-warm-gray mb-8">
          Finalize sua compra. Os valores exibidos são
          informativos até a confirmação do servidor.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">
                Identificação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome completo"
                  value={nome}
                  onChange={(evento) =>
                    setNome(evento.target.value)
                  }
                  placeholder="Seu nome"
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(evento) =>
                    setEmail(evento.target.value)
                  }
                  placeholder="seu@email.com"
                  error={
                    email.trim() !== '' && !emailValido
                      ? 'E-mail inválido.'
                      : undefined
                  }
                  required
                />
                <Input
                  label="WhatsApp"
                  value={whatsapp}
                  onChange={(evento) =>
                    setWhatsapp(evento.target.value)
                  }
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">
                Entrega
              </h2>
              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setModalidade('entrega')}
                  className={
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-colors ' +
                    (modalidade === 'entrega'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-champagne text-content-muted hover:border-primary')
                  }
                >
                  <Truck size={18} /> Entrega
                </button>
                <button
                  type="button"
                  onClick={() => setModalidade('retirada')}
                  className={
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-colors ' +
                    (modalidade === 'retirada'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-champagne text-content-muted hover:border-primary')
                  }
                >
                  <MapPin size={18} /> Retirada na loja
                </button>
              </div>

              {modalidade === 'entrega' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        label="CEP"
                        value={cep}
                        onChange={(evento) =>
                          setCep(
                            evento.target.value.replace(
                              /\D/g,
                              '',
                            ).slice(0, 8),
                          )
                        }
                        onBlur={aoBuscarCEP}
                        placeholder="00000-000"
                        required
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="md"
                      className="mt-6"
                      onClick={aoBuscarCEP}
                      disabled={cep.length !== 8 || cepLoading}
                    >
                      {cepLoading ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                  {cepError && (
                    <div className="flex items-center gap-2 text-sm text-coral">
                      <AlertCircle size={16} />
                      <span>{cepError}</span>
                    </div>
                  )}
                  <Input
                    label="Rua"
                    value={rua}
                    onChange={(evento) =>
                      setRua(evento.target.value)
                    }
                    placeholder="Nome da rua"
                    required
                  />
                  <Input
                    label="Bairro"
                    value={bairro}
                    onChange={(evento) =>
                      setBairro(evento.target.value)
                    }
                    placeholder="Nome do bairro"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número"
                      value={numero}
                      onChange={(evento) =>
                        setNumero(evento.target.value)
                      }
                      placeholder="123"
                      required
                    />
                    <Input
                      label="Complemento"
                      value={complemento}
                      onChange={(evento) =>
                        setComplemento(evento.target.value)
                      }
                      placeholder="Apto 45"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Cidade"
                      value={cidade}
                      onChange={(evento) =>
                        setCidade(evento.target.value)
                      }
                      placeholder="Sua cidade"
                      required
                    />
                    <Input
                      label="Estado"
                      value={estado}
                      onChange={(evento) =>
                        setEstado(evento.target.value)
                      }
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>
              )}
              {modalidade === 'retirada' && (
                <p className="text-sm text-content-muted leading-relaxed">
                  Retirada na loja ANGEL — o endereço de
                  cobrança será confirmado na finalização com
                  a equipe.
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">
                Forma de pagamento
              </h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMetodo('pix')
                    setParcelas(1)
                  }}
                  className={
                    'flex w-full items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ' +
                    (metodo === 'pix'
                      ? 'border-primary bg-primary/5'
                      : 'border-champagne hover:border-primary')
                  }
                >
                  <QrCode size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-soft-black">
                      Pix
                    </p>
                    <p className="text-sm text-warm-gray">
                      Pagamento instantâneo
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodo('cartao')}
                  className={
                    'flex w-full items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ' +
                    (metodo === 'cartao'
                      ? 'border-primary bg-primary/5'
                      : 'border-champagne hover:border-primary')
                  }
                >
                  <CreditCard size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-soft-black">
                      Cartão de crédito
                    </p>
                    <p className="text-sm text-warm-gray">
                      Parcelamento confirmado na finalização
                    </p>
                  </div>
                </button>
                {metodo === 'cartao' && (
                  <div className="pl-4">
                    <label className="block text-sm font-medium text-warm-gray mb-2">
                      Parcelas (informativo)
                    </label>
                    <select
                      value={parcelas}
                      onChange={(evento) =>
                        setParcelas(
                          Number(evento.target.value),
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-primary"
                    >
                      {Array.from(
                        { length: 12 },
                        (_, indice) => indice + 1,
                      ).map((quantidade) => (
                        <option
                          key={quantidade}
                          value={quantidade}
                        >
                          {quantidade}x
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">
                Resumo comercial
              </h2>
              <ul className="divide-y divide-champagne mb-4">
                {itens.map((item) => (
                  <li
                    key={`${item.produto.id}-${item.varianteId ?? ''}`}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blush overflow-hidden shrink-0">
                      <ProdutoImagem
                        src={item.produto.imagem}
                        alt={item.produto.nome}
                        imgClassName="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.produto.nome}
                      </p>
                      <p className="text-xs text-content-subtle">
                        Qtd {item.quantidade}
                        {item.varianteSku
                          ? ` · ${item.varianteSku}`
                          : ''}
                      </p>
                    </div>
                    <span className="font-medium text-sm">
                      {formatPrice(
                        item.precoUnitario * item.quantidade,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 text-sm border-t border-champagne pt-3">
                <div className="flex justify-between">
                  <dt className="text-content-muted">
                    Subtotal
                  </dt>
                  <dd className="font-medium">
                    {formatPrice(base)}
                  </dd>
                </div>
                {promocao > 0 && (
                  <div className="flex justify-between text-coral">
                    <dt className="text-content-muted">
                      Promoções vigentes
                    </dt>
                    <dd className="font-medium">
                      −{formatPrice(promocao)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-content-muted">
                    Frete
                  </dt>
                  {frete.tipo === 'gratis' ? (
                    <dd className="font-medium text-primary">
                      {frete.rotulo}
                    </dd>
                  ) : (
                    <dd className="font-medium text-content-subtle">
                      {frete.rotulo}
                    </dd>
                  )}
                </div>
                <div className="flex justify-between pt-2 border-t border-champagne">
                  <dt className="font-display font-bold text-lg">
                    Total informativo
                  </dt>
                  <dd className="font-display font-bold text-2xl text-primary">
                    {formatPrice(totalInformativo)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-content-subtle leading-relaxed">
                O servidor revalida preço, promoção e estoque
                antes de confirmar o pedido. Kits têm
                disponibilidade dos componentes verificada
                na finalização.
              </p>
            </Card>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!prontoParaConfirmar}
              onClick={confirmar}
            >
              <CheckCircle size={20} />
              Registrar intenção de compra
            </Button>
            {!prontoParaConfirmar && (
              <p className="text-xs text-content-subtle text-center">
                Preencha identificação e entrega para
                registrar.
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-warm-gray">
              <Shield size={16} />
              <span>Seus dados são usados apenas para a compra</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
