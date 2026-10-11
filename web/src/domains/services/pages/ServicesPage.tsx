import { useNavigate } from 'react-router-dom'
import { useServices } from '../hooks/useServices'
import { ServiceCard } from '../components/ServiceCard'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingGrid } from '@/components/feedback/LoadingGrid'
import { Button } from '@/components/common/Button'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'

export function ServicesPage() {
  const navigate = useNavigate()
  const { data: servicos, isLoading, error, refetch } = useServices()
  const isEditorial = servicos?.some((item) => item.source === 'editorial') ?? false

  return (
    <div>
      <SeoHead
        title="Serviços"
        description="Serviços de beleza da ANGEL Cosméticos: sessões de maquiagem, consultoria e cuidados com atendimento personalizado."
        canonical="/servicos"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Serviços', href: '/servicos' },
        ])}
      />

      <div className="section-angel">
        <div className="container-angel">
          <header className="mb-10 max-w-2xl">
            <p className="overline-angel mb-3">Angel Cosméticos</p>
            <h1 className="title-h1">Serviços</h1>
            <p className="body-angel-lg mt-4">
              Cuidados, maquiagem e consultoria de beleza — cada atendimento
              personalizado.
            </p>
          </header>

          {isEditorial && (
            <div className="mb-10 rounded-2xl border border-champagne bg-champagne-light/40 px-5 py-4">
              <p className="text-body-sm text-content">
                <strong>Catálogo em montagem:</strong> exibimos conteúdo
                editorial de demonstração. Preços, durações e disponibilidade
                ainda não foram cadastrados — todos os serviços estão em{' '}
                <em>sob consulta</em>.
              </p>
            </div>
          )}

          {isLoading ? (
            <LoadingGrid count={6} columns={3} />
          ) : error ? (
            <ErrorState
              message="Não foi possível carregar os serviços."
              onRetry={() => refetch()}
            />
          ) : !servicos || servicos.length === 0 ? (
            <div className="surface-card flex flex-col items-center px-6 py-16 text-center">
              <h2 className="font-display font-bold text-2xl text-content">
                Nenhum serviço disponível
              </h2>
              <p className="mb-6 max-w-md text-body text-content-muted">
                No momento não temos serviços ativos para exibir. Fale conosco
                para saber o que está por vir.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/contato')}
              >
                Falar com o atendimento
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicos.map((servico) => (
                <ServiceCard key={servico.id} service={servico} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
