import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDB, votes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    
    // Get request body
    const { companyId, voteType } = await request.json();
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Valid vote type (upvote or downvote) is required' },
        { status: 400 }
      );
    }
    
    // Get D1 database binding
    const db = request.env.DB;
    const dbClient = getDB(db);
    
    // Check if vote already exists
    const existingVote = await dbClient
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, user.id),
          eq(votes.companyId, companyId)
        )
      )
      .get();
    
    if (existingVote) {
      // Update existing vote if type is different
      if (existingVote.voteType !== voteType) {
        await dbClient
          .update(votes)
          .set({ voteType })
          .where(eq(votes.id, existingVote.id));
        
        return NextResponse.json({
          success: true,
          message: 'Vote updated successfully'
        });
      } else {
        // Remove vote if same type (toggle behavior)
        await dbClient
          .delete(votes)
          .where(eq(votes.id, existingVote.id));
        
        return NextResponse.json({
          success: true,
          message: 'Vote removed successfully'
        });
      }
    }
    
    // Create new vote
    await dbClient
      .insert(votes)
      .values({
        userId: user.id,
        companyId,
        voteType
      });
    
    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Vote error:', error);
    
    // Handle authentication error
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An error occurred while processing vote' },
      { status: 500 }
    );
  }
}
