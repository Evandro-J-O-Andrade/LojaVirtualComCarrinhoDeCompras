import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  FavoritesProvider,
  useFavorites,
} from './FavoritesContext'

/**
 * Favoritos são ESTADO LOCAL, separado dos
 * dados comerciais: a cliente pode
 * favoritar sem conta e sem backend.
 */

const CHAVE = 'angel-favorites'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>{children}</FavoritesProvider>
  )
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('começa vazio quando não há nada salvo', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper,
    })
    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
  })

  it('hidrata com o que já estava salvo no dispositivo', () => {
    localStorage.setItem(CHAVE, JSON.stringify([7, 9]))
    const { result } = renderHook(() => useFavorites(), {
      wrapper,
    })
    expect(result.current.items).toEqual([7, 9])
    expect(result.current.isFavorite(7)).toBe(true)
    expect(result.current.isFavorite(8)).toBe(false)
  })

  it('salva no dispositivo ao alternar', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper,
    })
    act(() => result.current.toggle(7))
    expect(result.current.items).toEqual([7])
    expect(
      JSON.parse(localStorage.getItem(CHAVE) ?? '[]'),
    ).toEqual([7])
  })

  it('alternar de novo remove o favorito', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper,
    })
    act(() => result.current.toggle(7))
    act(() => result.current.toggle(7))
    expect(result.current.items).toEqual([])
  })

  it('merge junta ids da conta sem apagar os locais', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper,
    })
    act(() => result.current.toggle(7))
    act(() => result.current.mesclar([7, 12]))
    expect(result.current.items).toEqual([7, 12])
    expect(result.current.count).toBe(2)
  })

  it('limpar esvazia a lista do dispositivo', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper,
    })
    act(() => result.current.toggle(7))
    act(() => result.current.clear())
    expect(result.current.items).toEqual([])
    expect(
      JSON.parse(localStorage.getItem(CHAVE) ?? '[]'),
    ).toEqual([])
  })
})
