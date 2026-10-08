import { pool } from '../config/db.js';

async function verify() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\n================ KRILEA DATABASE REPORT ================`);
    console.log(`Total Tables Found: ${res.rows.length}\n`);

    for (const row of res.rows) {
      const countRes = await pool.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`  ✓ ${row.table_name.padEnd(25)} : ${countRes.rows[0].count} records`);
    }

    console.log(`========================================================\n`);
  } catch (err) {
    console.error('Database query error:', err);
  } finally {
    await pool.end();
  }
}

verify();
