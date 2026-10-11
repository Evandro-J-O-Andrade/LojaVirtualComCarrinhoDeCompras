import { useQuery } from '@tanstack/react-query'
import {
  SupabaseProdutoRepository,
} from '@/domains/produtos/repositories/produto.repository.supabase'
import { ProdutoTableMissingError } from '@/domains/produtos/repositories/produto.repository'
import type {
  CategoriaRef,
  Produto,
} from '@/domains/produtos/model/produto'
import type { AdminDadosEstado } from '../model/admin'

/**
 * Dados administrativos de produtos.
 *
 * Diferente da vitrine, o admin NÃO
 * usa o fallback editorial: ele lê o
 * repositório real e reporta o estado
 * honesto — conectado, não integrado
 * (tabela ausente) ou erro. Lista
 * também inativos, que a administração
 * precisa ver para reativar.
 */

export interface AdminProdutosResultado {
  estado: AdminDadosEstado
  produtos: Produto[]
}

const adminProdutoRepository =
  new SupabaseProdutoRepository()

export function useAdminProdutos() {
  return useQuery({
    queryKey: ['admin-produtos'],
    queryFn: async (): Promise<AdminProdutosResultado> => {
      try {
        const produtos =
          await adminProdutoRepository.listProdutos(
            { incluirInativos: true },
          )
        return { estado: 'conectado', produtos }
      } catch (erro) {
        if (erro instanceof ProdutoTableMissingError) {
          return { estado: 'nao-integrado', produtos: [] }
        }
        throw erro
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  })
}

/** Estado consolidado para a UI. */
export function estadoAdminProdutos(
  resultado: AdminProdutosResultado | undefined,
  erro: unknown,
): AdminDadosEstado {
  if (erro) return 'erro'
  return resultado?.estado ?? 'nao-integrado'
}

export function useAdminCategorias() {
  return useQuery({
    queryKey: ['admin-categorias'],
    queryFn: async (): Promise<CategoriaRef[]> => {
      try {
        return await adminProdutoRepository.listCategorias()
      } catch {
        // Filtro auxiliar: sem categorias
        // reais, o filtro simplesmente
        // não aparece. Nunca inventa.
        return []
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
