import { describe, expect, it } from 'vitest'
import type { Produto } from './produto'
import {
  CATEGORIAS_COMERCIAIS,
  categoriaComercialPorSlug,
  normalizarSlugCategoria,
  produtoPertenceCategoriaComercial,
} from './categoria-editorial'

function produtoComCategoria(nome: string, slug: string): Produto {
  return {
    id: 'produto-1',
    sku: 'ANG-001',
    nome: 'Produto de teste',
    slug: 'produto-de-teste',
    descricao: null,
    precoBase: 10,
    imagens: [],
    video: null,
    beneficio: null,
    historia: null,
    categorias: [{ id: 'categoria-1', nome, slug }],
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
  }
}

describe('categorias comerciais Angel', () => {
  it('normaliza acentos e separadores sem perder o nome comercial', () => {
    expect(normalizarSlugCategoria('Cama, Mesa & Banho')).toBe('cama-mesa-banho')
    expect(normalizarSlugCategoria('Moda Feminina')).toBe('moda-feminina')
  })

  it('mantém rotas estáveis para as categorias principais', () => {
    expect(categoriaComercialPorSlug('moda-e-lingerie')?.nome).toBe('Moda & Lingerie')
    expect(categoriaComercialPorSlug('cama-mesa-banho')?.nome).toBe('Cama, Mesa & Banho')
    expect(categoriaComercialPorSlug('kits-e-presentes')?.href).toBe('/mimos')
  })

  it('associa produtos por categoria real, incluindo nomes com acentos', () => {
    const moda = CATEGORIAS_COMERCIAIS.find((categoria) => categoria.slug === 'moda-e-lingerie')!
    const casa = CATEGORIAS_COMERCIAIS.find((categoria) => categoria.slug === 'cama-mesa-banho')!
    expect(produtoPertenceCategoriaComercial(produtoComCategoria('Moda Feminina', 'moda-feminina'), moda)).toBe(true)
    expect(produtoPertenceCategoriaComercial(produtoComCategoria('Cama, Mesa & Banho', 'cama-mesa-banho'), casa)).toBe(true)
  })

  it('não classifica produtos em kits sem vínculo real de categoria', () => {
    const kits = CATEGORIAS_COMERCIAIS.find((categoria) => categoria.slug === 'kits-e-presentes')!
    expect(produtoPertenceCategoriaComercial(produtoComCategoria('Moda', 'moda'), kits)).toBe(false)
  })
})
