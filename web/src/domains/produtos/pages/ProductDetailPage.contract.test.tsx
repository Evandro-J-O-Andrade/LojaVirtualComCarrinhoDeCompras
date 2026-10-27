import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProductDetailPage } from './ProductDetailPage'
import { precoOfertado } from '../model/produto'
import type { Produto, ProdutoVariante } from '../model/produto'
import { formatPrice } from '@/lib/utils'

/**
 * Contrato do detalhe do produto — quantidade:
 *
 *   +/− recalcula o total da seleção NA HORA
 *   Comprar adiciona a quantidade efetiva
 */

const { PRODUTO } = vi.hoisted(() => {
  const produto: Produto = {
    id: 'editorial-batom-liquido-matte',
    sku: 'ANG-BAT-001',
    nome: 'Batom Líquido Matte',
    slug: 'batom-liquido-matte',
    descricao: 'Descrição real do produto.',
    precoBase: 34.9,
    imagens: [
      {
        id: 'img1',
        url: '/assets/img/produtos/produto-1.jpg',
        ordem: 0,
        principal: true,
        alt: 'Batom Líquido Matte',
        titulo: null,
      },
    ],
    video: null,
    beneficio: 'Benefício real.',
    historia: 'História real.',
    categorias: [
      { id: 'c1', nome: 'Maquiagem', slug: 'maquiagem' },
    ],
    fornecedor: null,
    variantes: [],
    promocoes: [
      {
        id: 'promo1',
        tipo: 'percentual',
        valor: 15,
        dataInicio: '2026-01-01',
        dataFim: '2026-12-31',
        ativo: true,
      },
    ],
    estoque: { disponivel: 10 },
    avaliacao: { nota: 5, total: 12 },
    comoUsar: null,
    informacoes: null,
    composicao: [],
    ativo: true,
    source: 'editorial',
  }
  return { PRODUTO: produto }
})

const produtoMock = vi.hoisted(() => ({
  resultado: {
    data: PRODUTO,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  },
}))
const carrinhoMock = vi.hoisted(() => ({
  adicionar: vi.fn(),
}))
const favoritosMock = vi.hoisted(() => ({
  isFavorite: vi.fn(() => false),
  toggle: vi.fn(),
}))

vi.mock('../hooks/useProdutos', () => ({
  useProduto: () => produtoMock.resultado,
}))
vi.mock('@/domains/carrinho/context/CarrinhoProvider', () => ({
  useCarrinho: () => carrinhoMock,
}))
vi.mock('@/contexts/FavoritesContext', () => ({
  useFavorites: () => favoritosMock,
}))
vi.mock('../components/ProdutoRelacionados', () => ({
  ProdutoRelacionados: () => null,
}))
vi.mock('../components/ProdutoMimosRelacionados', () => ({
  ProdutoMimosRelacionados: () => null,
}))

function Harness() {
  return (
    <MemoryRouter
      initialEntries={['/produtos/batom-liquido-matte']}
    >
      <Routes>
        <Route
          path="/produtos/:slug"
          element={<ProductDetailPage />}
        />
        <Route
          path="/orcamentos/novo"
          element={<div>orcamento-page</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

function totalDaSelecao(): HTMLElement {
  return screen.getByText(/Total da seleção/)
}

describe('ProductDetailPage — quantidade em tempo real', () => {
  beforeEach(() => {
    carrinhoMock.adicionar.mockReset()
    favoritosMock.isFavorite.mockReturnValue(false)
    produtoMock.resultado.data = PRODUTO
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('total da seleção reflete 1 unidade ao abrir', () => {
    render(<Harness />)
    const total = totalDaSelecao()
    expect(total.textContent).toContain('1 unidade')
    expect(total.textContent).toContain(
      formatPrice(precoOfertado(PRODUTO, null)),
    )
  })

  it('+/− recalcula o total na hora, sem entrar no carrinho', async () => {
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', {
        name: /aumentar quantidade/i,
      }),
    )
    const comDuas = totalDaSelecao()
    expect(comDuas.textContent).toContain('2 unidades')
    expect(comDuas.textContent).toContain(
      formatPrice(precoOfertado(PRODUTO, null) * 2),
    )

    await usuario.click(
      screen.getByRole('button', {
        name: /diminuir quantidade/i,
      }),
    )
    const comUma = totalDaSelecao()
    expect(comUma.textContent).toContain('1 unidade')
    expect(comUma.textContent).toContain(
      formatPrice(precoOfertado(PRODUTO, null)),
    )
  })

  it('comprar adiciona a quantidade efetiva ao carrinho', async () => {
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', {
        name: /aumentar quantidade/i,
      }),
    )
    await usuario.click(
      screen.getByRole('button', { name: /comprar/i }),
    )

    expect(carrinhoMock.adicionar).toHaveBeenCalledWith(
      PRODUTO,
      null,
      2,
    )
  })

  it('exige a seleção de uma variante quando há mais de uma opção ativa', async () => {
    const usuario = userEvent.setup()
    const variantes: ProdutoVariante[] = [
      {
        id: 'v-vermelho',
        sku: 'ANG-TEST-V',
        preco: 35,
        ativo: true,
        peso: null,
        atributos: [{ tipo: 'cor', valor: 'Vermelho' }],
      },
      {
        id: 'v-azul',
        sku: 'ANG-TEST-A',
        preco: 36,
        ativo: true,
        peso: null,
        atributos: [{ tipo: 'cor', valor: 'Azul' }],
      },
    ]
    const produtoComVariantes = { ...PRODUTO, variantes }
    produtoMock.resultado.data = produtoComVariantes
    render(<Harness />)

    const comprar = screen.getByRole('button', { name: /comprar/i })
    expect(comprar).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/selecione as opções/i)

    await usuario.click(screen.getByRole('button', { name: 'Vermelho' }))
    expect(comprar).toBeEnabled()
    await usuario.click(comprar)

    expect(carrinhoMock.adicionar).toHaveBeenCalledWith(
      produtoComVariantes,
      variantes[0],
      1,
    )
  })

  it('comprar adiciona a quantidade efetiva ao carrinho', async () => {
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', {
        name: /aumentar quantidade/i,
      }),
    )
    await usuario.click(
      screen.getByRole('button', { name: /comprar/i }),
    )

    expect(carrinhoMock.adicionar).toHaveBeenCalledWith(
      PRODUTO,
      null,
      2,
    )
  })
})
