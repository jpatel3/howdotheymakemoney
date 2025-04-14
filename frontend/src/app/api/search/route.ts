import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/schema';
import { like } from 'drizzle-orm';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search for companies
    const results = await db
      .select()
      .from(companies)
      .where(like(companies.name, `%${query}%`))
      .limit(10);

    return NextResponse.json({
      success: true,
      results: results.map((company) => ({
        id: company.id,
        name: company.name,
        description: company.description,
        logo: company.logo,
        primaryRevenue: company.primaryRevenue,
        revenueBreakdown: company.revenueBreakdown,
        businessModel: company.businessModel,
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during search' },
      { status: 500 }
    );
  }
}
