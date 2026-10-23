import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'

interface FavoritesContextType {
  items: (number | string)[]
  count: number
  toggle: (productId: number | string) => void
  isFavorite: (productId: number | string) => boolean
  clear: () => void
  /**
   * Merge explícito: junta ids vindos da
   * conta autenticada à lista local sem
   * apagar nada. É o ponto preparado para a
   * migração de favoritos para a conta —
   * hoje não é chamado por nada, porque
   * ainda não existe fonte de favoritos no
   * backend.
   */
  mesclar: (ids: (number | string)[]) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const FAVORITES_STORAGE_KEY = 'angel-favorites'

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Hidratação no inicializador: o estado já nasce com o que está salvo,
  // sem render extra nem efeito de sincronização.
  const [items, setItems] = useState<(number | string)[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const toggle = useCallback((productId: number | string) => {
    setItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }, [])

  const isFavorite = useCallback((productId: number | string) => items.includes(productId), [items])

  const clear = useCallback(() => setItems([]), [])

  const mesclar = useCallback((ids: (number | string)[]) => {
    setItems((prev) => {
      const novo = [...prev]
      for (const id of ids) {
        if (!novo.includes(id)) novo.push(id)
      }
      return novo
    })
  }, [])

  return (
    <FavoritesContext.Provider value={{ items, count: items.length, toggle, isFavorite, clear, mesclar }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider')
  return context
}