import { db, initDatabase } from '../lib/db';
import { companies, users, bookmarks, comments, companyRequests } from '../lib/schema';

async function main() {
  // Initialize database (only creates tables in local development)
  await initDatabase();

  // Example queries
  console.log('=== Companies ===');
  const allCompanies = await db.select().from(companies);
  console.log(allCompanies);

  console.log('\n=== Users ===');
  const allUsers = await db.select().from(users);
  console.log(allUsers);

  console.log('\n=== Bookmarks ===');
  const allBookmarks = await db.select().from(bookmarks);
  console.log(allBookmarks);

  console.log('\n=== Comments ===');
  const allComments = await db.select().from(comments);
  console.log(allComments);

  console.log('\n=== Company Requests ===');
  const allRequests = await db.select().from(companyRequests);
  console.log(allRequests);
}

main().catch(console.error); 