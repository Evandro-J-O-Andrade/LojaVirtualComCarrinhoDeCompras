import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { ProdutoImagem } from '@/domains/produtos/model/produto'
import {
  validarArquivo,
  ProdutoImagemUpload,
} from './ProdutoImagemUpload'

function criarArquivo(
  nome = 'imagem.webp',
  tipo = 'image/webp',
): File {
  const arquivo = new File(['conteudo-fake'], nome, {
    type: tipo,
    lastModified: Date.now(),
  })
  return arquivo
}

Object.defineProperty(File.prototype, 'size', {
  value: 1024,
  writable: true,
})

const baseProps = {
  produtoId: '1',
  imagensExistentes: [] as ProdutoImagem[],
  podeEditar: true,
  motivoPermissao: '',
  carregando: false,
  aoEnviar: vi.fn(),
  aoRemover: vi.fn(),
  aoTogglePrincipal: vi.fn(),
  aoSetCarregando: vi.fn(),
}

describe('validarArquivo', () => {
  it('aceita WebP', () => {
    const arquivo = criarArquivo('foto.webp', 'image/webp')
    expect(validarArquivo(arquivo).valido).toBe(true)
  })

  it('aceita PNG', () => {
    const arquivo = criarArquivo('foto.png', 'image/png')
    expect(validarArquivo(arquivo).valido).toBe(true)
  })

  it('aceita JPEG', () => {
    const arquivo = criarArquivo('foto.jpeg', 'image/jpeg')
    expect(validarArquivo(arquivo).valido).toBe(true)
  })

  it('aceita AVIF', () => {
    const arquivo = criarArquivo('foto.avif', 'image/avif')
    expect(validarArquivo(arquivo).valido).toBe(true)
  })

  it('rejeita tipo não-image', () => {
    const arquivo = criarArquivo('arquivo.pdf', 'application/pdf')
    const resultado = validarArquivo(arquivo)
    expect(resultado.valido).toBe(false)
    expect(resultado.erro).toContain('Formato')
  })

  it('rejeita GIF', () => {
    const arquivo = criarArquivo('animado.gif', 'image/gif')
    const resultado = validarArquivo(arquivo)
    expect(resultado.valido).toBe(false)
    expect(resultado.erro).toContain('Formato')
  })

  it('rejeita arquivo maior que 5MB', () => {
    const arquivo = criarArquivo('grande.webp', 'image/webp', 6 * 1024 * 1024)
    Object.defineProperty(arquivo, 'size', { value: 6 * 1024 * 1024 })
    const resultado = validarArquivo(arquivo)
    expect(resultado.valido).toBe(false)
    expect(resultado.erro).toContain('5 MB')
  })

  it('aceita arquivo exatamente 5MB', () => {
    const arquivo = criarArquivo('limite.webp', 'image/webp')
    Object.defineProperty(arquivo, 'size', { value: 5 * 1024 * 1024 })
    expect(validarArquivo(arquivo).valido).toBe(true)
  })
})

describe('ProdutoImagemUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('mostra mensagem de permissão quando podeEditar é false', () => {
    const motivo = 'Permissões reais chegam com o RBAC'
    render(
      <ProdutoImagemUpload
        {...baseProps}
        podeEditar={false}
        motivoPermissao={motivo}
      />,
    )
    expect(screen.getByText(motivo)).toBeDefined()
  })

  it('não mostra mensagem de permissão quando podeEditar é true', () => {
    const { container } = render(
      <ProdutoImagemUpload {...baseProps} />,
    )
    expect(
      container.querySelector(
        'p.text-xs.text-content-muted',
      ),
    ).toBeNull()
  })

  it('mostra placeholder de arrastar/soltar com ícone', () => {
    render(<ProdutoImagemUpload {...baseProps} />)
    expect(
      screen.getByText(/Selecionar imagens/i),
    ).toBeDefined()
    expect(
      screen.getByText(/WebP, PNG, JPEG ou AVIF/i),
    ).toBeDefined()
  })

  it('mostra pré-visualização de arquivos selecionados', async () => {
    const usuario = userEvent.setup()
    render(<ProdutoImagemUpload {...baseProps} />)

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement
    const arquivo = criarArquivo()
    await usuario.upload(input, arquivo)

    expect(screen.getByText(/Pré-visualização/i)).toBeDefined()
    const miniaturas = screen.getAllByAltText('Pré-visualização')
    expect(miniaturas.length).toBe(1)
  })

  it('mostra erro para arquivo de tipo inválido', async () => {
    render(<ProdutoImagemUpload {...baseProps} />)

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement
    const arquivo = criarArquivo('doc.pdf', 'application/pdf')
    fireEvent.change(input, { target: { files: [arquivo] } })

    expect(
      await screen.findByText(/Formato não suportado/i),
    ).toBeDefined()
  })

  it('chama aoEnviar com arquivos válidos', async () => {
    const usuario = userEvent.setup()
    const aoEnviar = vi.fn().mockResolvedValue(undefined)
    render(
      <ProdutoImagemUpload
        {...baseProps}
        aoEnviar={aoEnviar}
      />,
    )

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement
    const arquivo = criarArquivo()
    await usuario.upload(input, arquivo)

    await usuario.click(
      screen.getByRole('button', { name: /Enviar imagens/i }),
    )

    expect(aoEnviar).toHaveBeenCalledTimes(1)
    expect(aoEnviar).toHaveBeenCalledWith([arquivo])
  })

  it('mostra estado de carregamento durante upload', async () => {
    const usuario = userEvent.setup()
    let resolveUpload: () => void = () => {}

    function TestWrapper() {
      const [carregando, setCarregando] = useState(false)
      const aoEnviar = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveUpload = resolve
          }),
      )
      return (
        <ProdutoImagemUpload
          {...baseProps}
          carregando={carregando}
          aoEnviar={aoEnviar}
          aoSetCarregando={setCarregando}
        />
      )
    }

    render(<TestWrapper />)

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement
    const arquivo = criarArquivo()
    await usuario.upload(input, arquivo)

    await usuario.click(
      screen.getByRole('button', { name: /Enviar imagens/i }),
    )

    expect(
      await screen.findByRole('button', { name: /Enviando/i }),
    ).toBeDefined()

    resolveUpload()
    await vi.waitFor(() => {
      expect(screen.queryByText(/Enviando/i)).toBeNull()
    })
  })

  it('mostra erro quando aoEnviar falha', async () => {
    const usuario = userEvent.setup()
    const aoEnviar = vi
      .fn()
      .mockRejectedValue(new Error('Falha no Storage'))
    const aoSetCarregando = vi.fn()

    render(
      <ProdutoImagemUpload
        {...baseProps}
        aoEnviar={aoEnviar}
        aoSetCarregando={aoSetCarregando}
      />,
    )

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement
    const arquivo = criarArquivo()
    await usuario.upload(input, arquivo)

    await usuario.click(
      screen.getByRole('button', { name: /Enviar imagens/i }),
    )

    expect(
      screen.getByText(/Falha no Storage/i),
    ).toBeDefined()
    expect(aoSetCarregando).toHaveBeenCalledWith(false)
  })

  it('não envia quando podeEditar é false', async () => {
    const usuario = userEvent.setup()
    const aoEnviar = vi.fn()

    render(
      <ProdutoImagemUpload
        {...baseProps}
        podeEditar={false}
        motivoPermissao="Sem permissão"
        aoEnviar={aoEnviar}
      />,
    )

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement

    expect(input.disabled).toBe(true)
    await usuario.upload(input, criarArquivo())

    expect(aoEnviar).not.toHaveBeenCalled()
  })

  it('remove pré-visualização ao clicar em X', async () => {
    const usuario = userEvent.setup()
    render(<ProdutoImagemUpload {...baseProps} />)

    const input = screen.getByLabelText(
      /Selecionar imagens/i,
    ) as HTMLInputElement
    await usuario.upload(input, criarArquivo())

    expect(
      screen.getByText(/Pré-visualização/i),
    ).toBeDefined()

    const botoesRemover = screen.getAllByLabelText(
      /Remover pré-visualização/i,
    )
    await usuario.click(botoesRemover[0]!)

    expect(
      screen.queryByText(/Pré-visualização/i),
    ).toBeNull()
  })

  it('lista imagens existentes com URLs e badges', () => {
    const imagens: ProdutoImagem[] = [
      {
        id: '1',
        url: 'https://exemplo.com/img1.webp',
        ordem: 0,
        principal: true,
        alt: null,
        titulo: null,
      },
      {
        id: '2',
        url: 'https://exemplo.com/img2.webp',
        ordem: 1,
        principal: false,
        alt: null,
        titulo: null,
      },
    ]

    render(
      <ProdutoImagemUpload
        {...baseProps}
        imagensExistentes={imagens}
      />,
    )

    expect(
      screen.getByText('capa'),
    ).toBeDefined()
    expect(
      screen.getAllByText(/Ordem:/i),
    ).toHaveLength(2)
  })

  it('chama aoRemover ao clicar no ícone de lixeira', async () => {
    const usuario = userEvent.setup()
    const aoRemover = vi.fn()

    const imagens: ProdutoImagem[] = [
      {
        id: '1',
        url: 'https://exemplo.com/img.webp',
        ordem: 0,
        principal: true,
        alt: null,
        titulo: null,
      },
    ]

    render(
      <ProdutoImagemUpload
        {...baseProps}
        imagensExistentes={imagens}
        aoRemover={aoRemover}
      />,
    )

    await usuario.click(
      screen.getByLabelText(/^Remover /i),
    )

    expect(aoRemover).toHaveBeenCalledWith(
      '1',
      'https://exemplo.com/img.webp',
    )
  })

  it('chama aoTogglePrincipal ao clicar no ícone de capa', async () => {
    const usuario = userEvent.setup()
    const aoTogglePrincipal = vi.fn()

    const imagens: ProdutoImagem[] = [
      {
        id: '1',
        url: 'https://exemplo.com/img.webp',
        ordem: 0,
        principal: false,
        alt: null,
        titulo: null,
      },
    ]

    render(
      <ProdutoImagemUpload
        {...baseProps}
        imagensExistentes={imagens}
        aoTogglePrincipal={aoTogglePrincipal}
      />,
    )

    await usuario.click(
      screen.getByTitle(/Marcar como principal/i),
    )

    expect(aoTogglePrincipal).toHaveBeenCalledWith('1')
  })

  it('mostra "Sem imagens cadastradas" implícito quando lista vazia', () => {
    render(<ProdutoImagemUpload {...baseProps} />)
    expect(
      screen.queryByText('Sem imagens cadastradas.'),
    ).toBeNull()
    expect(
      screen.getByText(/Selecionar imagens/i),
    ).toBeDefined()
  })
})
