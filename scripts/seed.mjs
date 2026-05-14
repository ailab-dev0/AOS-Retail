import { neon } from '@neondatabase/serverless';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { config } from 'dotenv';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

function parseCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

const rl = createInterface({ input: createReadStream('TT Data_1st Jan to 7th May (1).csv') });
let lineNum = 0, headers = [];
const rows = [];

for await (const line of rl) {
  lineNum++;
  if (lineNum <= 6) continue;
  if (lineNum === 7) { headers = parseCSVLine(line); continue; }
  const vals = parseCSVLine(line);
  if (vals.length < 2) continue;
  const r = {};
  headers.forEach((h, i) => { r[h.trim()] = (vals[i] || '').replace(/^"|"$/g, '').trim() || null; });
  rows.push(r);
}

console.log(`Parsed ${rows.length} rows`);

const seen = new Set();
const unique = rows.filter(r => {
  const k = r.trackingID;
  if (!k || seen.has(k)) return false;
  seen.add(k); return true;
});
console.log(`Unique rows: ${unique.length}`);

// 50 concurrent inserts per batch — tagged template (neon requirement)
const BATCH = 50;
let inserted = 0, skipped = 0;

function toDate(v) { return v && v !== '-' ? v : null; }

for (let i = 0; i < unique.length; i += BATCH) {
  const chunk = unique.slice(i, i + BATCH);
  const results = await Promise.all(chunk.map(async r => {
    try {
      await sql`
        INSERT INTO entries (tracking_id,spoc_name,subject,category,sub_category,date,start_time,end_time,total_hours,student_name,details,created_date,updated_date,approval_status,comment,uploaded_file_name,approved_by,ecode)
        VALUES (${r.trackingID},${r.SPOC_name},${r.subject},${r.category},${r.subCategory},${toDate(r.date)},${r.startTime},${r.endTime},${r.totalHours},${r.studentName},${r.details},${toDate(r.createdDate)},${r.updatedDate},${r.approvalStatus||'Pending'},${r.comment},${r.uploaded_file_name},${r.approved_by},${r.Ecode})
        ON CONFLICT (tracking_id) DO NOTHING
      `;
      return 1;
    } catch { return 0; }
  }));
  const batchInserted = results.reduce((a, b) => a + b, 0);
  inserted += batchInserted;
  skipped += chunk.length - batchInserted;
  if (i % 500 === 0) console.log(`Progress ${i}/${unique.length} inserted=${inserted} skipped=${skipped}`);
}

console.log('SEED_DONE inserted=' + inserted + ' skipped=' + skipped);
