import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'

interface FavoritesContextType {
  items: (number | string)[]
  count: number
  toggle: (productId: number | string) => void
  isFavorite: (productId: number | string) => boolean
  clear: () => void
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

  return (
    <FavoritesContext.Provider value={{ items, count: items.length, toggle, isFavorite, clear }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider')
  return context
}