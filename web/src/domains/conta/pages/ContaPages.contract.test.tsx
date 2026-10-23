import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ContaPage } from './ContaPage'
import { PerfilPage } from './PerfilPage'
import { PedidosPage } from './PedidosPage'
import { OrcamentosPage } from './OrcamentosPage'
import { AgendamentosPage } from './AgendamentosPage'
import { FavoritosPage } from './FavoritosPage'

/**
 * Contrato das páginas da conta.
 *
 * A regra que atravessa todas: NADA é
 * inventado. Sem backend comercial, não há
 * pedido, orçamento, agendamento, estatística
 * ou telefone — o estado é explícito, não
 * simulado.
 */

const accountMock = vi.hoisted(() => ({
  authenticated: true,
  configurado: true,
  error: null as string | null,
  profile: {
    nome: 'Ana Paula',
    email: 'ana@email.com',
    telefone: null,
  },
  signOut: vi.fn(),
}))

vi.mock('../context/AccountContext', () => ({
  useAccount: () => accountMock,
}))

const favoritosMock = vi.hoisted(() => ({
  items: [10] as (number | string)[],
  clear: vi.fn(),
}))

vi.mock('@/contexts/FavoritesContext', () => ({
  useFavorites: () => favoritosMock,
}))

const produtosMock = vi.hoisted(() => ({
  data: [] as unknown[],
  isLoading: false,
  error: null as unknown,
}))

vi.mock('@/domains/produtos/hooks/useProdutos', () => ({
  useProdutos: () => produtosMock,
}))

function renderizar(ui: React.ReactElement) {
  return render(
    <MemoryRouter>{ui}</MemoryRouter>,
  )
}

describe('páginas da conta', () => {
  beforeEach(() => {
    accountMock.authenticated = true
    accountMock.configurado = true
    accountMock.error = null
    favoritosMock.items = [10]
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('conta: mostra a identidade real e nenhuma estatística inventada', () => {
    renderizar(<ContaPage />)
    expect(
      screen.getByText(/olá, ana paula/i),
    ).toBeDefined()
    expect(screen.getByText('ana@email.com')).toBeDefined()
    // Nada de "0 pedidos" pintado como dado.
    expect(screen.queryByText(/0 pedidos/i)).toBeNull()
    expect(screen.queryByText(/0 orçamentos/i)).toBeNull()
    expect(
      screen.queryByText(/total de pedidos/i),
    ).toBeNull()
  })

  it('conta: as seis seções reais estão acessíveis', () => {
    renderizar(<ContaPage />)
    for (const rotulo of [
      'Perfil',
      'Pedidos',
      'Orçamentos',
      'Agendamentos',
      'Favoritos',
      'Segurança',
    ]) {
      expect(screen.getByText(rotulo)).toBeDefined()
    }
  })

  it('pedidos: estado de indisponibilidade, sem pedido fictício', () => {
    renderizar(<PedidosPage />)
    expect(
      screen.getByText(/nenhum pedido por aqui/i),
    ).toBeDefined()
    expect(
      screen.getByText(/nunca por dados inventados/i),
    ).toBeDefined()
    expect(
      screen.queryByText(/AG-\d+/),
    ).toBeNull()
  })

  it('orçamentos: estado de indisponibilidade, sem orçamento fictício', () => {
    renderizar(<OrcamentosPage />)
    expect(
      screen.getByText(/nenhum orçamento por aqui/i),
    ).toBeDefined()
    expect(
      screen.queryByText(/ORC-\d+/),
    ).toBeNull()
  })

  it('agendamentos: estado de indisponibilidade, sem agendamento fictício', () => {
    renderizar(<AgendamentosPage />)
    expect(
      screen.getByText(/nenhum agendamento por aqui/i),
    ).toBeDefined()
  })

  it('perfil: exibe o que existe e diz o que falta, sem editar', () => {
    renderizar(<PerfilPage />)
    expect(screen.getByText('Ana Paula')).toBeDefined()
    expect(screen.getByText('ana@email.com')).toBeDefined()
    // Telefone não existe ainda: a interface
    // diz isso, não inventa nem habilita
    // edição sem persistência.
    expect(
      screen.getByText(/ainda não informado/i),
    ).toBeDefined()
    expect(
      screen.queryByRole('button', { name: /salvar/i }),
    ).toBeNull()
    expect(
      screen.queryByRole('textbox'),
    ).toBeNull()
  })

  it('favoritos: lista local, separada dos dados comerciais', () => {
    renderizar(<FavoritosPage />)
    expect(
      screen.getByText(/meus favoritos/i),
    ).toBeDefined()
    expect(
      screen.getByText(/neste dispositivo/i),
    ).toBeDefined()
    // A lista local é de produto, não de
    // pedido: nenhum histórico comercial.
    expect(screen.queryByText(/pedido/i)).toBeNull()
  })

  it('favoritos: anônima também pode favoritar', () => {
    accountMock.authenticated = false
    renderizar(<FavoritosPage />)
    expect(
      screen.getByText(/não precisa de conta/i),
    ).toBeDefined()
  })
})
