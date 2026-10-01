import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/dashboard/Card'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'

export function AdminOrcamentos() {
  const { data: orcamentos, error, isLoading } = useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('orcamento')
        .select(`
          id,
          nome_contato,
          orcamento_total,
          orcamento_desconto,
          orcamento_acrescimo,
          orcamento_frete,
          orcamento_condicao,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
      if (queryError) throw queryError
      return data || []
    },
    retry: false,
  })

  const total = (orcamentos || []).reduce((sum: number, o: any) => sum + (Number(o.orcamento_total) || 0), 0)

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl text-soft-black">
              Orçamentos
            </h1>
            <p className="text-warm-gray">Gerencie as propostas comerciais</p>
          </div>
          <Button variant="primary">
            + Novo Orçamento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <p className="text-sm text-warm-gray">Total</p>
            <p className="font-display font-bold text-2xl text-soft-black mt-1">
              {orcamentos?.length || 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-warm-gray">Pendentes</p>
            <p className="font-display font-bold text-2xl text-coral mt-1">
              {orcamentos?.filter((o: any) => o.status === 'pendente').length || 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-warm-gray">Aprovados</p>
            <p className="font-display font-bold text-2xl text-deep-rose mt-1">
              {orcamentos?.filter((o: any) => o.status === 'aprovado').length || 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-warm-gray">Faturado</p>
            <p className="font-display font-bold text-2xl text-soft-black mt-1">
              R$ {total.toFixed(2)}
            </p>
          </Card>
        </div>

        <Card>
          {isLoading ? (
            <p className="text-warm-gray text-center py-8">Carregando...</p>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle size={40} className="text-coral mb-3" />
              <p className="text-warm-gray text-sm">
                A tabela de orçamentos ainda não existe no backend.
              </p>
              <p className="text-warm-gray text-xs mt-1">
                Essa funcionalidade será habilitada quando o schema for atualizado.
              </p>
            </div>
          ) : orcamentos?.length === 0 ? (
            <p className="text-warm-gray text-center py-8">Nenhum orçamento encontrado.</p>
          ) : (
            <p className="text-warm-gray text-center py-8">
              {orcamentos?.length} orçamento(s) encontrado(s).
            </p>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}