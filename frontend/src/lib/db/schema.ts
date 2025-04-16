import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Users table schema
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
  lastLogin: text('last_login')
});

// User profiles table schema
export const userProfiles = sqliteTable('user_profiles', {
  userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  notificationPreferences: text('notification_preferences').default('{"email_new_companies":true,"email_site_updates":true}'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});

// Companies table schema
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  logo: text('logo'),
  primaryRevenue: text('primary_revenue').notNull(),
  revenueBreakdown: text('revenue_breakdown').notNull(),
  businessModel: text('business_model').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP')
});

// Bookmarks table schema
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: text('company_id').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP')
}, (table) => {
  return {
    userCompanyUnique: primaryKey({ columns: [table.userId, table.companyId] })
  };
});

// Company requests table schema
export const companyRequests = sqliteTable('company_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyName: text('company_name').notNull(),
  description: text('description'),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending'),
  votes: integer('votes').default(0),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});

// Comments table schema
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: text('company_id').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
});

// Votes table schema
export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: text('company_id').notNull(),
  voteType: text('vote_type').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP')
}, (table) => {
  return {
    userCompanyUnique: primaryKey({ columns: [table.userId, table.companyId] })
  };
});

// Counters table schema
export const counters = sqliteTable('counters', {
  name: text('name').primaryKey(),
  value: integer('value').notNull().default(0)
});

// Access logs table schema
export const accessLogs = sqliteTable('access_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ip: text('ip'),
  path: text('path'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  accessedAt: text('accessed_at').notNull().default('CURRENT_TIMESTAMP')
});

// Create a database instance
let db: DrizzleD1Database | null = null;

export function getDB(dbBinding: D1Database): DrizzleD1Database {
  if (!db) {
    db = drizzle(dbBinding);
  }
  return db;
}

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
