# RBAC — Script de Validação Autenticada (para execução local)

**Uso:** Executar localmente com credenciais do admin e de uma conta de teste não-admin.
**NUNCA compartilhar senhas no chat.**

## Pré-requisitos

1. Node.js instalado
2. Variáveis de ambiente configuradas (ou editar o script):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Conta admin: evandro_j.o.a@hotmail.com (senha rotacionada)
4. Conta não-admin: criar via Supabase Dashboard ou Auth API

## Script (salvar como `rbac-validate.mjs`)

```javascript
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const adminEmail = process.env.ADMIN_EMAIL || 'evandro_j.o.a@hotmail.com'
const adminPassword = process.env.ADMIN_PASSWORD
const testEmail = process.env.TEST_EMAIL
const testPassword = process.env.TEST_PASSWORD

if (!url || !key) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}
if (!adminPassword) {
  console.error('Defina ADMIN_PASSWORD (senha do admin)')
  process.exit(1)
}

const supabase = createClient(url, key)

async function testIsAdmin(label, client) {
  const { data, error } = await client.rpc('is_admin')
  console.log(`  [${label}] is_admin() = ${data} (error: ${error?.message ?? 'none'})`)
  return { label, result: data, error: error?.message }
}

async function testReadAdminUser(label, client) {
  const { data, error } = await client.from('admin_user').select('*')
  console.log(`  [${label}] admin_user rows = ${data?.length ?? 0} (error: ${error?.message ?? 'none'})`)
  return { label, rows: data?.length ?? 0, error: error?.message }
}

async function testWriteProduto(label, client) {
  const { data, error } = await client.from('produto').insert({
    nome: 'TESTE_RBAC',
    slug: 'teste-rbac-' + Date.now(),
    preco_base: 1,
  })
  if (error) {
    console.log(`  [${label}] INSERT produto = HTTP ${error.code} (${error.message})`)
  } else {
    console.log(`  [${label}] INSERT produto = SUCCESS (id: ${data?.[0]?.id})`)
    // Cleanup
    if (data?.[0]?.id) {
      await client.from('produto').delete().eq('id', data[0].id)
    }
  }
  return { label, success: !error, error: error?.message }
}

async function testRpcPrincipal(label, client) {
  const { data, error } = await client.rpc('produto_imagem_definir_principal', {
    p_produto_id: 1,
    p_imagem_id: 1,
  })
  if (error) {
    console.log(`  [${label}] RPC definir_principal = ${error.code} (${error.message})`)
  } else {
    console.log(`  [${label}] RPC definir_principal = SUCCESS`)
  }
  return { label, success: !error, error: error?.message }
}

async function runTests(label, email, password) {
  console.log(`\n=== Testes com ${label} (${email}) ===`)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authError) {
    console.error(`  Falha ao autenticar: ${authError.message}`)
    return
  }
  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  })

  const r1 = await testIsAdmin(label, client)
  const r2 = await testReadAdminUser(label, client)
  const r3 = await testWriteProduto(label, client)
  const r4 = await testRpcPrincipal(label, client)

  await supabase.auth.signOut()

  return { label, r1, r2, r3, r4 }
}

async function main() {
  console.log('=== RBAC Validation — Angel Cosméticos ===')
  console.log(`Supabase URL: ${url}`)

  // Teste 1: Anônimo (já confirmado, mas re-executar para consistência)
  console.log('\n=== Testes anônimos ===')
  const anonClient = createClient(url, key)
  await testIsAdmin('anon', anonClient)
  await testReadAdminUser('anon', anonClient)
  await testWriteProduto('anon', anonClient)
  await testRpcPrincipal('anon', anonClient)

  // Teste 2: Admin
  const adminResults = await runTests('admin', adminEmail, adminPassword)

  // Teste 3: Não-admin (se credenciais fornecidas)
  if (testEmail && testPassword) {
    const testResults = await runTests('non-admin', testEmail, testPassword)
  } else {
    console.log('\n=== Conta de teste não fornecida (TEST_EMAIL/TEST_PASSWORD) ===')
    console.log('  Para testar com conta não-admin, defina TEST_EMAIL e TEST_PASSWORD')
  }

  console.log('\n=== Validação concluída ===')
  console.log('Atualize docs/RBAC_VALIDACAO.md com os resultados obtidos.')
}

main().catch(console.error)
```

## Como executar

```powershell
# Definir variáveis de ambiente (sem compartilhar no chat)
$env:VITE_SUPABASE_URL = "https://bmqxgibhuzekxpcgosap.supabase.co"
$env:VITE_SUPABASE_PUBLISHABLE_KEY = "<anon key>"
$env:ADMIN_PASSWORD = "<senha do admin>"
# Opcional: conta não-admin
$env:TEST_EMAIL = "teste@example.com"
$env:TEST_PASSWORD = "<senha do teste>"

# Instalar dependência (se necessário)
npm install @supabase/supabase-js

# Executar
node rbac-validate.mjs
```

## Resultados esperados

### Admin (evandro_j.o.a@hotmail.com)
| Teste | Esperado |
|-------|----------|
| `is_admin()` | `true` |
| `admin_user` rows | ≥ 1 |
| INSERT `produto` | HTTP 201 |
| RPC `definir_principal` | SUCCESS |

### Não-admin (conta de teste)
| Teste | Esperado |
|-------|----------|
| `is_admin()` | `false` |
| `admin_user` rows | 0 |
| INSERT `produto` | HTTP 401/403 |
| RPC `definir_principal` | HTTP 401/403 |

### Anônimo (já confirmado)
| Teste | Esperado | Status |
|-------|----------|--------|
| `is_admin()` | `false` | ✅ Confirmado |
| `admin_user` rows | 0 | ✅ Confirmado |
| INSERT `produto` | HTTP 401 | ✅ Confirmado |
| RPC `definir_principal` | HTTP 401 | ✅ Confirmado |

## Após a execução

1. Atualizar `docs/RBAC_VALIDACAO.md` com resultados reais
2. Se RBAC-03 confirmado: conectar `AdminPermissionContext` a `is_admin()`
3. Se todos os 11 testes passarem: liberar próxima fase (migrations + seeds)