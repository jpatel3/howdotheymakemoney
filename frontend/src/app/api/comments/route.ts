import { requireAuth } from '@/lib/server/auth';
import { getDB } from '@/lib/server/db';
import { comments, userProfiles } from '@/lib/server/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get request body
    const { companyId, content } = await request.json();
    
    if (!companyId || !content) {
      return NextResponse.json(
        { error: 'Company ID and comment content are required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Create comment
    await dbClient
      .insert(comments)
      .values({
        userId: user.id,
        companyId,
        content
      });
    
    return NextResponse.json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Comment error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while adding comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
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
    
    // Get comments with user profile information
    const results = await dbClient.execute(`
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.user_id,
        up.display_name,
        up.avatar_url
      FROM comments c
      LEFT JOIN user_profiles up ON c.user_id = up.user_id
      WHERE c.company_id = ?
      ORDER BY c.created_at DESC
    `, [companyId]);
    
    return NextResponse.json({
      success: true,
      comments: results.results
    });
  } catch (error) {
    console.error('Get comments error:', error);
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while retrieving comments' },
      { status: 500 }
    );
  }
}
