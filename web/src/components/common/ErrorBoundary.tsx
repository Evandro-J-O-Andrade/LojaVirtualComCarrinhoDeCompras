import React from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 rounded-full bg-coral/10 flex items-center justify-center mb-6">
            <AlertCircle size={48} className="text-coral" />
          </div>
          <h1 className="font-display font-bold text-4xl text-soft-black mb-4">
            ANGEL
          </h1>
          <h2 className="font-display font-bold text-2xl text-soft-black mb-2">
            Algo inesperado aconteceu
          </h2>
          <p className="text-warm-gray mb-8 max-w-md">
            Desculpe pelo inconveniente. Você pode tentar novamente ou voltar para a página inicial.
          </p>
          <div className="flex gap-4">
            <Button variant="primary" onClick={this.handleReset}>
              <RefreshCw size={18} />
              Tentar novamente
            </Button>
            <Button variant="ghost" onClick={() => (window.location.href = '/')}>
              <Home size={18} />
              Voltar ao início
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}