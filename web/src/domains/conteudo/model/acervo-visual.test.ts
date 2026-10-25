import { describe, expect, it } from 'vitest'
import { ACERVO_CATEGORIAS, ACERVO_IMAGENS } from './acervo-visual'

describe('acervo visual Angel', () => {
  it('mantém as 100 imagens inventariadas sem repetir nomes', () => {
    expect(ACERVO_IMAGENS).toHaveLength(100)
    expect(new Set(ACERVO_IMAGENS.map((imagem) => imagem.arquivo)).size).toBe(100)
  })

  it('preserva a distribuição editorial aprovada do lote', () => {
    const count = (categoria: string) => ACERVO_IMAGENS.filter((imagem) => imagem.categoria === categoria).length
    expect(count('beleza')).toBe(76)
    expect(count('banners')).toBe(5)
    expect(count('produtos')).toBe(14)
    expect(count('moda')).toBe(3)
    expect(count('casa')).toBe(2)
  })

  it('usa somente caminhos públicos locais de imagens', () => {
    expect(ACERVO_IMAGENS.every((imagem) => imagem.src.startsWith('/assets/img/'))).toBe(true)
    expect(ACERVO_IMAGENS.every((imagem) => /\.(avif|jpe?g|png|webp)$/i.test(imagem.arquivo))).toBe(true)
  })

  it('oferece filtro geral e todas as categorias utilizadas', () => {
    expect(ACERVO_CATEGORIAS.map((item) => item.id)).toEqual(['todas', 'beleza', 'banners', 'produtos', 'moda', 'casa'])
  })
})
