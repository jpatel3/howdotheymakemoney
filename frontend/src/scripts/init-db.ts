import { initDatabase } from '../lib/db';

async function main() {
  console.log('Initializing database...');
  await initDatabase();
  console.log('Database initialized successfully!');
}

main().catch(console.error); 