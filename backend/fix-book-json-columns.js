const { Client } = require('pg');

const DB_URL =
  'postgresql://postgres.ogrrtkutykmoobtcycfu:23021983Lazare.@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const FIELDS = ['keyInsights', 'chapters', 'quotes', 'actionItems'];

function safeParse(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return [];
  const s = value.trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('🔎 Normalizing Book JSON fields to valid JSON strings...');

  const res = await client.query(
    'SELECT id, "keyInsights", chapters, quotes, "actionItems" FROM "Book"'
  );

  let updated = 0;
  for (const row of res.rows) {
    const data = {};
    let needsUpdate = false;

    for (const f of FIELDS) {
      const parsed = safeParse(row[f]);
      const normalized = JSON.stringify(parsed);
      if (row[f] === null || row[f] === undefined || String(row[f]) !== normalized) {
        data[f] = normalized;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await client.query(
        'UPDATE "Book" SET "keyInsights"=$2, chapters=$3, quotes=$4, "actionItems"=$5, "updatedAt"=NOW() WHERE id=$1',
        [row.id, data.keyInsights ?? row.keyInsights, data.chapters ?? row.chapters, data.quotes ?? row.quotes, data.actionItems ?? row.actionItems]
      );
      updated++;
      if (updated % 50 === 0) console.log(`  ✅ Updated ${updated}/${res.rows.length}`);
    }
  }

  console.log(`✅ Normalization complete. Updated rows: ${updated}`);

  console.log('\n🔧 Converting columns to JSONB...');
  await client.query('BEGIN');
  try {
    await client.query(`
      ALTER TABLE "Book"
        ALTER COLUMN "keyInsights" TYPE jsonb USING COALESCE(NULLIF("keyInsights", '')::jsonb, '[]'::jsonb),
        ALTER COLUMN chapters TYPE jsonb USING COALESCE(NULLIF(chapters, '')::jsonb, '[]'::jsonb),
        ALTER COLUMN quotes TYPE jsonb USING COALESCE(NULLIF(quotes, '')::jsonb, '[]'::jsonb),
        ALTER COLUMN "actionItems" TYPE jsonb USING COALESCE(NULLIF("actionItems", '')::jsonb, '[]'::jsonb);
    `);

    await client.query(`
      ALTER TABLE "Book"
        ALTER COLUMN "keyInsights" SET DEFAULT '[]'::jsonb,
        ALTER COLUMN chapters SET DEFAULT '[]'::jsonb,
        ALTER COLUMN quotes SET DEFAULT '[]'::jsonb,
        ALTER COLUMN "actionItems" SET DEFAULT '[]'::jsonb;
    `);

    await client.query('COMMIT');
    console.log('✅ JSONB conversion done');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }

  // Verify one example
  const exampleId = '8232030c-51bf-4929-88bf-07544d46bf7d';
  const ex = await client.query(
    'SELECT "keyInsights", chapters FROM "Book" WHERE id=$1',
    [exampleId]
  );
  console.log('\nExample book field types in pg driver:');
  console.log('keyInsights:', ex.rows[0]?.keyInsights);
  console.log('chapters:', ex.rows[0]?.chapters);

  await client.end();
}

main().catch((e) => {
  console.error('❌ Failed:', e.message);
  process.exit(1);
});
