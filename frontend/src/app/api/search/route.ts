import { NextRequest, NextResponse } from 'next/server';
import { companies } from '@/lib/schema';
import { getDB } from '@/lib/db';
import { sql, like } from 'drizzle-orm';

// Define search result type
export interface CompanySearchResult {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  primaryRevenue: string;
  revenueBreakdown: string;
  businessModel: string;
}

// Remove edge runtime since we're using SQLite locally
// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const db = await getDB();
    
    // Ensure db instance is valid before proceeding
    if (!db) {
      console.error('Search error: Failed to get DB instance');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // Use like with sql.raw('lower(...)') for case-insensitive search in SQLite
    const searchQuery = `%${query.toLowerCase()}%`;
    const results = await db
      .select()
      .from(companies)
      .where(like(sql.raw(`lower(${companies.name.name})`), searchQuery))
      // Example for description:
      // .orWhere(like(sql.raw(`lower(${companies.description.name})`), searchQuery))
      .limit(10); 

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    // Check if the error is the specific TypeError we saw before
    if (error instanceof TypeError && error.message.includes('Cannot read properties of undefined (reading \'select\')')) {
      return NextResponse.json({ error: 'Database query error. Check DB connection.' }, { status: 500 });
    }    
    return NextResponse.json({ error: 'Internal server error during search' }, { status: 500 });
  }
}
