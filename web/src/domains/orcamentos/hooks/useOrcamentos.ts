import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { OrcamentoAdapter } from '../adapters/orcamento.adapter'
import type {
  AcaoOrcamento,
  CondicaoPagamento,
  DescontoComercial,
  OrcamentoEntrada,
} from '../model/orcamento'

const orcamentoAdapter = new OrcamentoAdapter()

export const orcamentoKeys = {
  todos: ['orcamentos'] as const,
  detalhe: (id: string) => ['orcamentos', id] as const,
}

export function useOrcamentos() {
  return useQuery({
    queryKey: orcamentoKeys.todos,
    queryFn: () => orcamentoAdapter.listOrcamentos(),
  })
}

export function useOrcamento(id: string | undefined) {
  return useQuery({
    queryKey: orcamentoKeys.detalhe(id ?? ''),
    queryFn: () => orcamentoAdapter.getOrcamento(id!),
    enabled: Boolean(id),
  })
}

function useInvalidacao() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({
      queryKey: orcamentoKeys.todos,
    })
  }
}

export function useCriarOrcamento() {
  const invalidar = useInvalidacao()
  return useMutation({
    mutationFn: (entrada: OrcamentoEntrada) =>
      orcamentoAdapter.criarOrcamento(entrada),
    onSuccess: invalidar,
  })
}

export function useAcaoOrcamento() {
  const invalidar = useInvalidacao()
  return useMutation({
    mutationFn: ({
      id,
      acao,
      ator,
    }: {
      id: string
      acao: AcaoOrcamento
      ator: string | null
    }) => orcamentoAdapter.executarAcao(id, acao, ator),
    onSuccess: invalidar,
  })
}

export function useAplicarDescontoComercial() {
  const invalidar = useInvalidacao()
  return useMutation({
    mutationFn: ({
      id,
      desconto,
      ator,
    }: {
      id: string
      desconto: DescontoComercial
      ator: string | null
    }) => orcamentoAdapter.aplicarDescontoComercial(id, desconto, ator),
    onSuccess: invalidar,
  })
}

export function useDefinirCondicaoPagamento() {
  const invalidar = useInvalidacao()
  return useMutation({
    mutationFn: ({
      id,
      condicao,
    }: {
      id: string
      condicao: CondicaoPagamento
    }) => orcamentoAdapter.definirCondicaoPagamento(id, condicao),
    onSuccess: invalidar,
  })
}
