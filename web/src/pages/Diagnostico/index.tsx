import React from 'react'
import { supabase } from '@/lib/supabase'

export function DiagnosticoPage() {
  const [status, setStatus] = React.useState('testando...')
  const [produtos, setProdutos] = React.useState<any[]>([])
  const [erro, setErro] = React.useState('')

  React.useEffect(() => {
    async function testar() {
      try {
        const { data, error } = await supabase.from('produto').select('*').limit(5)
        if (error) {
          setErro(error.message)
          setStatus('erro')
        } else {
          setProdutos(data || [])
          setStatus('ok')
        }
      } catch (e: any) {
        setErro(e.message)
        setStatus('erro')
      }
    }
    testar()
  }, [])

  return (
    <div className="p-8">
      <h1>Diagnóstico</h1>
      <p>Status: {status}</p>
      {erro && <p style={{ color: 'red' }}>Erro: {erro}</p>}
      <pre>{JSON.stringify(produtos, null, 2)}</pre>
    </div>
  )
}