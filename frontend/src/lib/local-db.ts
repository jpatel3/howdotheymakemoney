import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create SQLite database instance
const sqlite = new Database('local.db');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with schema
export async function initDatabase() {
  // Create tables if they don't exist
  await db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      primaryRevenue TEXT,
      revenueBreakdown TEXT,
      businessModel TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      image TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      companyId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (companyId) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      companyId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (companyId) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS companyRequests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      companyName TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
} 