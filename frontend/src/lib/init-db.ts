import Database from 'better-sqlite3';

// Initialize the database
const db = new Database('local.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    notification_preferences TEXT DEFAULT '{"email_new_companies":true,"email_site_updates":true}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
  );

  -- Initialize counters if they don't exist
  INSERT OR IGNORE INTO counters (name, value) VALUES ('registered_users', 0);
`); 