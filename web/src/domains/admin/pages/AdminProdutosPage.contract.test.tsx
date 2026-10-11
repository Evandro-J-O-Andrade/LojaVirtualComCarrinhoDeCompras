import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminProdutosPage } from './AdminProdutosPage'
import type { Produto } from '@/domains/produtos/model/produto'

/**
 * Contrato de /admin/produtos:
 *
 *   nao-integrado -> "disponível
 *     após integração"
 *   erro          -> erro + retry
 *   conectado     -> tabela real,
 *     busca e filtros funcionam,
 *     ações de escrita indisponíveis
 */

const hookMock = vi.hoisted(() => ({
  valor: {
    data: undefined as
      | {
          estado: string
          produtos: Produto[]
        }
      | undefined,
    error: null as unknown,
    isLoading: false,
    refetch: vi.fn(),
  },
  categorias: [] as Array<{
    id: string
    nome: string
    slug: string
  }>,
}))

vi.mock('../hooks/useAdminProdutos', () => ({
  useAdminProdutos: () => hookMock.valor,
  useAdminCategorias: () => ({
    data: hookMock.categorias,
  }),
  estadoAdminProdutos: (
    resultado: unknown,
    erro: unknown,
  ) =>
    erro
      ? 'erro'
      : (resultado as { estado?: string } | undefined)
          ?.estado ?? 'nao-integrado',
}))

const permissaoMock = vi.hoisted(() => ({
  pode: vi.fn(() => false),
  motivo: 'Permissões reais chegam com o RBAC na integração do backend',
}))

vi.mock('../context/AdminPermissionContext', () => ({
  useAdminPermissao: () => ({
    estado: 'pendente',
    pode: permissaoMock.pode,
    motivo: permissaoMock.motivo,
  }),
}))

const PRODUTOS: Produto[] = [
  {
    id: '1',
    sku: 'SER-30',
    nome: 'Serum 30ml',
    slug: 'serum-30ml',
    descricao: null,
    precoBase: 129.9,
    imagens: [],
    video: null,
    beneficio: null,
    historia: null,
    categorias: [],
    fornecedor: null,
    variantes: [],
    promocoes: [],
    estoque: { disponivel: 12 },
    avaliacao: null,
    comoUsar: null,
    informacoes: null,
    composicao: [],
    ativo: true,
    source: 'supabase',
  },
  {
    id: '2',
    sku: 'KIT-01',
    nome: 'Kit Maquiagem',
    slug: 'kit-maquiagem',
    descricao: null,
    precoBase: 299.9,
    imagens: [],
    video: null,
    beneficio: null,
    historia: null,
    categorias: [],
    fornecedor: null,
    variantes: [],
    promocoes: [],
    estoque: null,
    avaliacao: null,
    comoUsar: null,
    informacoes: null,
    composicao: [],
    ativo: false,
    source: 'supabase',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProdutosPage />
    </MemoryRouter>,
  )
}

describe('AdminProdutosPage', () => {
  beforeEach(() => {
    hookMock.valor = {
      data: undefined,
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    }
    permissaoMock.pode.mockReturnValue(false)
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('não integrado: dado disponível após integração', () => {
    renderPage()
    expect(
      screen.getByText(
        /Dados de produtos disponíveis após integração/i,
      ),
    ).toBeDefined()
    expect(
      screen.queryByText('Serum 30ml'),
    ).toBeNull()
  })

  it('erro real: mensagem e retry', () => {
    hookMock.valor.error = new Error('falha')
    renderPage()
    expect(
      screen.getByText(
        /Não foi possível carregar produtos/i,
      ),
    ).toBeDefined()
    const botao = screen.getByRole('button', {
      name: /tentar novamente/i,
    })
    expect(botao).toBeDefined()
  })

  it('conectado: tabela real com imagem, preço e estoque', () => {
    hookMock.valor.data = {
      estado: 'conectado',
      produtos: PRODUTOS,
    }
    renderPage()
    expect(
      screen.getByText('Serum 30ml'),
    ).toBeDefined()
    expect(
      screen.getByText('Kit Maquiagem'),
    ).toBeDefined()
    expect(screen.getByText('SER-30')).toBeDefined()
    expect(screen.getByText('12')).toBeDefined()
    expect(
      screen.getByText('Ativo'),
    ).toBeDefined()
    expect(
      screen.getByText('Inativo'),
    ).toBeDefined()
  })

  it('busca filtra por nome e SKU', async () => {
    hookMock.valor.data = {
      estado: 'conectado',
      produtos: PRODUTOS,
    }
    const usuario = userEvent.setup()
    renderPage()

    await usuario.type(
      screen.getByLabelText(/buscar produtos/i),
      'SER-30',
    )
    expect(
      screen.getByText('Serum 30ml'),
    ).toBeDefined()
    expect(
      screen.queryByText('Kit Maquiagem'),
    ).toBeNull()
  })

  it('filtro de status mostra só inativos', async () => {
    hookMock.valor.data = {
      estado: 'conectado',
      produtos: PRODUTOS,
    }
    const usuario = userEvent.setup()
    renderPage()

    await usuario.selectOptions(
      screen.getByLabelText(/filtrar por status/i),
      'inativo',
    )
    expect(
      screen.queryByText('Serum 30ml'),
    ).toBeNull()
    expect(
      screen.getByText('Kit Maquiagem'),
    ).toBeDefined()
  })

  it('ação de escrita fica indisponível com o motivo', () => {
    hookMock.valor.data = {
      estado: 'conectado',
      produtos: PRODUTOS,
    }
    renderPage()
    const botao = screen.getByRole('button', {
      name: /novo produto/i,
    }) as HTMLButtonElement
    expect(botao.disabled).toBe(true)
    expect(botao.getAttribute('title')).toContain(
      'RBAC',
    )
  })
})
