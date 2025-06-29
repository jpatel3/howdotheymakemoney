import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`), // Ensure correct default for SQLite
});

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  website: text('website'),
  headquarters: text('headquarters'),
  primaryRevenue: text('primary_revenue').notNull(),
  revenueBreakdown: text('revenue_breakdown').notNull(), // Store as TEXT (JSON string)
  businessModel: text('business_model').notNull(),
  requestedByUserId: integer('requested_by_user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`), // Ensure correct default for SQLite
});

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`), // Ensure correct default for SQLite
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`), // Ensure correct default for SQLite
});

// New table to store fetched company data pending review
export const companyUpdates = sqliteTable('company_updates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id),
  fetchedData: text('fetched_data').notNull(), // Store fetched data as JSON string
  status: text('status').notNull().default('pending_review'), // 'pending_review', 'approved', 'rejected'
  requesterUserId: integer('requester_user_id') // Admin who initiated the refresh
    .notNull()
    .references(() => users.id),
  reviewerUserId: integer('reviewer_user_id').references(() => users.id), // Admin who reviewed
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
});

export const companyRequests = sqliteTable('company_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  companyName: text('company_name').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`), // Ensure correct default for SQLite
}); 