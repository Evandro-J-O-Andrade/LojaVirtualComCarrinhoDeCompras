import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Produto, ProdutoVariante } from '@/domains/produtos/model/produto'
import {
  adicionarItem,
  atualizarQuantidade,
  contagem,
  montarItem,
  removerItem,
  subtotalOfertado,
  type CarrinhoItem,
} from '../model/carrinho'
import { LocalCarrinhoRepository } from '../repositories/carrinho.repository.local'

interface CarrinhoContextType {
  itens: CarrinhoItem[]
  /** Total de unidades — para o badge no header. */
  contagem: number
  /** Subtotal ofertado — informativo, não é autoridade de preço. */
  subtotal: number
  adicionar: (
    produto: Produto,
    variante: ProdutoVariante | null,
    quantidade: number,
  ) => void
  remover: (produtoId: string, varianteId: string | null) => void
  atualizarQuantidade: (
    produtoId: string,
    varianteId: string | null,
    quantidade: number,
  ) => void
  limpar: () => void
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(
  undefined,
)

const repositorio = new LocalCarrinhoRepository()

export function CarrinhoProvider({
  children,
}: {
  children: ReactNode
}) {
  // Hidratação no inicializador: o estado já nasce
  // com o que está salvo, sem render extra.
  const [itens, setItens] = useState<CarrinhoItem[]>(() =>
    repositorio.carregar().itens,
  )

  const persistir = useCallback((proximos: CarrinhoItem[]) => {
    repositorio.salvar({ itens: proximos, source: 'local' })
  }, [])

  const adicionar = useCallback(
    (
      produto: Produto,
      variante: ProdutoVariante | null,
      quantidade: number,
    ) => {
      setItens((anteriores) => {
        const proximos = adicionarItem(
          anteriores,
          montarItem(produto, variante, quantidade),
        )
        persistir(proximos)
        return proximos
      })
    },
    [persistir],
  )

  const remover = useCallback(
    (produtoId: string, varianteId: string | null) => {
      setItens((anteriores) => {
        const proximos = removerItem(
          anteriores,
          produtoId,
          varianteId,
        )
        persistir(proximos)
        return proximos
      })
    },
    [persistir],
  )

  const alterarQuantidade = useCallback(
    (
      produtoId: string,
      varianteId: string | null,
      quantidade: number,
    ) => {
      setItens((anteriores) => {
        const proximos = atualizarQuantidade(
          anteriores,
          produtoId,
          varianteId,
          quantidade,
        )
        persistir(proximos)
        return proximos
      })
    },
    [persistir],
  )

  const limpar = useCallback(() => {
    setItens([])
    repositorio.limpar()
  }, [])

  const valor = useMemo<CarrinhoContextType>(
    () => ({
      itens,
      contagem: contagem(itens),
      subtotal: subtotalOfertado(itens),
      adicionar,
      remover,
      atualizarQuantidade: alterarQuantidade,
      limpar,
    }),
    [itens, adicionar, remover, alterarQuantidade, limpar],
  )

  return (
    <CarrinhoContext.Provider value={valor}>
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho(): CarrinhoContextType {
  const contexto = useContext(CarrinhoContext)
  if (!contexto) {
    throw new Error(
      'useCarrinho deve ser usado dentro de CarrinhoProvider',
    )
  }
  return contexto
}
