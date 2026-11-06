import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ExclusaoFeedbackProps {
  aberto: boolean
  fechando: boolean
  mensagem: string
  log?: string
  onFechar: () => void
  onTentarNovamente?: () => void
}

export function ExclusaoFeedback({
  aberto,
  fechando,
  mensagem,
  log,
  onFechar,
  onTentarNovamente,
}: ExclusaoFeedbackProps) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-soft-black">
              Exclusão não concluída
            </h2>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-content-muted">{mensagem}</p>

        {log && (
          <div className="mb-4 rounded-lg bg-gray-100 p-3">
            <p className="mb-1 text-xs font-semibold text-gray-500">Detalhes técnicos:</p>
            <pre className="overflow-auto text-xs text-gray-700">{log}</pre>
          </div>
        )}

        <div className="flex gap-3">
          {onTentarNovamente && (
            <Button variant="primary" onClick={onTentarNovamente} disabled={fechando}>
              {fechando ? 'Excluindo...' : 'Tentar novamente'}
            </Button>
          )}
          <Button variant="outline" onClick={onFechar}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}