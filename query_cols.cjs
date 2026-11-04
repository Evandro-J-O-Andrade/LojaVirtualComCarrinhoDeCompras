const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.bmqxgibhuzekxpcgosap:@An2907081831@aws-0-sa-east-1.pooler.supabase.com:5432/postgres' });
const tables = ['kit_composicao', 'evento', 'auditoria'];
pool.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name = ANY($1) ORDER BY table_name, ordinal_position`, [tables], (err, res) => {
  if (err) { console.error(err); process.exit(1); }
  let current = '';
  res.rows.forEach(r => {
    if (r.table_name !== current) { current = r.table_name; console.log('\n=== ' + current + ' ==='); }
    console.log('  ' + r.column_name + ' (' + r.data_type + ')');
  });
  pool.end();
});