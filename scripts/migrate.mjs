import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync('src/db/schema.sql', 'utf-8');
for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
  await sql.query(stmt);
  console.log('Ran:', stmt.slice(0, 60));
}
console.log('MIGRATION_DONE');
