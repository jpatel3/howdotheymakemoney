import { drizzle } from 'drizzle-orm/d1';
import { D1Database } from '@cloudflare/workers-types';

declare global {
  interface Env {
    DB: D1Database;
  }
}

export const db = drizzle(process.env.DB); 