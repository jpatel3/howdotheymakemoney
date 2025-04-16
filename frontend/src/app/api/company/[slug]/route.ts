import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { companies } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Assuming CompanyData structure includes fields from the companies table
export interface CompanyData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website?: string | null;
  headquarters?: string | null;
  primaryRevenue: string;
  revenueBreakdown: string;
  businessModel: string;
  createdAt: number | string;
  // Add other fields expected by the frontend component if necessary
  // e.g., founded?: number | null; headquarters?: string | null; etc.
}

// Note: Context includes params object with the dynamic segment
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!slug) {
    return NextResponse.json({ error: 'Company slug is required' }, { status: 400 });
  }

  try {
    const db = await getDB();
    if (!db) {
      console.error('Company API error: Failed to get DB instance');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // Query by slug instead of id
    const company = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1).get();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Transform the result to match CompanyData, especially createdAt
    const companyResult: CompanyData = {
      ...company,
      website: company.website,
      headquarters: company.headquarters,
      createdAt: company.createdAt.getTime(), // Convert Date to timestamp number
    };

    return NextResponse.json(companyResult);

  } catch (error) {
    console.error(`Error fetching company ${slug}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 