const { createClient } = require('@supabase/supabase-js');

// Configurações do projeto
const SUPABASE_URL = 'https://bmqxgibhuzekxpcgosap.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const ADMIN_EMAIL = 'evandro_j.o.a@hotmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_UUID = '3bf1c769-f4ca-45fe-b52b-ded4de18abc9';

async function main() {
  if (!SUPABASE_ANON_KEY) {
    console.log('ERRO: SUPABASE_ANON_KEY nao definida');
    console.log('Defina a variavel de ambiente: $env:SUPABASE_ANON_KEY = "sua-anon-key"');
    process.exit(1);
  }

  if (!ADMIN_PASSWORD) {
    console.log('ERRO: ADMIN_PASSWORD nao definida');
    console.log('Defina a variavel de ambiente: $env:ADMIN_PASSWORD = "sua-senha"');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Autenticar como administrador
  console.log('=== AUTENTICACAO ===');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authError) {
    console.log('ERRO na autenticacao:', authError.message);
    process.exit(1);
  }

  console.log('Autenticado como:', authData.user.email);
  console.log('UUID:', authData.user.id);
  console.log('Coincide com admin UUID:', authData.user.id === ADMIN_UUID);

  // Verificar is_admin()
  console.log('\n=== VERIFICACAO is_admin() ===');
  const { data: adminCheck, error: adminError } = await supabase
    .rpc('is_admin')
    .single();
  
  if (adminError) {
    console.log('ERRO ao chamar is_admin():', adminError.message);
  } else {
    console.log('is_admin()=', adminCheck);
  }

  // Estado inicial
  console.log('\n=== ESTADO INICIAL ===');
  const { data: imagens, error: imgError } = await supabase
    .from('imagem') // tentar produto_imagem
    .select('*')
    .eq('produto_id', 1)
    .order('id');

  if (imgError) {
    console.log('Nota: produto_imagem pode precisar de RLS. Tentando RPC de leitura...');
  } else {
    console.log('Imagens do produto 1:', JSON.stringify(imagens, null, 2));
  }

  // Teste 1: Chamar RPC como admin autenticado
  console.log('\n=== TESTE 1: Admin define imagem principal ===');
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('produto_imagem_definir_principal', {
      p_produto_id: 1,
      p_imagem_id: 2,
    });

  if (rpcError) {
    console.log('FALHA na RPC:', rpcError.message);
    console.log('Detalhe:', rpcError.details || rpcError.hint);
  } else {
    console.log('PASS: RPC executada com sucesso');
  }

  // Verificar estado apos RPC
  console.log('\n=== ESTADO APOS RPC ===');
  const { data: verify, error: verifyError } = await supabase
    .from('imagem')
    .select('id, produto_id, principal')
    .eq(' produto_id', 1)
    .order('id');

  if (verifyError) {
    console.log('Nota: nao foi possivel verificar via query direta (RLS).');
    console.log('Verifique manualmente no SQL Editor.');
  } else {
    console.log('Imagens apos RPC:', JSON.stringify(verify, null, 2));
  }

  // Fazer logout
  await supabase.auth.signOut();
  console.log('\n=== Desautenticado ===');
}

main().catch(e => { console.error(e); process.exit(1); });