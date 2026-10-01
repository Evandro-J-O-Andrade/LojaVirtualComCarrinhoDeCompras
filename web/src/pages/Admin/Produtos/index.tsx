import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/dashboard/Table'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export function AdminProdutos() {
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('produto')
        .select(`
          id,
          nome,
          categoria,
          preco_base,
          ativo,
          created_at,
          produto_imagem(url, principal)
        `)
        .order('created_at', { ascending: false })
      if (queryError) throw queryError
      return (data || []).map((p: any) => ({
        ...p,
        price: p.preco_base,
        image: p.produto_imagem?.find((img: any) => img.principal)?.url || p.produto_imagem?.[0]?.url,
      }))
    },
  })

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl text-soft-black">
              Produtos
            </h1>
            <p className="text-warm-gray">Gerencie o catálogo de produtos</p>
          </div>
          <Button variant="primary">
            + Novo Produto
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-champagne shadow-sm p-6">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {products?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blush flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.nome} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-deep-rose font-bold">P</span>
                        )}
                      </div>
                      <span className="font-medium">{product.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoria || '-'}</TableCell>
                  <TableCell>R$ {product.price || product.preco_base}</TableCell>
                  <TableCell>
                    <Badge variant={product.ativo ? 'new' : 'sale'}>
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  )
}