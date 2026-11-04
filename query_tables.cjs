const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.bmqxgibhuzekxpcgosap:@An2907081831@aws-0-sa-east-1.pooler.supabase.com:5432/postgres' });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name", (err, res) => {
  if (err) { console.error(err); process.exit(1); }
  console.log(res.rows.map(r => r.table_name).join('\n'));
  pool.end();
});