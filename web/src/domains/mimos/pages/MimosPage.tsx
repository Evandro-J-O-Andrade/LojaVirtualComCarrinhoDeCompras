import { useNavigate } from 'react-router-dom'
import { useMimos } from '../hooks/useMimos'
import { MimoVitrineGrid } from '../components/MimoVitrineGrid'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { Button } from '@/components/common/Button'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'

export function MimosPage() {
  const navigate = useNavigate()
  const { data: mimos, isLoading, error, refetch } = useMimos()
  const isEditorial = mimos?.some((item) => item.source === 'editorial') ?? false

  return (
    <div>
      <SeoHead
        title="Mimos"
        description="Curadorias de beleza da ANGEL Cosméticos: cuidar, ritual e presentear — composições selecionadas para cada momento."
        canonical="/mimos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Mimos', href: '/mimos' },
        ])}
      />

      <div className="section-angel">
        <div className="container-angel">
          <header className="mb-10 max-w-2xl">
            <p className="overline-angel mb-3">Angel Cosméticos</p>
            <h1 className="title-h1">Mimos</h1>
            <p className="body-angel-lg mt-4">
              Cuidar, ritual e presentear — curadorias que transformam o
              cotidiano em cerimônia.
            </p>
          </header>

          {isEditorial && (
            <div className="mb-10 rounded-2xl border border-champagne bg-champagne-light/40 px-5 py-4">
              <p className="text-body-sm text-content">
                <strong>Catálogo em montagem:</strong> exibimos conteúdo
                editorial de demonstração. Composições, kits e preços ainda
                não foram cadastrados — os valores ficam em{' '}
                <em>sob consulta</em>.
              </p>
            </div>
          )}

          {isLoading ? (
            <LoadingGrid count={3} columns={3} />
          ) : error ? (
            <ErrorState
              message="Não foi possível carregar os mimos."
              onRetry={() => refetch()}
            />
          ) : !mimos || mimos.length === 0 ? (
            <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
              <h2 className="font-display font-bold text-2xl text-content">
                Nenhum mimo disponível
              </h2>
              <p className="mb-6 max-w-md text-body text-content-muted">
                No momento não temos curadorias ativas para exibir. Fale
                conosco para saber o que está por vir.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/contato')}
              >
                Falar com o atendimento
              </Button>
            </div>
          ) : (
            <MimoVitrineGrid mimos={mimos} />
          )}
        </div>
      </div>
    </div>
  )
}
