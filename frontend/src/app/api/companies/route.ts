import { NextResponse } from 'next/server';
import { getDB } from '@/lib/server/db';
import { companies } from '@/lib/server/schema';

// Remove edge runtime since we're using SQLite locally
// export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const db = await getDB();

    // Ensure db instance is valid
    if (!db) {
      console.error('Companies API error: Failed to get DB instance');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    const allCompanies = await db.select().from(companies).orderBy(companies.name); // Fetch all, order by name

    return NextResponse.json(allCompanies);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal server error fetching companies' }, { status: 500 });
  }
} 