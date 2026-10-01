Deno.serve(async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'application/json',
    'Access-Control-Max-Age': '86400',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const cep = url.searchParams.get('cep')

  if (!cep || cep.replace(/\D/g, '').length !== 8) {
    return new Response(JSON.stringify({ error: 'CEP inválido. Informe 8 dígitos.' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const cleanCep = cep.replace(/\D/g, '')

  const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar CEP' }), {
      status: 502,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const data = await res.json()

  if (data.erro) {
    return new Response(JSON.stringify({ error: 'CEP não encontrado' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
})
