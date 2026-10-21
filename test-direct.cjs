const { Client } = require('pg');

const DATABASE_URL = process.env.DIRECT_URL || 'postgresql://postgres.bmqxgibhuzekxpcgosap:@An2907081831@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Teste 3: RPC com imagem inexistente (como postgres/service_role)
  console.log('=== TESTE 3: Imagem inexistente (service_role) ===');
  try {
    await client.query("SELECT public.produto_imagem_definir_principal(1, 999999)");
    console.log('FALHA: RPC nao foi bloqueada');
  } catch (e) {
    console.log('Resultado:', e.message.split('\n')[0]);
  }

  // Teste 5: Concorrência com duas conexões
  console.log('\n=== TESTE 5: Concorrência ===');
  const c1 = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const c2 = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c1.connect();
  await c2.connect();

  // Duas transações concorrentes
  const [r1, r2] = await Promise.allSettled([
    (async () => {
      await c1.query('BEGIN');
      await c1.query("SELECT public.produto_imagem_definir_principal(1, 1)");
      await c1.query('COMMIT');
      return 'Sucesso';
    })(),
    (async () => {
      await c2.query('BEGIN');
      await c2.query("SELECT public.produto_imagem_definir_principal(1, 2)");
      await c2.query('COMMIT');
      return 'Sucesso';
    })(),
  ]);

  console.log('Sessao A:', r1.status === 'fulfilled' ? r1.value : `Rejeitado: ${r1.reason}`);
  console.log('Sessao B:', r2.status === 'fulfilled' ? r2.value : `Rejeitado: ${r2.reason}`);

  // Verificar estado final
  const final = await client.query(`
    SELECT id, produto_id, principal FROM produto_imagem
    WHERE produto_id = 1 ORDER BY id
  `);
  console.log('\nEstado final:', JSON.stringify(final.rows));
  const principais = final.rows.filter(r => r.principal === true);
  console.log('Imagens principais:', principais.length);

  await c1.end();
  await c2.end();
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });