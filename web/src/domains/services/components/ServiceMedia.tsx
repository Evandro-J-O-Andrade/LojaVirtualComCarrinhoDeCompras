import { Badge } from '@/components/common/Badge'
import type { Service } from '../model/service'
import { SERVICE_IMAGE_FALLBACK } from '../model/service'

interface ServiceMediaProps {
  service: Service
  className?: string
}

export function ServiceMedia({ service, className }: ServiceMediaProps) {
  const imagem = service.imagemCapa || SERVICE_IMAGE_FALLBACK

  return (
    <div className={className}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-sunken">
        <img
          src={imagem}
          alt={service.nome}
          className="h-full w-full object-cover"
        />
        {service.source === 'editorial' && (
          <div className="absolute left-4 top-4">
            <Badge variant="default">Em breve</Badge>
          </div>
        )}
      </div>
      {service.video && (
        <div className="mt-4 overflow-hidden rounded-3xl bg-surface-sunken">
          <video
            src={service.video}
            poster={imagem}
            controls
            preload="metadata"
            className="aspect-video w-full"
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
        </div>
      )}
    </div>
  )
}
