/**
 * Testes isolados para as duas ressalvas pendentes
 *
 * TESTE 3a: Imagem inexistente — confirmar que a RPC rejeita especificamente
 *   por imagem inexistente (nao apenas por is_admin).
 *
 * TESTE 5a: Correncia — duas sessoes simultaneas para o mesmo produto.
 *   Uma deve aguardar a outra (FOR UPDATE) e nenhuma duplicidade deve resultar.
 *
 * Uso: node test-isolated.cjs
 *
 * Requer: SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 * NENHUMA credencial e hardcoded.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERRO: Defina SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

async function main() {
  // ============================================================
  // ESTADO INICIAL
  // ============================================================
  console.log('=== ESTADO INICIAL ===');
  const supabaseProbe = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
  );
  const { data: imagensIniciais } = await supabaseProbe
    .from('imagem')
    .select('id, produto_id, principal')
    .eq('produto_id', 1)
    .order('id');
  console.log('Imagens do produto 1 (inicial):', JSON.stringify(imagensIniciais));

  // ============================================================
  // TESTE 3a: Imagem inexistente
  // ============================================================
  console.log('\n=== TESTE 3a: Imagem inexistente (admin) ===');
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authError || !authData.user) {
    console.log('FALHA na autenticacao:', authError?.message || 'Sem usuario');
    process.exit(1);
  }

  console.log('Autenticado como:', authData.user.email);
  const { data: adminCheck } = await supabaseAdmin.rpc('is_admin').single();
  console.log('is_admin()=', adminCheck);

  if (!adminCheck) {
    console.log('FALHA: is_admin() nao retorna true');
    process.exit(1);
  }

  // Chamar RPC com imagem inexistente
  const { error: errInexistente } = await supabaseAdmin.rpc('imagem_definir_principal', {
    p_produto_id: 1,
    p_imagem_id: 999999,
  });

  if (errInexistente) {
    const msg = errInexistente.message || '';
    if (msg.includes('nao pertence') || msg.includes('does not exist')) {
      console.log('PASS: Imagem inexistente rejeitada especificamente:', msg);
    } else {
      console.log('AVISO: Erro diferente do esperado:', msg);
    }
  } else {
    console.log('FALHA: RPC nao foi bloqueada para imagem inexistente');
  }
  await supabaseAdmin.auth.signOut();

  // ============================================================
  // TESTe 5a: Correncia serializada
  // ============================================================
  console.log('\n=== TESTE 5a: Correncia serializada ===');

  // Duas sessoes independentes
  const supabaseA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: authA } = await supabaseA.auth.signInWithPassword({
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
  });
  const { data: authB } = await supabaseB.auth.signInWithPassword({
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
  });

  if (!authA?.user || !authB?.user) {
    console.log('FALHA: Nao foi possivel autenticar as duas sessoes');
    process.exit(1);
  }

  // Duas chamadas simultaneas para o mesmo produto
  const [resultadoA, resultadoB] = await Promise.allSettled([
    supabaseA.rpc('imagem_definir_principal', { p_produto_id: 1, p_imagem_id: 1 }),
    supabaseB.rpc('imagem_definir_principal', { p_produto_id: 1, p_imagem_id: 2 }),
  ]);

  const statusA = resultadoA.status === 'fulfilled'
    ? (resultadoA.value.error ? `Erro: ${resultadoA.value.error.message}` : 'Sucesso')
    : `Rejeitado: ${resultadoA.reason}`;
  const statusB = resultadoB.status === 'fulfilled'
    ? (resultadoB.value.error ? `Erro: ${resultadoB.value.error.message}` : 'Sucesso')
    : `Rejeitado: ${resultadoB.reason}`;

  console.log('Sessao A:', statusA);
  console.log('Sessao B:', statusB);

  await supabaseA.auth.signOut();
  await supabaseB.auth.signOut();

  // ============================================================
  // ESTADO FINAL
  // ============================================================
  console.log('\n=== ESTADO FINAL ===');
  const { data: imagensFinais } = await supabaseProbe
    .from('imagem')
    .select('id, produto_id, principal')
    .eq('produto_id', 1)
    .order('id');
  console.log('Imagens do produto 1 (final):', JSON.stringify(imagensFinais));

  if (imagensFinais) {
    const principais = imagensFinais.filter(i => i.principal === true);
    console.log('Imagens principais apos correncia:', principais.length);
    if (principais.length === 1) {
      console.log('PASS: Apenas uma imagem principal apos correncia');
    } else {
      console.log('FALHA: Mais de uma imagem principal apos correncia');
    }
  }

  // Comparar com estado inicial
  if (imagensIniciais && imagensFinais) {
    const inicialStr = JSON.stringify(imagensIniciais);
    const finalStr = JSON.stringify(imagensFinais);
    if (inicialStr === finalStr) {
      console.log('PASS: Estado final igual ao inicial');
    } else {
      console.log('AVISO: Estado final diferente do inicial');
    }
  }

  console.log('\n=== FIM DOS TESTES ISOLADOS ===');
}

main().catch(e => { console.error(e); process.exit(1); });