import { describe, expect, it } from 'vitest'
import {
  EXPERIENCIAS,
  experienciaPorSlug,
  midiasDaExperiencia,
} from './experiencia'

describe('experiências editoriais', () => {
  it('tem slugs únicos', () => {
    const slugs = EXPERIENCIAS.map((item) => item.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('localiza experiência por slug', () => {
    expect(experienciaPorSlug('sessao-de-maquiagem')?.titulo).toBe(
      'Sessão de maquiagem',
    )
    expect(experienciaPorSlug('inexistente')).toBeUndefined()
  })

  it('só usa mídias reais do patrimônio', () => {
    for (const experiencia of EXPERIENCIAS) {
      for (const url of experiencia.galeria) {
        expect(url.startsWith('/assets/')).toBe(true)
      }
      if (experiencia.video) {
        expect(experiencia.video.startsWith('/assets/')).toBe(true)
      }
    }
  })

  it('nunca inventa data ou local', () => {
    // O acervo não tem datas/locais confirmados: o estado
    // honesto é ausência, nunca uma data falsa.
    for (const experiencia of EXPERIENCIAS) {
      expect(experiencia.data).toBeNull()
      expect(experiencia.local).toBeNull()
    }
  })

  it('monta mídias com vídeo por último, quando existe', () => {
    const sessao = experienciaPorSlug('sessao-de-maquiagem')!
    const midias = midiasDaExperiencia(sessao)

    expect(midias.at(-1)?.tipo).toBe('video')
    expect(midias.at(-1)?.url).toBe('/assets/video/sessãoMaquiagem.mp4')
    expect(midias[0].titulo).toBe('Capa')
  })

  it('omite vídeo quando a experiência não tem', () => {
    const encontro = experienciaPorSlug('encontro-de-beleza')!
    const midias = midiasDaExperiencia(encontro)

    expect(midias.every((midia) => midia.tipo === 'imagem')).toBe(true)
    expect(midias).toHaveLength(encontro.galeria.length)
  })

  it('etiqueta a capa da galeria', () => {
    const experiencia = EXPERIENCIAS[0]
    const midias = midiasDaExperiencia(experiencia)

    expect(midias[0].alt).toContain('foto 1')
    expect(midias[1].titulo).toBeNull()
  })
})
