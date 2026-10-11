import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'

/**
 * Contrato do dashboard:
 *
 *   nunca número inventado. Só a
 *   contagem real de produtos tem
 *   valor; o resto é "—" até a
 *   integração.
 */

const hookMock = vi.hoisted(() => ({
  valor: {
    data: undefined as
      | {
          estado: string
          produtos: Array<{ id: string }>
        }
      | undefined,
    error: null as unknown,
    isLoading: false,
    refetch: vi.fn(),
  },
}))

vi.mock('../hooks/useAdminProdutos', () => ({
  useAdminProdutos: () => hookMock.valor,
}))

vi.mock('../context/AdminPermissionContext', () => ({
  useAdminPermissao: () => ({
    estado: 'pendente',
    motivo:
      'Permissões reais chegam com o RBAC na integração do backend',
  }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    hookMock.valor = {
      data: undefined,
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    }
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('não integrado: KPIs "—" e aviso honesto', () => {
    hookMock.valor.data = {
      estado: 'nao-integrado',
      produtos: [],
    }
    renderPage()
    expect(
      screen.getByText(
        /Backend não integrado/i,
      ),
    ).toBeDefined()
    // Nada é simulado: sem número,
    // só "—".
    expect(
      screen.getAllByText('—').length,
    ).toBe(4)
    // Nota honesta em todo KPI
    // sem autoridade.
    expect(
      screen
        .getAllByText('Após a integração')
        .length,
    ).toBe(4)
  })

  it('conectado: contagem real de produtos', () => {
    hookMock.valor.data = {
      estado: 'conectado',
      produtos: [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ],
    }
    renderPage()
    // Contagem real do banco: o único
    // número com autoridade hoje.
    const contagem = screen.getByText('3')
    expect(contagem).toBeDefined()
    expect(
      screen.getByText(/Dados de desenvolvimento presentes/i),
    ).toBeDefined()
  })

  it('erro real: aviso com retry', () => {
    hookMock.valor.error = new Error('falha')
    renderPage()
    expect(
      screen.getByText(
        /Não foi possível carregar os dados administrativos/i,
      ),
    ).toBeDefined()
    expect(
      screen.getByRole('button', {
        name: /tentar novamente/i,
      }),
    ).toBeDefined()
  })

  it('atalhos: só rotas reais são links', () => {
    hookMock.valor.data = {
      estado: 'conectado',
      produtos: [],
    }
    renderPage()
    const link = screen.getByRole('link', {
      name: /catálogo de produtos/i,
    })
    expect(link.getAttribute('href')).toBe(
      '/admin/produtos',
    )
    // Módulos previstos não são
    // link: 3 atalhos "em breve".
    expect(
      screen
        .getAllByText(
          /Em breve — após a integração/i,
        )
        .length,
    ).toBe(3)
  })
})
