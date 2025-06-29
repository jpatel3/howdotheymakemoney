import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getDB } from '@/lib/server/db';
import { bookmarks } from '@/lib/server/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get database client (getDB handles local vs. D1)
    // const dbBinding = request.env.DB; // Remove Cloudflare specific binding access
    const dbClient = await getDB(undefined); // Pass undefined explicitly
    
    // Get user's bookmarks
    const userBookmarks = await dbClient
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, user.id))
      // .all(); // Drizzle with better-sqlite3 usually uses .get() or awaits the query directly

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
