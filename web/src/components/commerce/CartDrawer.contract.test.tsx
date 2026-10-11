import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CartDrawer } from './CartDrawer'
import type { CarrinhoItem } from '@/domains/carrinho/model/carrinho'

/**
 * Contrato do carrinho lateral:
 *
 *   abre como drawer de verdade (dialog, overlay)
 *   Esc + overlay fecham
 *   +/− recalcula na hora via contexto
 *   Finalizar compra → /checkout
 *   vazio → estado honesto
 */

const carrinhoMock = vi.hoisted(() => ({
  itens: [] as CarrinhoItem[],
  subtotal: 0,
  contagem: 0,
  remover: vi.fn(),
  atualizarQuantidade: vi.fn(),
}))

vi.mock('@/domains/carrinho/context/CarrinhoProvider', () => ({
  useCarrinho: () => carrinhoMock,
}))

const ITEM: CarrinhoItem = {
  produto: {
    id: 'p1',
    slug: 'batom-liquido-matte',
    nome: 'Batom Líquido Matte',
    preco: 34.9,
    imagem: null,
  },
  varianteId: null,
  varianteSku: null,
  atributosTexto: null,
  quantidade: 2,
  precoBaseUnitario: 34.9,
  precoUnitario: 29.67,
  promocao: { rotulo: '15% OFF', dataFim: '2026-12-31' },
  disponibilidade: 'em_estoque',
  composto: false,
}

function Harness() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<CartDrawer />} />
        <Route
          path="/checkout"
          element={<div>checkout-page</div>}
        />
        <Route
          path="/produtos/:slug"
          element={<div>produto-page</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('CartDrawer', () => {
  beforeEach(() => {
    carrinhoMock.itens = []
    carrinhoMock.subtotal = 0
    carrinhoMock.contagem = 0
    carrinhoMock.remover.mockReset()
    carrinhoMock.atualizarQuantidade.mockReset()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('abre como drawer lateral com total da linha e cadeia de preços', async () => {
    carrinhoMock.itens = [ITEM]
    carrinhoMock.subtotal = 59.34
    carrinhoMock.contagem = 2
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', { name: /abrir carrinho/i }),
    )

    expect(
      screen.getByRole('dialog', {
        name: /carrinho de compras/i,
      }),
    ).toBeDefined()
    // Total da linha: 2 × R$ 29,67
    expect(
      screen.getByText(/2 × R\$ 29,67/),
    ).toBeDefined()
    // Cadeia idêntica a /carrinho: base → promoção → total.
    expect(screen.getByText('R$ 69,80')).toBeDefined()
    expect(screen.getByText('−R$ 10,46')).toBeDefined()
    expect(
      screen.getAllByText('R$ 59,34').length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('esc fecha o drawer', async () => {
    carrinhoMock.itens = [ITEM]
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', { name: /abrir carrinho/i }),
    )
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(
      screen.queryByRole('dialog'),
    ).toBeNull()
  })

  it('+/− dispara recalculo imediato no contexto', async () => {
    carrinhoMock.itens = [ITEM]
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', { name: /abrir carrinho/i }),
    )
    await usuario.click(
      screen.getByRole('button', {
        name: /aumentar quantidade de batom líquido matte/i,
      }),
    )
    expect(carrinhoMock.atualizarQuantidade).toHaveBeenCalledWith(
      'p1',
      null,
      3,
    )

    await usuario.click(
      screen.getByRole('button', {
        name: /diminuir quantidade de batom líquido matte/i,
      }),
    )
    expect(carrinhoMock.atualizarQuantidade).toHaveBeenCalledWith(
      'p1',
      null,
      1,
    )
  })

  it('finalizar compra leva ao /checkout de verdade', async () => {
    carrinhoMock.itens = [ITEM]
    carrinhoMock.subtotal = 59.34
    carrinhoMock.contagem = 2
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', { name: /abrir carrinho/i }),
    )
    await usuario.click(
      screen.getByRole('button', { name: /finalizar compra/i }),
    )

    expect(screen.getByText('checkout-page')).toBeDefined()
    expect(
      screen.queryByRole('dialog'),
    ).toBeNull()
  })

  it('carrinho vazio: estado honesto, sem finalização', async () => {
    const usuario = userEvent.setup()
    render(<Harness />)

    await usuario.click(
      screen.getByRole('button', { name: /abrir carrinho/i }),
    )
    expect(
      screen.getByText(/seu carrinho está vazio/i),
    ).toBeDefined()
    expect(
      screen.queryByRole('button', {
        name: /finalizar compra/i,
      }),
    ).toBeNull()
  })
})
