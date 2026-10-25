// Angel Commerce — DDL Inspection Script
// Status: READ-ONLY. No mutations. No commits. No pushes.
// Purpose: Inspect real DDL of existing tables before writing reconciliation migration.

const { createRequire } = require('module');
const require = createRequire(__filename);
const { Client } = require('pg');

const DATABASE_URL = process.env.DIRECT_URL;
if (!DATABASE_URL) {
  console.error('DIRECT_URL environment variable is required');
  process.exit(1);
}

const CANONICAL = [
  'categoria', 'fornedor', 'product', 'product_image', 'estoque', 'promocao',
  'carrinho', 'pagamento', 'product_purchase_option', 'product_purchase_option_value',
  'product_attribute', 'product_attribute_value', 'product_variant',
  'product_variant_attribute', 'kit_composition', 'product_category', 'cliente',
  'Endereco', 'carrinho_item', 'PEDIDO', 'PEDIDO_ITEM', 'PEDIDO_STATUS_HISTORICO',
  'FRETE_REGRA', 'ESTOQUE_MOVIMENTACAO', 'ATENDIMENTO', 'ATENDIMENTO_MENSAGEM',
  'EVENTO', 'AUDITORIA', 'orcamento', 'orcamento_item'
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const report = { tables: {}, missing: [], errors: [] };

  for (const table of CANONICAL) {
    try {
      const exists = await client.query(
        `SELECT to_regclass($1) AS r`, [table]
      );
      if (!exists.rows[0].r) {
        report.missing.push(table);
        continue;
      }

      const cols = await client.query(`
        SELECT c.column_name, c.data_type, c.is_nullable, c.column_default,
               c.character_maximum_length, c.numeric_precision, c.numeric_scale
        FROM information_schema.columns c
        WHERE c.table_name = $1
        ORDER BY c.ordinal_position
      `, [table]);

      const pk = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1
        ORDER BY kcu.ordinal_position
      `, [table]);

      const fks = await client.query(`
        SELECT kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_column,
               rc.delete_rule, rc.update_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        LEFT JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
        ORDER BY kcu.ordinal_position
      `, [table]);

      const uniq = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = $1
        ORDER BY kcu.ordinal_position
      `, [table]);

      const checks = await client.query(`
        SELECT cc.check_clause
        FROM information_schema.check_constraints cc
        WHERE cc.table_name = $1
      `, [table]);

      const idx = await client.query(`
        SELECT i.indexname, i.indexdef, i.indisunique, i.indisprimary
        FROM pg_indexes i
        WHERE i.tablename = $1
      `, [table]);

      const rls = await client.query(`
        SELECT r.rlsname, r.rlsenabled
        FROM pg_policy r
        WHERE r.tablename = $1
      `, [table]);

      const triggers = await client.query(`
        SELECT tg.tgname, tg.tgtype::int, pg_get_triggerdef(tg.oid, true) AS def
        FROM pg_trigger tg
        JOIN pg_class c ON c.oid = tg.tgrelid
        WHERE c.relname = $1 AND NOT tgisinternal
      `, [table]);

      report.tables[table] = {
        columns: cols.rows,
        primaryKeys: pk.rows.map(r => r.column_name),
        foreignKeys: fks.rows,
        uniqueConstraints: uniq.rows.map(r => r.column_name),
        checkConstraints: checks.rows.map(r => r.check_clause),
        indexes: idx.rows,
        rlsPolicies: rls.rows,
        triggers: triggers.rows
      };
    } catch (e) {
      report.errors.push({ table, error: e.message });
    }
  }

  // Sequences
  const seqs = await client.query(`
    SELECT s.sequence_name, s.start_value, s.min_value, s.max_value, s.increment
    FROM information_schema.sequences s
    WHERE s.sequence_schema = 'public'
  `);
  report.sequences = seqs.rows;

  // Storage buckets
  try {
    const buckets = await client.query(`SELECT * FROM storage.buckets`);
    report.storageBuckets = buckets.rows;
  } catch (e) {
    report.storageError = e.message;
  }

  // Extensions
  const exts = await client.query(`SELECT extname FROM pg_extension`);
  report.extensions = exts.rows.map(r => r.extname);

  // Functions
  const funcs = await client.query(`
    SELECT p.proname, pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind IN ('f', 'w')
  `);
  report.functions = funcs.rows;

  // Views
  const views = await client.query(`
    SELECT v.viewname, pg_get_viewdef(v.oid, true) AS def
    FROM pg_views v
    WHERE v.schemaname = 'public'
  `);
  report.views = views.rows;

  await client.end();
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });