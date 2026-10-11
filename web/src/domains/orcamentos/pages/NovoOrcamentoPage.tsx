import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MessageCircle,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/dashboard/Card'
import { QuantitySelector } from '@/components/commerce/QuantitySelector'
import { cn, formatPrice } from '@/lib/utils'
import { useProdutos } from '@/domains/produtos/hooks/useProdutos'
import { ProdutoImagem } from '@/domains/produtos/components/ProdutoImagem'
import { ProdutoVarianteSelector } from '@/domains/produtos/components/ProdutoVarianteSelector'
import {
  imagemOuFallback,
  precoBase,
  precoOfertado,
  rotuloDisponibilidade,
  type AtributoTipo,
  type Produto,
  type ProdutoVariante,
} from '@/domains/produtos/model/produto'
import { useCriarOrcamento } from '../hooks/useOrcamentos'
import { atendimentoHref } from '@/domains/atendimento/model/atendimento'
import {
  calcularTotais,
  itemJaNoOrcamento,
  type OrcamentoCliente,
  type OrcamentoItem,
} from '../model/orcamento'

const ETAPAS = [
  'Produtos',
  'Variantes e quantidades',
  'Observações',
  'Sua identificação',
  'Resumo',
]

const ROTULOS_ATRIBUTO: Record<AtributoTipo, string> = {
  tamanho: 'Tamanho',
  cor: 'Cor',
  volume: 'Volume',
}

interface StateDeepLink {
  slug?: string
  varianteId?: string
  quantidade?: number
}

export function NovoOrcamentoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: produtos = [] } = useProdutos()
  const criarOrcamento = useCriarOrcamento()

  const [etapa, setEtapa] = useState(0)
  const [itens, setItens] = useState<OrcamentoItem[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [busca, setBusca] = useState('')
  const [cliente, setCliente] = useState<OrcamentoCliente>({
    nome: '',
    whatsapp: '',
    email: '',
  })
  const [protocoloCriado, setProtocoloCriado] = useState<string | null>(null)

  const catalogo = useMemo(() => {
    const mapa = new Map<string, Produto>()
    for (const produto of produtos) mapa.set(produto.slug, produto)
    return mapa
  }, [produtos])

  // Deep-link: /produtos/:slug → "Solicitar orçamento"
  // pré-seleciona o produto visitado.
  const deepLink = location.state as StateDeepLink | null
  useEffect(() => {
    const slug = deepLink?.slug
    if (!slug || !catalogo.has(slug)) return
    const produto = catalogo.get(slug)!
    setItens((anteriores) => {
      if (itemJaNoOrcamento(anteriores, produto.id, null) >= 0) {
        return anteriores
      }
      const variante =
        deepLink.varianteId !== undefined
          ? (produto.variantes.find(
                (v) => v.id === deepLink.varianteId && v.ativo,
              ) ?? null)
          : varianteUnica(produto)
      return [
        ...anteriores,
        montarItem(produto, variante, deepLink.quantidade ?? 1),
      ]
    })
    navigate('/orcamentos/novo', { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo])

  const resultados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return produtos
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(termo),
    )
  }, [produtos, busca])

  const totais = calcularTotais(itens, null)

  const adicionarProduto = (produto: Produto) => {
    setItens((anteriores) => {
      if (itemJaNoOrcamento(anteriores, produto.id, null) >= 0) {
        return anteriores
      }
      return [...anteriores, montarItem(produto, varianteUnica(produto), 1)]
    })
  }

  const atualizarVariante = (
    produtoId: string,
    variante: ProdutoVariante | null,
  ) => {
    setItens((anteriores) =>
      anteriores.map((item) => {
        if (item.produto.id !== produtoId) return item
        const produto = catalogo.get(item.produto.slug)
        if (!produto) return item
        return montarItem(produto, variante, item.quantidade)
      }),
    )
  }

  const atualizarQuantidade = (produtoId: string, quantidade: number) => {
    setItens((anteriores) =>
      anteriores.map((item) =>
        item.produto.id === produtoId
          ? { ...item, quantidade: Math.max(1, quantidade) }
          : item,
      ),
    )
  }

  const removerItem = (produtoId: string) => {
    setItens((anteriores) =>
      anteriores.filter((item) => item.produto.id !== produtoId),
    )
  }

  const identificacaoValida =
    cliente.nome.trim() !== '' &&
    cliente.whatsapp.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email.trim())

  const proximaEtapa = () =>
    setEtapa((atual) => Math.min(atual + 1, ETAPAS.length - 1))
  const etapaAnterior = () => setEtapa((atual) => Math.max(atual - 1, 0))

  const solicitar = () => {
    criarOrcamento.mutate(
      {
        cliente: {
          nome: cliente.nome.trim(),
          whatsapp: cliente.whatsapp.trim(),
          email: cliente.email.trim(),
        },
        itens,
        observacoes: observacoes.trim() === '' ? null : observacoes.trim(),
        validade: null,
      },
      {
        onSuccess: (orcamento) => {
          setProtocoloCriado(orcamento.protocolo)
        },
      },
    )
  }

  if (protocoloCriado) {
    return (
      <div className="py-16">
        <div className="container-angel max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check size={32} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-4xl text-soft-black">
            Orçamento solicitado
          </h1>
          <p className="text-warm-gray leading-relaxed">
            Protocolo{' '}
            <span className="font-semibold text-soft-black">
              {protocoloCriado}
            </span>
            . Nossa equipe ANGEL analisará os itens, as quantidades e a
            disponibilidade, e retornará em até 24 horas úteis com a
            proposta comercial — incluindo condições de pagamento e, quando
            aplicável, descontos comerciais autorizados.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              Voltar à loja
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                navigate(
                  atendimentoHref(
                    'pedido-orcamento',
                    protocoloCriado ?? undefined,
                  ),
                )
              }
            >
              <MessageCircle size={18} /> Dúvida
              sobre este orçamento
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setProtocoloCriado(null)
                setEtapa(0)
                setItens([])
                setObservacoes('')
                setCliente({ nome: '', whatsapp: '', email: '' })
              }}
            >
              Novo orçamento
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-angel max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display font-bold text-4xl text-soft-black mb-2">
            Solicite um orçamento
          </h1>
          <p className="text-warm-gray">
            Monte sua seleção de produtos, quantidades e observações.
            A proposta comercial é preparada pela equipe ANGEL.
          </p>
        </header>

        <ol className="flex flex-wrap items-center gap-2 mb-8" aria-label="Etapas do orçamento">
          {ETAPAS.map((rotulo, indice) => (
            <li key={rotulo} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => indice < etapa && setEtapa(indice)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  indice === etapa
                    ? 'bg-primary text-primary-contrast'
                    : indice < etapa
                      ? 'bg-primary/10 text-primary cursor-pointer'
                      : 'bg-surface-sunken text-content-subtle',
                )}
                disabled={indice > etapa}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                    indice < etapa
                      ? 'bg-primary text-primary-contrast'
                      : 'bg-surface text-content-subtle',
                  )}
                >
                  {indice < etapa ? <Check size={12} /> : indice + 1}
                </span>
                {rotulo}
              </button>
              {indice < ETAPAS.length - 1 && (
                <span className="h-px w-4 bg-champagne" aria-hidden />
              )}
            </li>
          ))}
        </ol>

        {etapa === 0 && (
          <section aria-label="Escolha os produtos">
            <div className="relative mb-6">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-content-subtle"
                aria-hidden
              />
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar produtos para o orçamento"
                className="w-full rounded-lg border-2 border-champagne bg-ivory py-3 pl-12 pr-4 focus:outline-none focus:border-primary"
                aria-label="Buscar produtos"
              />
            </div>

            {resultados.length === 0 ? (
              <Card className="text-center py-12 text-warm-gray">
                <Package size={32} className="mx-auto mb-3 opacity-50" />
                Nenhum produto encontrado para &quot;{busca}&quot;.
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {resultados.map((produto) => {
                  const adicionado =
                    itemJaNoOrcamento(itens, produto.id, null) >= 0
                  return (
                    <Card key={produto.id} className="p-4 flex flex-col">
                      <Link
                        to={`/produtos/${produto.slug}`}
                        className="block mb-3"
                      >
                        <div className="aspect-square overflow-hidden rounded-lg bg-surface-sunken">
                          <ProdutoImagem
                            src={imagemOuFallback(produto)}
                            alt={produto.nome}
                            imgClassName="h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                      <h3 className="font-medium text-soft-black text-sm leading-snug mb-1">
                        {produto.nome}
                      </h3>
                      <p className="text-xs text-content-subtle mb-3">
                        {rotuloDisponibilidade(produto)}
                      </p>
                      <Button
                        variant={adicionado ? 'ghost' : 'outline'}
                        size="sm"
                        className="mt-auto"
                        disabled={adicionado}
                        onClick={() => adicionarProduto(produto)}
                      >
                        {adicionado ? (
                          <>
                            <Check size={16} /> Na seleção
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> Adicionar
                          </>
                        )}
                      </Button>
                    </Card>
                  )
                })}
              </div>
            )}

            <footer className="mt-8 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                disabled={itens.length === 0}
                onClick={proximaEtapa}
              >
                Continuar <ArrowRight size={18} />
              </Button>
            </footer>
          </section>
        )}

        {etapa === 1 && (
          <section aria-label="Variantes e quantidades" className="space-y-4">
            {itens.map((item) => {
              const produto = catalogo.get(item.produto.slug)
              const variantesAtivas =
                produto?.variantes.filter((v) => v.ativo) ?? []
              const variante =
                variantesAtivas.find((v) => v.id === item.varianteId) ?? null
              return (
                <Card key={item.produto.id} className="p-5">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-sunken shrink-0">
                      <ProdutoImagem
                        src={item.produto.imagem ?? imagemOuFallback(produto!)}
                        alt={item.produto.nome}
                        imgClassName="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/produtos/${item.produto.slug}`}
                            className="font-semibold text-soft-black hover:text-primary transition-colors"
                          >
                            {item.produto.nome}
                          </Link>
                          {item.varianteSku && (
                            <p className="text-xs text-content-subtle mt-0.5">
                              SKU: {item.varianteSku}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removerItem(item.produto.id)}
                          className="text-content-subtle hover:text-coral transition-colors p-1"
                          aria-label={`Remover ${item.produto.nome}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {variantesAtivas.length > 0 && (
                        <div className="mt-4">
                          <ProdutoVarianteSelector
                            variantes={variantesAtivas}
                            selecionada={variante}
                            onSelect={(selecionada) =>
                              atualizarVariante(item.produto.id, selecionada)
                            }
                          />
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-champagne pt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-content-muted">
                            Quantidade
                          </span>
                          <QuantitySelector
                            value={item.quantidade}
                            onChange={(valor) =>
                              atualizarQuantidade(item.produto.id, valor)
                            }
                            min={1}
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-content-subtle">
                            {formatPrice(item.precoUnitario)} cada
                          </p>
                          <p className="font-display font-bold text-lg text-primary">
                            {formatPrice(item.precoUnitario * item.quantidade)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}

            <footer className="mt-8 flex items-center justify-between">
              <Button variant="ghost" size="lg" onClick={etapaAnterior}>
                <ArrowLeft size={18} /> Voltar
              </Button>
              <Button variant="primary" size="lg" onClick={proximaEtapa}>
                Continuar <ArrowRight size={18} />
              </Button>
            </footer>
          </section>
        )}

        {etapa === 2 && (
          <section aria-label="Observações">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-1">
                Observações
              </h2>
              <p className="text-sm text-content-muted mb-4">
                Prazo de entrega, personalizações, embalagem para presente,
                quantidade por cor/tamanho — tudo que a equipe ANGEL deve
                saber antes de preparar a proposta.
              </p>
              <textarea
                value={observacoes}
                onChange={(evento) => setObservacoes(evento.target.value)}
                rows={6}
                placeholder="Ex.: preciso para 15/12; embalar para presente; prefiro cores terrosas."
                className="w-full px-4 py-3 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-primary resize-none"
                aria-label="Observações do orçamento"
              />
            </Card>

            <footer className="mt-8 flex items-center justify-between">
              <Button variant="ghost" size="lg" onClick={etapaAnterior}>
                <ArrowLeft size={18} /> Voltar
              </Button>
              <Button variant="primary" size="lg" onClick={proximaEtapa}>
                Continuar <ArrowRight size={18} />
              </Button>
            </footer>
          </section>
        )}

        {etapa === 3 && (
          <section aria-label="Sua identificação">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-1">
                Como vamos te chamar?
              </h2>
              <p className="text-sm text-content-muted mb-5">
                A proposta é enviada para o e-mail e o WhatsApp informados.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome completo"
                  placeholder="Seu nome"
                  value={cliente.nome}
                  onChange={(evento) =>
                    setCliente({ ...cliente, nome: evento.target.value })
                  }
                  required
                />
                <Input
                  label="WhatsApp"
                  placeholder="(11) 99999-9999"
                  value={cliente.whatsapp}
                  onChange={(evento) =>
                    setCliente({ ...cliente, whatsapp: evento.target.value })
                  }
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={cliente.email}
                  onChange={(evento) =>
                    setCliente({ ...cliente, email: evento.target.value })
                  }
                  error={
                    cliente.email.trim() !== '' &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email.trim())
                      ? 'E-mail inválido.'
                      : undefined
                  }
                  required
                />
              </div>
            </Card>

            <footer className="mt-8 flex items-center justify-between">
              <Button variant="ghost" size="lg" onClick={etapaAnterior}>
                <ArrowLeft size={18} /> Voltar
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!identificacaoValida}
                onClick={proximaEtapa}
              >
                Ver resumo <ArrowRight size={18} />
              </Button>
            </footer>
          </section>
        )}

        {etapa === 4 && (
          <section aria-label="Resumo do orçamento">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-6">
                  <h2 className="font-display font-semibold text-lg mb-4">
                    Itens selecionados
                  </h2>
                  <ul className="divide-y divide-champagne">
                    {itens.map((item) => (
                      <li
                        key={`${item.produto.id}-${item.varianteId ?? 'unico'}`}
                        className="py-3 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-sunken shrink-0">
                          <ProdutoImagem
                            src={item.produto.imagem!}
                            alt={item.produto.nome}
                            imgClassName="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-soft-black text-sm">
                            {item.produto.nome}
                          </p>
                          <p className="text-xs text-content-subtle">
                            Qtd {item.quantidade}
                            {item.atributosTexto ? ` · ${item.atributosTexto}` : ''}
                          </p>
                        </div>
                        <p className="font-medium text-soft-black">
                          {formatPrice(item.precoUnitario * item.quantidade)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h2 className="font-display font-semibold text-lg mb-3">
                    Observações
                  </h2>
                  <p className="text-sm text-content-muted whitespace-pre-wrap">
                    {observacoes.trim() || 'Nenhuma observação.'}
                  </p>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="p-6">
                  <h2 className="font-display font-semibold text-lg mb-4">
                    Resumo dos valores
                  </h2>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-content-muted">
                        Subtotal (preço base)
                      </dt>
                      <dd className="font-medium">
                        {formatPrice(totais.subtotal)}
                      </dd>
                    </div>
                    {totais.valorPromocao > 0 && (
                      <div className="flex justify-between text-coral">
                        <dt className="text-content-muted">
                          Promoção vigente
                        </dt>
                        <dd className="font-medium">
                          −{formatPrice(totais.valorPromocao)}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-content-muted">
                        Subtotal com ofertas
                      </dt>
                      <dd className="font-medium">
                        {formatPrice(totais.subtotalOfertado)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-content-muted">Frete</dt>
                      <dd className="font-medium text-content-subtle">
                        A calcular na proposta
                      </dd>
                    </div>
                    <div className="border-t border-champagne pt-3 flex justify-between items-baseline">
                      <dt className="font-display font-bold text-lg">Total</dt>
                      <dd className="font-display font-bold text-2xl text-primary">
                        {formatPrice(totais.total)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-content-subtle leading-relaxed">
                    Descontos comerciais não são escolhidos no checkout: são
                    analisados e autorizados pela equipe ANGEL na proposta.
                  </p>
                </Card>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={criarOrcamento.isPending}
                    onClick={solicitar}
                  >
                    <FileText size={20} />
                    {criarOrcamento.isPending
                      ? 'Solicitando...'
                      : 'Solicitar orçamento'}
                  </Button>
                  {criarOrcamento.isError && (
                    <p className="text-sm text-coral text-center">
                      Não foi possível registrar a solicitação. Tente novamente.
                    </p>
                  )}
                  <Button variant="ghost" size="lg" onClick={etapaAnterior}>
                    <ArrowLeft size={18} /> Editar orçamento
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function varianteUnica(produto: Produto): ProdutoVariante | null {
  const ativas = produto.variantes.filter((v) => v.ativo)
  return ativas.length === 1 ? ativas[0] : null
}

function atributosParaTexto(variante: ProdutoVariante): string {
  return variante.atributos
    .map((atributo) => `${ROTULOS_ATRIBUTO[atributo.tipo]}: ${atributo.valor}`)
    .join(' · ')
}

function montarItem(
  produto: Produto,
  variante: ProdutoVariante | null,
  quantidade: number,
): OrcamentoItem {
  return {
    produto: {
      id: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      preco: produto.precoBase,
      imagem: imagemOuFallback(produto),
    },
    varianteId: variante?.id ?? null,
    varianteSku: variante?.sku ?? null,
    atributosTexto: variante ? atributosParaTexto(variante) : null,
    quantidade,
    precoBaseUnitario: precoBase(produto, variante),
    precoUnitario: precoOfertado(produto, variante),
  }
}
