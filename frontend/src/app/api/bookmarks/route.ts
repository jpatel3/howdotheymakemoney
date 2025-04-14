import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, bookmarks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get request body
    const { companyId } = await request.json();
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Check if bookmark already exists
    const existingBookmark = await dbClient
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.companyId, companyId)
        )
      )
      .get();
    
    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Company is already bookmarked' },
        { status: 409 }
      );
    }
    
    // Create bookmark
    await dbClient
      .insert(bookmarks)
      .values({
        userId: user.id,
        companyId
      });
    
    return NextResponse.json({
      success: true,
      message: 'Company bookmarked successfully'
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while bookmarking the company' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get company ID from URL
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Delete bookmark
    const result = await dbClient
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.companyId, companyId)
        )
      );
    
    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while removing the bookmark' },
      { status: 500 }
    );
  }
}
