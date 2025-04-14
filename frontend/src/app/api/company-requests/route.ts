import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, companyRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get request body
    const { companyName, description } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Create company request
    await dbClient
      .insert(companyRequests)
      .values({
        companyName,
        description,
        userId: user.id,
        status: 'pending',
        votes: 1 // Start with 1 vote from the requester
      });
    
    return NextResponse.json({
      success: true,
      message: 'Company request submitted successfully'
    });
  } catch (error) {
    console.error('Company request error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while submitting company request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Get URL parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Get company requests
    const requests = await dbClient
      .select()
      .from(companyRequests)
      .where(eq(companyRequests.status, status))
      .limit(limit)
      .offset(offset)
      .orderBy(companyRequests.votes, 'desc')
      .all();
    
    return NextResponse.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get company requests error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving company requests' },
      { status: 500 }
    );
  }
}
