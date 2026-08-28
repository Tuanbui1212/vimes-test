import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically execute all pending database migration files on startup
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    // 1. Create tracking table for schema migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read all SQL migration files sorted by name
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsDir)) {
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    // 3. Get list of already executed migrations
    const res = await client.query(`SELECT name FROM schema_migrations;`);
    const executedMigrations = new Set(res.rows.map((row) => row.name));

    // 4. Run any pending migration in order
    for (const file of files) {
      if (!executedMigrations.has(file)) {
        console.log(`[Migration] Applying ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query(`INSERT INTO schema_migrations (name) VALUES ($1);`, [file]);
        await client.query('COMMIT');

        console.log(`[Migration] Applied ${file} successfully.`);
      }
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migration] Failed to run database migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}
