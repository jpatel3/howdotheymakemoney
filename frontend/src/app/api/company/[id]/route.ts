import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export type CompanyDetails = {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  primaryRevenue: string;
  revenueBreakdown: string;
  businessModel: string;
  createdAt: string;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length) {
      return NextResponse.json(
        { success: false, message: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company[0].id,
        name: company[0].name,
        description: company[0].description,
        logo: company[0].logo,
        primaryRevenue: company[0].primaryRevenue,
        revenueBreakdown: company[0].revenueBreakdown,
        businessModel: company[0].businessModel,
        createdAt: company[0].createdAt,
      },
    });
  } catch (error) {
    console.error('Company fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching company details' },
      { status: 500 }
    );
  }
} 