const { Client } = require('pg');

const DATABASE_URL = process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error('ERRO: Defina DIRECT_URL no ambiente');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Estado do produto 1
  console.log('=== ESTADO DO PRODUTO 1 ===');
  const imagens = await client.query(`
    SELECT pi.id, pi.produto_id, pi.url, pi.ordem, pi.principal
    FROM produto_imagem pi
    WHERE pi.produto_id = 1
    ORDER BY pi.id
  `);
  console.log(JSON.stringify(imagens.rows, null, 2));

  // Duplicidades
  console.log('\n=== DUPLICIDADES ===');
  const dup = await client.query(`
    SELECT produto_id, COUNT(*) AS qtd_principal
    FROM produto_imagem
    WHERE principal = true
    GROUP BY produto_id
    HAVING COUNT(*) > 1
  `);
  console.log('Produtos com duplicidade:', dup.rows.length === 0 ? 'NENHUM' : JSON.stringify(dup.rows));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });