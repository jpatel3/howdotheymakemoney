import { NextRequest, NextResponse } from 'next/server';
import { CompanyData } from '../company/route';
import { reports } from '@/lib/server/schema';
import { getDB } from '@/lib/server/db';
import { eq } from 'drizzle-orm';
import NodeCache from 'node-cache';

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const companyId = url.searchParams.get('id');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Check if report exists in cache
    const cachedReport = await dbClient
      .select()
      .from(reports)
      .where(eq(reports.companyId, companyId))
      .get();
    
    if (cachedReport) {
      // Parse the cached report data
      const reportData: CompanyData = JSON.parse(cachedReport.data as string);
      
      return NextResponse.json({
        success: true,
        report: reportData,
        cached: true,
        cachedAt: cachedReport.updatedAt
      });
    }
    
    return NextResponse.json(
      { error: 'Report not found in cache' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Get cached report error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving the cached report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { companyId, reportData } = await request.json();
    
    if (!companyId || !reportData) {
      return NextResponse.json(
        { error: 'Company ID and report data are required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Check if report already exists
    const existingReport = await dbClient
      .select()
      .from(reports)
      .where(eq(reports.companyId, companyId))
      .get();
    
    if (existingReport) {
      // Update existing report
      await dbClient
        .update(reports)
        .set({
          data: JSON.stringify(reportData),
          updatedAt: new Date().toISOString()
        })
        .where(eq(reports.companyId, companyId));
    } else {
      // Insert new report
      await dbClient
        .insert(reports)
        .values({
          companyId,
          data: JSON.stringify(reportData),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Report cached successfully'
    });
  } catch (error) {
    console.error('Cache report error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while caching the report' },
      { status: 500 }
    );
  }
}
