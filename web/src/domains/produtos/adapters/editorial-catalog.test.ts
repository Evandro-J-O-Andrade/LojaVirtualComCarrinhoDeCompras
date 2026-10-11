import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assetsDoContexto } from '@/domains/conteudo/model/asset'
import { EDITORIAL_CATALOGO } from './editorial-catalog'

/**
 * Regressão de mídia: o catálogo editorial só
 * pode apontar para mídia que existe de fato no
 * patrimônio. Cobre o caso produto-22.jpg —
 * referência a arquivo inexistente que quebrava
 * um slot da galeria do blush.
 */

const MIDIAS_REAIS_DO_PRODUTO = new Set(
  assetsDoContexto('produto').map((asset) => asset.caminho),
)

describe('catálogo editorial — integridade de mídia', () => {
  it('todo produto tem ao menos uma foto real', () => {
    for (const product of EDITORIAL_CATALOGO) {
      expect(product.imagens.length).toBeGreaterThan(0)
    }
  })

  it('toda foto referenciada existe no patrimônio real', () => {
    for (const product of EDITORIAL_CATALOGO) {
      for (const imagem of product.imagens) {
        expect(
          MIDIAS_REAIS_DO_PRODUTO.has(imagem.url),
          `${product.slug}: ${imagem.url} não existe no patrimônio`,
        ).toBe(true)
      }
    }
  })

  it('nenhuma foto se repete dentro do mesmo produto', () => {
    for (const product of EDITORIAL_CATALOGO) {
      const urls = product.imagens.map((imagem) => imagem.url)
      expect(new Set(urls).size).toBe(urls.length)
    }
  })

  it('vídeo de demonstração referenciado existe em public/', () => {
    const videos = new Set(
      EDITORIAL_CATALOGO
        .map((product) => product.video)
        .filter((video): video is string => video !== null),
    )
    expect(videos.size).toBeGreaterThan(0)
    for (const video of videos) {
      expect(existsSync(`public${video}`)).toBe(true)
    }
  })
})
