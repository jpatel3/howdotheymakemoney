import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';
import { companies, users } from './schema'; // Import companies and users schema specifically
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

declare global {
  interface Env {
    DB: D1Database;
  }
}

// For local development
let localDb: ReturnType<typeof drizzleSqlite> | null = null;

// Make the function async to await initDatabase
async function initLocalDB() {
  if (!localDb) {
    try {
      const sqlite = new Database('local.db'); // Removed verbose logging for clarity
      // Await the database initialization (table creation)
      await initDatabase(sqlite); 
      localDb = drizzleSqlite(sqlite, { schema });
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      throw error;
    }
  }
  return localDb;
}

// Simple slug generation function
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')      // Replace & with 'and'
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except hyphen
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')      // Trim - from start of text
    .replace(/-+$/, '');     // Trim - from end of text
}

// Helper function to initialize the database and seed data
export async function initDatabase(sqlite: Database.Database) { 
  if (!process.env.DB) { 
    console.log('Running local database migrations...');
    await sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        logo TEXT,
        website TEXT,
        headquarters TEXT,
        primary_revenue TEXT NOT NULL,
        revenue_breakdown TEXT NOT NULL,
        business_model TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
      
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0, -- Use INTEGER for boolean, default 0 (false)
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );

      CREATE TABLE IF NOT EXISTS company_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Local database migrations complete.');

    console.log('Seeding sample companies...');
    const db = drizzleSqlite(sqlite, { schema });

    // Add website and headquarters to sample data
    const sampleCompaniesData = [
      { name: 'Tesla', website: 'https://tesla.com', headquarters: 'Austin, Texas, USA' },
      { name: 'Google', website: 'https://abc.xyz', headquarters: 'Mountain View, California, USA' },
      { name: 'Microsoft', website: 'https://microsoft.com', headquarters: 'Redmond, Washington, USA' },
      { name: 'Uber', website: 'https://uber.com', headquarters: 'San Francisco, California, USA' },
      { name: 'Robinhood', website: 'https://robinhood.com', headquarters: 'Menlo Park, California, USA' }
    ];

    const sampleCompanies = sampleCompaniesData.map(c => ({
      name: c.name,
      slug: generateSlug(c.name),
      website: c.website,
      headquarters: c.headquarters,
      description: c.name === 'Tesla' ? 'Designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.' : 
                   c.name === 'Google' ? 'Specializes in Internet-related services and products, including online advertising technologies, search engine, cloud computing, software, and hardware.' :
                   c.name === 'Microsoft' ? 'Develops, licenses, and supports software, services, devices, and solutions.' :
                   c.name === 'Uber' ? 'Develops and operates technology applications that connect consumers with independent providers of ride services, and food and grocery delivery services.' :
                   c.name === 'Robinhood' ? 'Offers commission-free investing in stocks, ETFs, options, and cryptocurrencies through a mobile app and website.' : '',
      logo: `https://logo.clearbit.com/${c.name.toLowerCase()}.com`, 
      primaryRevenue: c.name === 'Tesla' ? 'Automotive Sales' : 
                      c.name === 'Google' ? 'Advertising' :
                      c.name === 'Microsoft' ? 'Cloud Services (Azure)' :
                      c.name === 'Uber' ? 'Mobility (Ridesharing)' :
                      c.name === 'Robinhood' ? 'Transaction-Based Revenues (Payment for Order Flow)' : '',
      revenueBreakdown: JSON.stringify(
          c.name === 'Tesla' ? { 'Automotive': '81%', 'Energy Generation and Storage': '7%', 'Services and Other': '12%' } :
          c.name === 'Google' ? { 'Google Search & other': '57%', 'YouTube ads': '11%', 'Google Network': '9%', 'Google Cloud': '9%', 'Google other': '14%' } :
          c.name === 'Microsoft' ? { 'Server products and cloud services': '41%', 'Office products and cloud services': '24%', 'Windows': '10%', 'Gaming': '9%', 'LinkedIn': '7%', 'Search advertising': '5%', 'Devices': '3%', 'Other': '1%' } :
          c.name === 'Uber' ? { 'Mobility': '50%', 'Delivery': '35%', 'Freight': '15%' } :
          c.name === 'Robinhood' ? { 'Transaction-based': '60%', 'Net interest': '25%', 'Other': '15%' } : {}
      ),
      businessModel: c.name === 'Tesla' ? 'Direct sales of electric vehicles, solar energy solutions, and energy storage products. Additional revenue from services, charging network, and regulatory credits.' :
                     c.name === 'Google' ? 'Primarily generates revenue from online advertising (Google Ads) through its search engine and YouTube. Also earns from cloud services (GCP), hardware sales (Pixel, Nest), and Play Store commissions.' :
                     c.name === 'Microsoft' ? 'Diverse revenue streams including software licenses (Windows, Office), cloud services (Azure, Microsoft 365), hardware (Surface, Xbox), gaming subscriptions, LinkedIn services, and advertising.' :
                     c.name === 'Uber' ? 'Acts as a marketplace connecting drivers/couriers with riders/eaters, taking a commission on each transaction. Also operates a freight logistics platform.' :
                     c.name === 'Robinhood' ? 'Generates revenue primarily from payment for order flow (PFOF), margin lending interest, subscription fees (Robinhood Gold), and cash management services.' : ''
    }));

    // Re-populate full data for seeding (keeping it concise here for the edit)
    const fullSampleCompanies = sampleCompaniesData.map(c => {
      const slug = generateSlug(c.name);
      let description = '', primaryRevenue = '', revenueBreakdown = '{}', businessModel = '';
      // (Re-insert the full descriptive data logic here based on c.name)
      if (c.name === 'Tesla') { 
         description = 'Designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.';
         primaryRevenue = 'Automotive Sales';
         revenueBreakdown = JSON.stringify({ 'Automotive': '81%', 'Energy Generation and Storage': '7%', 'Services and Other': '12%' });
         businessModel = 'Direct sales of electric vehicles, solar energy solutions, and energy storage products. Additional revenue from services, charging network, and regulatory credits.';
      } else if (c.name === 'Google') { 
         description = 'Specializes in Internet-related services and products, including online advertising technologies, search engine, cloud computing, software, and hardware.';
         primaryRevenue = 'Advertising';
         revenueBreakdown = JSON.stringify({ 'Google Search & other': '57%', 'YouTube ads': '11%', 'Google Network': '9%', 'Google Cloud': '9%', 'Google other': '14%' });
         businessModel = 'Primarily generates revenue from online advertising (Google Ads) through its search engine and YouTube. Also earns from cloud services (GCP), hardware sales (Pixel, Nest), and Play Store commissions.';
      } else if (c.name === 'Microsoft') {
         description = 'Develops, licenses, and supports software, services, devices, and solutions.';
         primaryRevenue = 'Cloud Services (Azure)';
         revenueBreakdown = JSON.stringify({ 'Server products and cloud services': '41%', 'Office products and cloud services': '24%', 'Windows': '10%', 'Gaming': '9%', 'LinkedIn': '7%', 'Search advertising': '5%', 'Devices': '3%', 'Other': '1%' });
         businessModel = 'Diverse revenue streams including software licenses (Windows, Office), cloud services (Azure, Microsoft 365), hardware (Surface, Xbox), gaming subscriptions, LinkedIn services, and advertising.';
      } else if (c.name === 'Uber') {
         description = 'Develops and operates technology applications that connect consumers with independent providers of ride services, and food and grocery delivery services.';
         primaryRevenue = 'Mobility (Ridesharing)';
         revenueBreakdown = JSON.stringify({ 'Mobility': '50%', 'Delivery': '35%', 'Freight': '15%' });
         businessModel = 'Acts as a marketplace connecting drivers/couriers with riders/eaters, taking a commission on each transaction. Also operates a freight logistics platform.';
      } else if (c.name === 'Robinhood') {
         description = 'Offers commission-free investing in stocks, ETFs, options, and cryptocurrencies through a mobile app and website.';
         primaryRevenue = 'Transaction-Based Revenues (Payment for Order Flow)';
         revenueBreakdown = JSON.stringify({ 'Transaction-based': '60%', 'Net interest': '25%', 'Other': '15%' });
         businessModel = 'Generates revenue primarily from payment for order flow (PFOF), margin lending interest, subscription fees (Robinhood Gold), and cash management services.';
      }
      
      return {
        name: c.name,
        slug: slug,
        website: c.website,
        headquarters: c.headquarters,
        description: description,
        logo: `https://logo.clearbit.com/${c.name.toLowerCase()}.com`,
        primaryRevenue: primaryRevenue,
        revenueBreakdown: revenueBreakdown,
        businessModel: businessModel,
      };
    });

    for (const company of fullSampleCompanies) { // Use the array with full data
      const existing = await db.select({ id: companies.id }).from(companies).where(eq(companies.slug, company.slug)).limit(1).get();
      if (!existing) {
        await db.insert(companies).values(company);
        console.log(`  Inserted ${company.name} (slug: ${company.slug})`);
      } else {
        console.log(`  Skipped ${company.name} (slug: ${company.slug} already exists)`);
      }
    }
    console.log('Sample company seeding complete.');

    // Optional: Seed a default admin user
    console.log('Seeding default admin user...');
    const adminEmail = 'admin@app.com';
    const adminExists = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1).get();
    if (!adminExists) {
        const hashedPassword = await hash('password', 10); // Use bcryptjs hash
        await db.insert(users).values({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true // Set admin flag to true
        });
        console.log(`  Inserted default admin (${adminEmail}) with password 'password'.`);
    } else {
        console.log(`  Skipped default admin (${adminEmail}) - already exists.`);
    }
  }
}

// Make getDB async as it now calls async initLocalDB
export async function getDB(dbBinding?: D1Database) {
  try {
    // If we have a D1 binding (Edge Runtime), use it
    if (dbBinding) {
      // Note: D1 initialization might need its own async handling if schema needs creation
      return drizzle(dbBinding); 
    }

    // For local development, use SQLite
    return await initLocalDB();
  } catch (error) {
    console.error('Failed to get database instance:', error);
    throw error;
  }
} 