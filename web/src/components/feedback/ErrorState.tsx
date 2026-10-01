import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Ocorreu um erro inesperado.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center mb-6">
        <AlertCircle size={40} className="text-coral" />
      </div>
      <h3 className="font-display font-bold text-xl text-soft-black mb-2">
        Algo deu errado
      </h3>
      <p className="text-warm-gray mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          <RefreshCw size={18} />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
