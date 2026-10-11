import { describe, expect, it } from 'vitest'
import {
  aplicarPromocao,
  disponibilidade,
  hojeISODate,
  imagensOrdenadas,
  imagemOuFallback,
  imagemPrincipal,
  imagensParaGaleria,
  melhorPromocao,
  midiasDoProduto,
  precoBase,
  precoOfertado,
  produtoJsonLd,
  produtoRef,
  promocaoEhValida,
  rotuloDisponibilidade,
  temPromocaoValida,
  temVariantes,
  variantePorId,
  type Produto,
  type ProdutoVariante,
} from './produto'

function makeProduto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: '1',
    sku: 'ANG-TEST-001',
    nome: 'Produto de Teste',
    slug: 'produto-teste',
    descricao: null,
    precoBase: 100,
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
    ativo: true,
    source: 'supabase',
    ...overrides,
  }
}

function makeVariante(
  overrides: Partial<ProdutoVariante> = {},
): ProdutoVariante {
  return {
    id: 'v1',
    sku: 'ANG-TEST-001-V1',
    preco: 120,
    ativo: true,
    peso: null,
    atributos: [{ tipo: 'cor', valor: 'Vermelho' }],
    ...overrides,
  }
}

describe('Produto view-model', () => {
  describe('promoção', () => {
    it('considera válida apenas dentro da janela e ativa', () => {
      const hoje = hojeISODate()
      const amanha = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      )
        .toLocaleDateString('sv-SE')
        .slice(0, 10)
      expect(
        promocaoEhValida({
          ativo: true,
          dataInicio: '2025-12-01',
          dataFim: '2026-12-31',
        }),
      ).toBe(true)
      expect(
        promocaoEhValida({
          ativo: false,
          dataInicio: '2025-12-01',
          dataFim: '2026-12-31',
        }),
      ).toBe(false)
      expect(
        promocaoEhValida({
          ativo: true,
          dataInicio: hoje,
          dataFim: amanha,
        }),
      ).toBe(true)
      expect(
        promocaoEhValida({
          ativo: true,
          dataInicio: '2027-01-01',
          dataFim: '2027-12-31',
        }),
      ).toBe(false)
    })

    it('aplica percentual e fixo sem preço negativo', () => {
      expect(aplicarPromocao(100, {
        id: 'p', tipo: 'percentual', valor: 15,
        dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
      })).toBe(85)
      expect(aplicarPromocao(100, {
        id: 'p', tipo: 'fixo', valor: 30,
        dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
      })).toBe(70)
      expect(aplicarPromocao(10, {
        id: 'p', tipo: 'fixo', valor: 30,
        dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
      })).toBe(0)
    })

    it('escolhe a promoção que gera o menor preço ofertado', () => {
      const produto = makeProduto({
        precoBase: 100,
        promocoes: [
          {
            id: 'p1', tipo: 'percentual', valor: 10,
            dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
          },
          {
            id: 'p2', tipo: 'fixo', valor: 25,
            dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
          },
          {
            id: 'p3', tipo: 'fixo', valor: 5,
            dataInicio: '2020-01-01', dataFim: '2020-12-31', ativo: true,
          },
        ],
      })
      const melhor = melhorPromocao(produto, 100)
      expect(melhor?.id).toBe('p2')
      expect(precoOfertado(produto)).toBe(75)
      expect(temPromocaoValida(produto)).toBe(true)
    })

    it('sem promoção válida, oferta é o preço base', () => {
      const produto = makeProduto({ precoBase: 100 })
      expect(melhorPromocao(produto, 100)).toBeNull()
      expect(precoOfertado(produto)).toBe(100)
      expect(temPromocaoValida(produto)).toBe(false)
    })

    it('variante selecionada sobrescreve o preço base na oferta', () => {
      const produto = makeProduto({
        precoBase: 100,
        variantes: [makeVariante({ preco: 200 })],
        promocoes: [
          {
            id: 'p1', tipo: 'percentual', valor: 10,
            dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
          },
        ],
      })
      const variante = variantePorId(produto, 'v1')
      expect(precoBase(produto, variante)).toBe(200)
      expect(precoOfertado(produto, variante)).toBe(180)
    })
  })

  describe('disponibilidade', () => {
    it('deriva a condição sem inventar estoque', () => {
      expect(disponibilidade(makeProduto())).toBe('sob_consulta')
      expect(
        disponibilidade(makeProduto({ estoque: { disponivel: 0 } })),
      ).toBe('sem_estoque')
      expect(
        disponibilidade(makeProduto({ estoque: { disponivel: 3 } })),
      ).toBe('em_estoque')
    })

    it('traduz a condição para rótulo', () => {
      expect(
        rotuloDisponibilidade(makeProduto()),
      ).toBe('Sob consulta')
      expect(
        rotuloDisponibilidade(
          makeProduto({ estoque: { disponivel: 0 } }),
        ),
      ).toBe('Esgotado')
    })
  })

  describe('imagens', () => {
    it('ordena pela ordem e respeita a principal', () => {
      const produto = makeProduto({
        imagens: [
          { id: 'i2', url: '/segunda.jpg', ordem: 2, principal: false, alt: null, titulo: null },
          { id: 'i0', url: '/primeira.jpg', ordem: 0, principal: false, alt: null, titulo: null },
          { id: 'i1', url: '/principal.jpg', ordem: 1, principal: true, alt: 'Foto principal', titulo: null },
        ],
      })
      expect(imagensOrdenadas(produto).map((i) => i.id)).toEqual([
        'i0',
        'i1',
        'i2',
      ])
      expect(imagemPrincipal(produto)).toBe('/principal.jpg')
    })

    it('usa a primeira imagem quando não há principal marcada', () => {
      const produto = makeProduto({
        imagens: [{ id: 'i0', url: '/a.jpg', ordem: 0, principal: false, alt: null, titulo: null }],
      })
      expect(imagemPrincipal(produto)).toBe('/a.jpg')
    })

    it('sem imagens, aponta para o fallback real e não quebra a galeria', () => {
      const produto = makeProduto()
      expect(imagemPrincipal(produto)).toBeNull()
      expect(imagemOuFallback(produto)).toBe(
        '/images/placeholder-product.jpg',
      )
      expect(imagensParaGaleria(produto)).toEqual([
        '/images/placeholder-product.jpg',
      ])
    })
  })

  describe('mídia', () => {
    it('lista as imagens ordenadas e o vídeo por último', () => {
      const produto = makeProduto({
        imagens: [
          {
            id: 'i2',
            url: '/detalhe.jpg',
            ordem: 2,
            principal: false,
            alt: 'Detalhe',
            titulo: 'Detalle',
          },
          {
            id: 'i0',
            url: '/frente.jpg',
            ordem: 0,
            principal: true,
            alt: 'Frente',
            titulo: null,
          },
        ],
        video: '/demo.mp4',
      })
      const midias = midiasDoProduto(produto)
      expect(midias).toEqual([
        {
          tipo: 'imagem',
          url: '/frente.jpg',
          alt: 'Frente',
          titulo: null,
        },
        {
          tipo: 'imagem',
          url: '/detalhe.jpg',
          alt: 'Detalhe',
          titulo: 'Detalle',
        },
        { tipo: 'video', url: '/demo.mp4', alt: null, titulo: null },
      ])
    })

    it('sem vídeo, a mídia são só as imagens', () => {
      const produto = makeProduto({
        imagens: [
          {
            id: 'i0',
            url: '/frente.jpg',
            ordem: 0,
            principal: true,
            alt: null,
            titulo: null,
          },
        ],
      })
      expect(midiasDoProduto(produto)).toHaveLength(1)
      expect(midiasDoProduto(produto)[0].tipo).toBe('imagem')
    })

    it('sem nenhuma mídia, a galeria não inventa conteúdo', () => {
      expect(midiasDoProduto(makeProduto())).toEqual([])
    })
  })

  describe('variantes', () => {
    it('detecta variantes ativas e localiza por id', () => {
      const produto = makeProduto({
        variantes: [
          makeVariante({ id: 'v1' }),
          makeVariante({ id: 'v2', ativo: false }),
        ],
      })
      expect(temVariantes(produto)).toBe(true)
      expect(variantePorId(produto, 'v2')).toBeNull()
      expect(variantePorId(produto, 'v1')?.sku).toBe('ANG-TEST-001-V1')
    })
  })

  describe('referência e SEO', () => {
    it('expõe referência leve do produto', () => {
      const produto = makeProduto({
        imagens: [
          { id: 'i0', url: '/capa.jpg', ordem: 0, principal: true, alt: null, titulo: null },
        ],
      })
      expect(produtoRef(produto)).toEqual({
        id: '1',
        slug: 'produto-teste',
        nome: 'Produto de Teste',
        preco: 100,
        imagem: '/capa.jpg',
      })
    })

    it('JSON-LD anuncia o preço ofertado e a condição real', () => {
      const produto = makeProduto({
        estoque: { disponivel: 2 },
        categorias: [{ id: 'c1', nome: 'Maquiagem', slug: 'maquiagem' }],
        fornecedor: { id: 'f1', nome: 'ANGEL Cosméticos' },
        promocoes: [
          {
            id: 'p1', tipo: 'percentual', valor: 20,
            dataInicio: '2026-01-01', dataFim: '2026-12-31', ativo: true,
          },
        ],
      })
      const jsonLd = produtoJsonLd(produto, makeVariante()) as {
        offers: { price: number; availability: string }
        sku: string
      }
      expect(jsonLd.offers.price).toBe(96)
      expect(jsonLd.offers.availability).toBe(
        'https://schema.org/InStock',
      )
      expect(jsonLd.sku).toBe('ANG-TEST-001-V1')
    })
  })
})
