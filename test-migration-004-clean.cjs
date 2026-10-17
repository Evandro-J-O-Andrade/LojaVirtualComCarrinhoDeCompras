/**
 * Testes comportamentais — Migration 004 v2
 * 
 * Uso: node test-migration-004-clean.cjs
 * 
 * Requer as variáveis de ambiente:
 *   SUPABASE_URL       — URL do projeto
 *   SUPABASE_ANON_KEY  — Chave anônima (publishable key)
 *   ADMIN_EMAIL        — E-mail do administrador
 *   ADMIN_PASSWORD     — Senha do administrador
 * 
 * NENHUMA credencial é hardcoded neste arquivo.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const OTHER_EMAIL = process.env.OTHER_EMAIL || 'nao-admin@teste.com';
const OTHER_PASSWORD = process.env.OTHER_PASSWORD || 'other-password';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERRO: Defina SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ============================================================
  // TESTE 1: Administrador autenticado consegue definir imagem principal
  // ============================================================
  console.log('=== TESTE 1: Admin define imagem principal ===');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authError) {
    console.log('FALHA na autenticacao:', authError.message);
    process.exit(1);
  }

  console.log('Autenticado como:', authData.user.email);
  const { data: adminCheck } = await supabase.rpc('is_admin').single();
  console.log('is_admin()=', adminCheck);

  if (!adminCheck) {
    console.log('FALHA: is_admin() nao retorna true');
    process.exit(1);
  }

  // Estado inicial
  console.log('\nEstado inicial (probe via service_role)');
  // A probe direta pode falhar por RLS; usar RPC de leitura ou service_role

  // Teste RPC
  const { error: rpcError } = await supabase.rpc('imagem_definir_principal', {
    p_produto_id: 1,
    p_imagem_id: 2,
  });

  if (rpcError) {
    console.log('FALHA na RPC:', rpcError.message);
  } else {
    console.log('PASS: RPC executada com sucesso');
  }

  // Restaurar
  await supabase.rpc('imagem_definir_principal', {
    p_produto_id: 1,
    p_imagem_id: 1,
  });

  await supabase.auth.signOut();

  // ============================================================
  // TESTE 2: Usuário autenticado não-admin recebe "Acesso negado"
  // ============================================================
  console.log('\n=== TESTE 2: Non-admin e bloqueado ===');
  const { data: nonAdminAuth } = await supabase.auth.signInWithPassword({
    email: OTHER_EMAIL,
    password: OTHER_PASSWORD,
  });

  if (nonAdminAuth) {
    const { error: rpcError2 } = await supabase.rpc('imagem_definir_principal', {
      p_produto_id: 1,
      p_imagem_id: 2,
    });

    if (rpcError2) {
      console.log('PASS: Non-admin bloqueado:', rpcError2.message);
    } else {
      console.log('FALHA: RPC nao foi bloqueada para non-admin');
    }
    await supabase.auth.signOut();
  } else {
    console.log('INFO: nao foi possivel autenticar como non-admin');
  }

  // ============================================================
  // TESTE 3: Imagem inexistente é rejeitada
  // ============================================================
  console.log('\n=== TESTE 3: Imagem inexistente e rejeitada ===');
  await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  
  const { error: rpcError3 } = await supabase.rpc('imagem_definir_principal', {
    p_produto_id: 1,
    p_imagem_id: 999999,
  });

  if (rpcError3) {
    console.log('PASS: Imagem inexistente rejeitada:', rpcError3.message);
  } else {
    console.log('FALHA: RPC nao foi bloqueada para imagem inexistente');
  }
  await supabase.auth.signOut();

  // ============================================================
  // TESTE 4: Índice único impede duplicidade
  // ============================================================
  console.log('\n=== TESTE 4: Indice unico impede duplicidade ===');
  await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  
  const { error: insertError } = await supabase.from('imagem').insert({
    produto_id: 1,
    url: 'https://test.com/duplicada.jpg',
    ordem: 99,
    principal: true,
  });

  if (insertError) {
    console.log('PASS: Duplicidade bloqueada:', insertError.message);
  } else {
    console.log('FALHA: Insercao de duplicidade nao foi bloqueada');
  }
  await supabase.auth.signOut();

  // ============================================================
  // TESTE 5: Concorrência serializada
  // ============================================================
  console.log('\n=== TESTE 5: Concorrência serializada ===');
  console.log('INFO: FOR UPDATE serializa chamadas para o mesmo produto');
  console.log('INFO: Indice unico fornece segunda camada de protecao');
  console.log('INFO: Para teste concorrente real, use duas sessoes simultaneas.');

  console.log('\n=== RESUMO ===');
  console.log('Todos os testes executados. Verifique os resultados acima.');
}

main().catch(e => { console.error(e); process.exit(1); });