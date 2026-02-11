import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.apqydhwahkccxlltacas',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres!');

    await client.query('ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_category_check');
    console.log('Dropped old constraint');

    const categories = [
      'auth', 'social_login', 'database', 'deploy', 'email', 'payment',
      'storage', 'monitoring', 'ai', 'other', 'cdn', 'cicd', 'testing',
      'sms', 'push', 'chat', 'search', 'cms', 'analytics', 'media',
      'queue', 'cache', 'logging', 'feature_flags', 'scheduling',
      'ecommerce', 'serverless', 'code_quality', 'automation'
    ];
    const checkList = categories.map(c => `'${c}'`).join(', ');
    const sql = `ALTER TABLE public.services ADD CONSTRAINT services_category_check CHECK (category IN (${checkList}))`;

    await client.query(sql);
    console.log('Added new constraint with social_login!');

    // Verify
    const res = await client.query(
      "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'services_category_check'"
    );
    console.log('Verification:', JSON.stringify(res.rows, null, 2));

    await client.end();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

run();
