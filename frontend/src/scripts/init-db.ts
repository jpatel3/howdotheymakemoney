import { initDatabase } from '../lib/server/db';
import Database from 'better-sqlite3';

async function main() {
  console.log('Initializing database...');
  const sqlite = new Database('local.db');
  await initDatabase(sqlite);
  sqlite.close();
  console.log('Database initialized successfully!');
}

main().catch(err => {
  console.error("Database initialization failed:", err);
  process.exit(1);
}); 