import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  PATRIMONIO,
  PATRIMONIO_NAO_CONTEUDO,
  assetPorId,
  assetsDoContexto,
  assetsDoEvento,
  assetsDoProduto,
  type PatrimonioAsset,
} from './asset'

const RAIZ = 'D:/LojaVirtualComCarrinhoDeCompras/web/public'

function caminhoAbsoluto(asset: PatrimonioAsset): string {
  return `${RAIZ}${asset.caminho}`
}

describe('manifesto de mídia', () => {
  it('tem ids e caminhos únicos', () => {
    const ids = [...PATRIMONIO, ...PATRIMONIO_NAO_CONTEUDO].map(
      (asset) => asset.id,
    )
    const caminhos = [...PATRIMONIO, ...PATRIMONIO_NAO_CONTEUDO].map(
      (asset) => asset.caminho,
    )
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(caminhos).size).toBe(caminhos.length)
  })

  it('todo asset real existe no disco', () => {
    // Regra de ouro da Fatia 9: nenhuma URL falsa.
    // Se este teste falha, o manifesto aponta para
    // um arquivo que não existe.
    const inexistentes = PATRIMONIO.filter(
      (asset) => !existsSync(caminhoAbsoluto(asset)),
    )
    expect(inexistentes.map((a) => a.id)).toEqual([])
  })

  it('o patrimônio real não contém testes', () => {
    expect(
      PATRIMONIO.some((asset) => asset.status !== 'real'),
    ).toBe(false)
  })

  it('o patrimônio não-conteúdo nunca é real', () => {
    expect(
      PATRIMONIO_NAO_CONTEUDO.some(
        (asset) => asset.status === 'real',
      ),
    ).toBe(false)
    expect(PATRIMONIO_NAO_CONTEUDO.length).toBeGreaterThan(0)
  })

  it('documenta a lacuna real do acervo (produto-22 e 25)', () => {
    // produto-22.jpg e produto-25.jpg não existem no
    // acervo. O manifesto deve registrá-los como
    // ausentes — nunca inventar o caminho.
    const caminhos = PATRIMONIO.map((asset) => asset.caminho)
    expect(
      caminhos.includes('/assets/img/produto-22.jpg'),
    ).toBe(false)
    expect(
      caminhos.includes('/assets/img/produto-25.jpg'),
    ).toBe(false)
  })

  it('consulta por id, contexto, evento e produto', () => {
    expect(assetPorId('cinematic')?.caminho).toBe(
      '/assets/img/marca/cinematic.png',
    )
    expect(assetPorId('logoteste2')?.status).toBe('teste')

    expect(assetsDoContexto('evento').length).toBeGreaterThan(0)
    expect(
      assetsDoEvento('encontro-de-beleza').map((a) => a.id),
    ).toEqual([
      'evento-1',
      'evento-2',
      'evento-3',
      'evento-4',
      'evento-5',
      'evento-6',
    ])
    expect(assetsDoProduto('blush-compacto').map((a) => a.id)).toEqual([
      'produto-21',
      'produto-23',
      'produto-24',
    ])
  })

  it('vídeo de demonstração está no manifesto', () => {
    const video = PATRIMONIO.find(
      (asset) => asset.tipo === 'video',
    )
    expect(video?.caminho).toBe('/assets/video/sessao-maquiagem/sessãoMaquiagem.mp4')
    expect(video?.status).toBe('real')
  })
})
