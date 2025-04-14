import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, bookmarks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Get user's bookmarks
    const userBookmarks = await dbClient
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, user.id))
      .all();
    
    return NextResponse.json({
      success: true,
      bookmarks: userBookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving bookmarks' },
      { status: 500 }
    );
  }
}
