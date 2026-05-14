import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

const users = [
  { name: 'Admin User', email: 'admin@campus-ai.in', password: 'admin123', role: 'admin' },
  { name: 'Reviewer', email: 'reviewer@campus-ai.in', password: 'review123', role: 'reviewer' },
];

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 10);
  await sql`INSERT INTO users (name, email, password_hash, role) VALUES (${u.name}, ${u.email}, ${hash}, ${u.role}) ON CONFLICT (email) DO NOTHING`;
  console.log('seeded', u.email);
}
console.log('done');
