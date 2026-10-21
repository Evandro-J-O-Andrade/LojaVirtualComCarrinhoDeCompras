import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProdutoImagemService } from './produtoImagem.service'

function criarArquivo(
  nome = 'imagem.webp',
  tipo = 'image/webp',
): File {
  const arquivo = new File(['conteudo-fake'], nome, {
    type: tipo,
    lastModified: Date.now(),
  })
  Object.defineProperty(arquivo, 'size', { value: 1024 })
  return arquivo
}

const { mockSupabase } = vi.hoisted(() => {
  const apiMock = {
    storage: {
      from: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  }
  return { mockSupabase: apiMock }
})

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('ProdutoImagemService', () => {
  let service: ProdutoImagemService

  beforeEach(() => {
    service = new ProdutoImagemService()
    vi.clearAllMocks()
    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(),
    })
  })

  describe('uploadImagem', () => {
    it('retorna url e storagePath em sucesso', async () => {
      const upload = vi.fn().mockResolvedValue({
        data: { path: 'produto-1/abc.webp' },
        error: null,
      })
      const getPublicUrl = vi.fn().mockReturnValue({
        data: {
          publicUrl:
            'https://bmqxgibhuzekxpcgosap.supabase.co/storage/v1/object/public/product-images/produto-1/abc.webp',
        },
      })
      mockSupabase.storage.from.mockReturnValue({
        upload,
        remove: vi.fn(),
        getPublicUrl,
      })

      const resultado = await service.uploadImagem(
        1,
        criarArquivo(),
      )

      expect(resultado.url).toContain(
        'product-images/produto-1/abc.webp',
      )
      expect(resultado.storagePath).toBe(
        'produto-1/abc.webp',
      )
    })

    it('lança erro quando upload do Storage falha', async () => {
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage offline' },
        }),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })

      await expect(
        service.uploadImagem(1, criarArquivo()),
      ).rejects.toThrow('Storage offline')
    })

    it('lança erro quando data.path é nulo', async () => {
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })

      await expect(
        service.uploadImagem(1, criarArquivo()),
      ).rejects.toThrow('sem resposta do Storage')
    })

    it('usa caminho único com produto-id e uuid', async () => {
      const upload = vi.fn().mockResolvedValue({
        data: { path: 'produto-1/unique-id.webp' },
        error: null,
      })
      mockSupabase.storage.from.mockReturnValue({
        upload,
        remove: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({
          data: {
            publicUrl: 'https://test.supabase.co/storage/v1/object/public/product-images/produto-1/unique-id.webp',
          },
        }),
      })

      await service.uploadImagem(1, criarArquivo())

      const caminhoUsado = upload.mock.calls[0]![0] as string
      expect(caminhoUsado).toMatch(
        /^produto-1\/[0-9a-f-]+\.webp$/,
      )
    })
  })

  describe('uploadMultiplo', () => {
    function setupDbMock(
      insertResult = { data: null, error: null },
      selectResult = { data: { ordem: 2 }, error: null },
    ) {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue(insertResult),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(selectResult),
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      })
    }

    function setupStorageMock(
      uploadImpl: (caminho: string) => unknown,
      removeImpl?: () => unknown,
    ) {
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn().mockImplementation(uploadImpl),
        remove: vi.fn().mockImplementation(removeImpl ?? (() => ({ error: null }))),
        getPublicUrl: vi.fn().mockImplementation((caminho: string) => ({
          data: {
            publicUrl: `https://test.supabase.co/storage/v1/object/public/product-images/${caminho}`,
          },
        })),
      })
    }

    it('faz upload de múltiplos arquivos com sucesso', async () => {
      setupDbMock()
      setupStorageMock(async (caminho: string) => ({
        data: { path: caminho },
        error: null,
      }))

      const resultados = await service.uploadMultiplo(1, [
        criarArquivo('a.webp'),
        criarArquivo('b.webp'),
      ])

      expect(resultados.length).toBe(2)
    })

    it('limpa arquivos e registros quando falha no segundo upload', async () => {
      setupDbMock()
      let chamadas = 0
      setupStorageMock(async (caminho: string) => {
        chamadas++
        if (chamadas === 1) {
          return {
            data: { path: caminho },
            error: null,
          }
        }
        return {
          data: null,
          error: { message: 'Falha no segundo upload' },
        }
      })

      await expect(
        service.uploadMultiplo(1, [
          criarArquivo('ok.webp'),
          criarArquivo('fail.webp'),
        ]),
      ).rejects.toThrow('Falha no segundo upload')

      const storageFrom = mockSupabase.storage.from.mock.results[0]!.value
      expect(storageFrom.remove).toHaveBeenCalled()
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('não remove arquivos do Storage quando falha antes do primeiro upload bem-sucedido', async () => {
      setupDbMock()
      setupStorageMock(async () => ({
        data: null,
        error: { message: 'Storage quota exceeded' },
      }))

      await expect(
        service.uploadMultiplo(1, [
          criarArquivo('fail.webp'),
        ]),
      ).rejects.toThrow('Storage quota exceeded')

      const storageFrom = mockSupabase.storage.from.mock.results[0]!.value
      expect(storageFrom.remove).not.toHaveBeenCalled()
    })
  })

  describe('removerImagem', () => {
    it('remove do DB e Storage para URL interna', async () => {
      const deleteChain = {
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue(deleteChain),
      })

      const remove = vi.fn().mockResolvedValue({ error: null })
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn(),
        remove,
        getPublicUrl: vi.fn(),
      })

      const resultado = await service.removerImagem(
        1,
        42,
        'https://bmqxgibhuzekxpcgosap.supabase.co/storage/v1/object/public/product-images/produto-1/test.webp',
      )

      expect(resultado.storageRemovido).toBe(true)
      expect(remove).toHaveBeenCalledWith(['produto-1/test.webp'])
    })

    it('não tenta remover do Storage para URL externa', async () => {
      const deleteChain = {
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue(deleteChain),
      })

      const remove = vi.fn().mockResolvedValue({ error: null })
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn(),
        remove,
        getPublicUrl: vi.fn(),
      })

      const resultado = await service.removerImagem(
        1,
        42,
        'https://placehold.co/400x400',
      )

      expect(resultado.storageRemovido).toBe(false)
      expect(remove).not.toHaveBeenCalled()
    })

    it('lança erro quando DB delete falha', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Permission denied' },
            }),
          }),
        }),
      })

      await expect(
        service.removerImagem(1, 42, 'https://example.com/img.webp'),
      ).rejects.toThrow('Permission denied')
    })

    it('retorna storageErro quando Storage remove falha', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      })

      const remove = vi.fn().mockResolvedValue({
        error: { message: 'Object not found' },
      })
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn(),
        remove,
        getPublicUrl: vi.fn(),
      })

      const resultado = await service.removerImagem(
        1,
        42,
        'https://bmqxgibhuzekxpcgosap.supabase.co/storage/v1/object/public/product-images/produto-1/missing.webp',
      )

      expect(resultado.storageRemovido).toBe(false)
      expect(resultado.storageErro).toContain('Object not found')
    })

    it('não lança quando Storage remove falha — preserva consistência do DB', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      })

      const remove = vi.fn().mockResolvedValue({
        error: { message: 'Internal error' },
      })
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn(),
        remove,
        getPublicUrl: vi.fn(),
      })

      const resultado = await service.removerImagem(
        1,
        42,
        'https://bmqxgibhuzekxpcgosap.supabase.co/storage/v1/object/public/product-images/produto-1/img.webp',
      )

      expect(resultado.storageRemovido).toBe(false)
      expect(resultado.storageErro).toBeDefined()
    })
  })

  describe('definirPrincipalUnica', () => {
    it('chama RPC com p_produto_id e p_imagem_id corretos', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null })

      await service.definirPrincipalUnica(1, 42)

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'produto_imagem_definir_principal',
        { p_produto_id: 1, p_imagem_id: 42 },
      )
    })

    it('lança erro quando RPC não existe (migration não aplicada)', async () => {
      mockSupabase.rpc.mockResolvedValue({
        error: {
          message:
            'Postgres function error: 42704: function "produto_imagem_definir_principal" does not exist',
        },
      })

      await expect(
        service.definirPrincipalUnica(1, 42),
      ).rejects.toThrow(
        'RPC produto_imagem_definir_principal não está disponível',
      )
    })

    it('lança erro quando RPC falha por outro motivo', async () => {
      mockSupabase.rpc.mockResolvedValue({
        error: {
          message:
            'Acesso negado: apenas administradores podem definir imagem principal',
        },
      })

      await expect(
        service.definirPrincipalUnica(1, 42),
      ).rejects.toThrow(
        'Falha ao definir imagem principal: Acesso negado',
      )
    })
  })
})
